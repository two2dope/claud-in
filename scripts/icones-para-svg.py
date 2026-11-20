"""Converte os ícones do QG (pixel art gerada no Flow, fundo magenta) em SVG de caminhos para a faixa do Claudin.

Uso:
  python scripts/icones-para-svg.py <pasta-dos-icones> [--lado 16] [--cores 8] [--saida hooks/icones-arte.ts] [--prever pagina.html]

Cada ícone escolhido (ESCOLHA, abaixo) passa por:
  1. fundo magenta virando transparente (por distância de cor, para pegar a borda rosada);
  2. recorte no que sobrou e redução para lado x lado, mantendo a proporção e centrando;
  3. paleta própria de no máximo N cores, sem dithering;
  4. um <path> por cor, com movimentos relativos, num corpo de SVG de lado x lado (sem a tag <svg>).
O módulo gerado traz ICON_ART = { id: corpo }, que hooks/cenario.ts desenha dentro da faixa no ponto de cada ícone.
"""
import argparse
import json
import sys
from pathlib import Path

from PIL import Image

# id do ponto do QG -> trecho do nome do arquivo escolhido na curadoria de 2026-11-19
ESCOLHA = {
    "sobre": "98ed8ead",
    "cola": "00f628e0",
    "ajustes": "3883beb2",
    "prompts": "2ec8addc",
    "luz": "98f92da9",
    "luz-off": "7e4b3237",
    "neon": "9fec235a",
    "frota": "922edd63",
    "cofre": "7315ea1f",
    "agenda": "74894083",
    "servidor": "fc3344fd",
}


def sem_magenta(img):
    """Fundo magenta vira transparente por preenchimento a partir das bordas (o magenta de dentro do objeto, como o
    redemoinho do globo, fica), com tolerância para a borda rosada do jpg."""
    img = img.convert("RGBA")
    px = img.load()
    w, h = img.size

    def fundo(c):
        r, g, b, _ = c
        return r > 140 and b > 140 and g < 130 and abs(r - b) < 100

    vistos = set()
    pilha = [(x, y) for x in range(w) for y in (0, h - 1)] + [(x, y) for y in range(h) for x in (0, w - 1)]
    while pilha:
        x, y = pilha.pop()
        if (x, y) in vistos or not (0 <= x < w and 0 <= y < h):
            continue
        vistos.add((x, y))
        if not fundo(px[x, y]):
            continue
        px[x, y] = (0, 0, 0, 0)
        pilha.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
    return img


def reduz(img, lado):
    caixa = img.getbbox()
    if caixa:
        img = img.crop(caixa)
    w, h = img.size
    s = max(w, h)
    quad = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    quad.paste(img, ((s - w) // 2, (s - h) // 2))
    return quad.resize((lado, lado), Image.BOX)


def paleta(img, cores):
    alfa = img.getchannel("A")
    rgb = Image.new("RGB", img.size, (0, 0, 0))
    rgb.paste(img, mask=alfa)
    q = rgb.quantize(colors=cores, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert("RGB")
    out = Image.new("RGBA", img.size, (0, 0, 0, 0))
    qp, ap, op = q.load(), alfa.load(), out.load()
    for y in range(img.size[1]):
        for x in range(img.size[0]):
            if ap[x, y] >= 128:
                r, g, b = qp[x, y]
                op[x, y] = (r, g, b, 255)
    return out


def corpo(img):
    """Um <path> por cor: corridas horizontais, movimentos relativos."""
    w, h = img.size
    px = img.load()
    por_cor = {}
    for y in range(h):
        x = 0
        while x < w:
            r, g, b, a = px[x, y]
            if a == 0:
                x += 1
                continue
            x2 = x
            while x2 + 1 < w and px[x2 + 1, y] == px[x, y]:
                x2 += 1
            por_cor.setdefault("#%02x%02x%02x" % (r, g, b), []).append((x, y, x2 - x + 1))
            x = x2 + 1
    partes = []
    for cor, runs in por_cor.items():
        # Corridas iguais (mesmo x e largura) em linhas seguidas viram um retângulo só.
        rects = []
        abertos = {}
        for x, y, n in runs:
            k = (x, n)
            if k in abertos and abertos[k][1] + abertos[k][3] == y:
                abertos[k][3] += 1
            else:
                r = [x, y, n, 1]
                rects.append(r)
                abertos[k] = r
        d = []
        cx = cy = 0
        for x, y, n, alto in rects:
            # h n v alto h-n deixa a caneta em (x, y + alto): o próximo movimento parte dali (sem z).
            d.append("m%d %dh%dv%dh-%d" % (x - cx, y - cy, n, alto, n))
            cx, cy = x, y + alto
        partes.append('<path fill="%s" d="M0 0%s"/>' % (cor, "".join(d)))
    return "".join(partes)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("pasta")
    ap.add_argument("--lado", type=int, default=16)
    ap.add_argument("--cores", type=int, default=7)
    ap.add_argument("--saida", default=str(Path(__file__).resolve().parent.parent / "hooks" / "icones-arte.ts"))
    ap.add_argument("--prever", default="")
    a = ap.parse_args()
    pasta = Path(a.pasta)
    arte = {}
    for ident, trecho in ESCOLHA.items():
        achados = [p for p in pasta.iterdir() if trecho in p.name]
        if not achados:
            sys.exit(f"faltou o ícone {ident} ({trecho}) em {pasta}")
        img = paleta(reduz(sem_magenta(Image.open(achados[0])), a.lado), a.cores)
        arte[ident] = corpo(img)
    total = sum(len(v) for v in arte.values())
    src = (
        "// Gerado por scripts/icones-para-svg.py a partir dos ícones do Flow (curadoria de 2026-11-19). Não editar à mão.\n"
        f"// Cada corpo é um SVG de {a.lado}x{a.lado} sem a tag <svg>; hooks/cenario.ts o desenha dentro da faixa do QG.\n"
        f"export const ICON_SIDE = {a.lado}\n"
        f"export const ICON_ART: Record<string, string> = {json.dumps(arte, ensure_ascii=False, indent=2)}\n"
    )
    Path(a.saida).write_text(src, encoding="utf-8", newline="\n")
    print(f"gravado {a.saida}: {len(arte)} ícones, {total} caracteres")
    if a.prever:
        cells = "".join(
            f'<div style="display:inline-block;margin:6px;text-align:center;color:#ddd;font:12px sans-serif">'
            f'<svg viewBox="0 0 {a.lado} {a.lado}" width="96" height="96" shape-rendering="crispEdges" style="background:#3a2a1a">{v}</svg><br>{k}</div>'
            for k, v in arte.items()
        )
        Path(a.prever).write_text(f'<body style="background:#1e1e1e">{cells}', encoding="utf-8")


if __name__ == "__main__":
    main()
