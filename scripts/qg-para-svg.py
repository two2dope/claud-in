"""Converte a arte do QG do Claudin (pixel art em PNG ou JPG, 16:9) na faixa em SVG de caminhos que o mod desenha.

Uso:
  python scripts/qg-para-svg.py <imagem> [--y0 222] [--alto 290] [--largura 360] [--cores 24] [--cor 1.35] [--saida hooks/cenario-arte.ts]

O que faz:
  1. recorta a faixa (da linha y0, com o alto dado, na largura inteira) e reduz para largura x altura de arte;
  2. realça a saturação (--cor; a redução de cores apaga o verde das telas) e trava a paleta em N cores, sem dithering;
  3. apaga os ponteiros do relógio de parede (o pomodoro é desenhado por código por cima);
  4. escreve um <path> por cor, com movimentos relativos (m dx dy h w v h h-w z), num único SVG, e o módulo TypeScript.

O limite do elemento Svg do mod é 131072 caracteres; o script avisa se passar de 118000 (precisa sobrar espaço para a luz).
Com --prever, grava também uma página HTML para conferir o resultado.
"""
import argparse
import json
from pathlib import Path

from PIL import Image, ImageEnhance

LIMITE_AVISO = 118_000
# O relógio de parede, em pixels de arte da faixa 360x76 feita a partir da arte aprovada (centro e raio do mostrador).
RELOGIO = {"cx": 303.0, "cy": 15.2, "r": 7.8}


def corridas(img):
    """Retângulos (x, y, w, h, cor): corridas horizontais iguais empilhadas na vertical."""
    w, h = img.size
    px = img.load()
    ativos = {}
    rects = []
    for y in range(h):
        atuais = {}
        x = 0
        while x < w:
            c = px[x, y]
            x2 = x
            while x2 + 1 < w and px[x2 + 1, y] == c:
                x2 += 1
            k = (x, x2 - x + 1, c)
            if k in ativos:
                atuais[k] = ativos[k]
                atuais[k][1] += 1
            else:
                atuais[k] = [y, 1]
            x = x2 + 1
        for k, v in ativos.items():
            if k not in atuais:
                rects.append((k[0], v[0], k[1], v[1], k[2]))
        ativos = atuais
    for k, v in ativos.items():
        rects.append((k[0], v[0], k[1], v[1], k[2]))
    return rects


def apaga_ponteiros(img, relogio):
    """Pinta o miolo do mostrador com a cor do fundo dele: sem ponteiros, sem números."""
    cx, cy, r = relogio["cx"], relogio["cy"], relogio["r"]
    px = img.load()
    miolo = r - 1.6  # preserva o aro
    pontos = [(x, y) for y in range(img.size[1]) for x in range(img.size[0]) if (x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2 <= miolo**2]
    if not pontos:
        return
    # o fundo do mostrador é a cor mais clara que mais aparece no miolo
    claros = {}
    for (x, y) in pontos:
        c = px[x, y]
        lum = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
        claros[c] = (claros.get(c, (0, lum))[0] + 1, lum)
    fundo = max(claros.items(), key=lambda kv: (kv[1][1] > 150, kv[1][0]))[0]
    for (x, y) in pontos:
        px[x, y] = fundo


def svg_de(img):
    w, h = img.size
    por_cor = {}
    for (x, y, rw, rh, c) in corridas(img):
        por_cor.setdefault(c, []).append((y, x, rw, rh))
    caminhos = ""
    for c, rects in por_cor.items():
        rects.sort()
        d = []
        px_, py_ = 0, 0
        for (y, x, rw, rh) in rects:
            # m relativo ao início do retângulo anterior (o z devolve o ponto ao início): números pequenos
            d.append(f"m{x - px_} {y - py_}h{rw}v{rh}h-{rw}z")
            px_, py_ = x, y
        caminhos += f'<path fill="#{c[0]:02x}{c[1]:02x}{c[2]:02x}" d="{"".join(d)}"/>'
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w * 4}" height="{h * 4}" viewBox="0 0 {w} {h}" shape-rendering="crispEdges">{caminhos}</svg>'


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("imagem")
    ap.add_argument("--y0", type=int, default=222)
    ap.add_argument("--alto", type=int, default=290)
    ap.add_argument("--largura", type=int, default=360)
    ap.add_argument("--cores", type=int, default=24)
    ap.add_argument("--cor", type=float, default=1.35)
    ap.add_argument("--saida", default="hooks/cenario-arte.ts")
    ap.add_argument("--prever", default="")
    a = ap.parse_args()

    base = Image.open(a.imagem).convert("RGB")
    w, h = base.size
    faixa = base.crop((0, a.y0, w, a.y0 + a.alto))
    altura = round(a.largura * a.alto / w)
    pequena = ImageEnhance.Color(faixa.resize((a.largura, altura), Image.LANCZOS)).enhance(a.cor)
    img = pequena.quantize(colors=a.cores, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert("RGB")
    apaga_ponteiros(img, RELOGIO)
    svg = svg_de(img)
    print(f"{a.largura}x{altura}, {a.cores} cores, {len(svg)} caracteres")
    if len(svg) > LIMITE_AVISO:
        print(f"AVISO: passou de {LIMITE_AVISO}; sobra pouco para a luz (limite do motor: 131072)")

    saida = Path(a.saida)
    saida.write_text(
        "// Gerado por scripts/qg-para-svg.py: a arte do QG do Claudin (pixel art) como SVG de caminhos, um único elemento." + chr(10)
        + "export const QG_ART = { w: %d, h: %d, svg: %s }" % (a.largura, altura, json.dumps(svg)) + chr(10),
        encoding="utf-8",
    )
    print("gravado", saida)
    if a.prever:
        Path(a.prever).write_text(
            '<!doctype html><meta charset="utf-8"><body style="margin:0;background:#111">'
            + svg.replace("<svg ", '<svg style="width:100%;height:auto" ', 1),
            encoding="utf-8",
        )


main()
