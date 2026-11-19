"""Converte sprites PNG em SVG de retângulos (pixel art vetorial).

O app desktop desenha o Svg do mod sem deixar passar <image> com PNG embutido; o mesmo pixel art como
<rect> aparece. Para cada PNG de sprites/<skin>/ e sprites/frota/ este script grava o .svg ao lado
(o mod carrega .svg antes de .png). O PNG continua sendo a fonte da arte.

Uso:  python scripts/png-para-svg.py [pasta-sprites]        (padrão: ./sprites)
      python scripts/png-para-svg.py --verificar [pasta]    (reconstrói o PNG a partir do SVG e compara)
"""
import re
import sys
from pathlib import Path

from PIL import Image


def retangulos(img):
    """Cobre os pixels opacos com retângulos da mesma cor: corridas por linha, fundidas na vertical."""
    w, h = img.size
    px = img.load()
    abertos = {}  # (x, largura, cor) -> [y0, altura]
    prontos = []
    for y in range(h):
        corridas = set()
        x = 0
        while x < w:
            r, g, b, a = px[x, y]
            if a < 128:
                x += 1
                continue
            cor = f"#{r:02x}{g:02x}{b:02x}"
            x0 = x
            while x < w and px[x, y][3] >= 128 and f"#{px[x, y][0]:02x}{px[x, y][1]:02x}{px[x, y][2]:02x}" == cor:
                x += 1
            corridas.add((x0, x - x0, cor))
        for chave in list(abertos):
            if chave not in corridas:
                y0, alt = abertos.pop(chave)
                prontos.append((chave, y0, alt))
        for chave in corridas:
            if chave in abertos:
                abertos[chave][1] += 1
            else:
                abertos[chave] = [y, 1]
    for chave, (y0, alt) in abertos.items():
        prontos.append((chave, y0, alt))
    return prontos


def para_svg(caminho):
    img = Image.open(caminho).convert("RGBA")
    w, h = img.size
    por_cor = {}
    for (x, larg, cor), y0, alt in sorted(retangulos(img), key=lambda t: (t[0][2], t[1], t[0][0])):
        por_cor.setdefault(cor, []).append(f'<rect x="{x}" y="{y0}" width="{larg}" height="{alt}"/>')
    grupos = "".join(f'<g fill="{cor}">{"".join(rs)}</g>' for cor, rs in por_cor.items())
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" shape-rendering="crispEdges">{grupos}</svg>'


def reconstruir(svg, tam):
    """Lê de volta os <g fill><rect/></g> e pinta um RGBA; serve só para conferir a conversão."""
    img = Image.new("RGBA", tam, (0, 0, 0, 0))
    for fill, corpo in re.findall(r'<g fill="(#[0-9a-f]{6})">(.*?)</g>', svg):
        cor = tuple(int(fill[i:i + 2], 16) for i in (1, 3, 5)) + (255,)
        for x, y, w, h in re.findall(r'<rect x="(\d+)" y="(\d+)" width="(\d+)" height="(\d+)"/>', corpo):
            for yy in range(int(y), int(y) + int(h)):
                for xx in range(int(x), int(x) + int(w)):
                    img.putpixel((xx, yy), cor)
    return img


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    verificar = "--verificar" in sys.argv
    raiz = Path(args[0]) if args else Path("sprites")
    n = 0
    for png in sorted(raiz.glob("*/*.png")):
        svg = para_svg(png)
        if verificar:
            original = Image.open(png).convert("RGBA")
            volta = reconstruir(svg, original.size)
            for y in range(original.height):
                for x in range(original.width):
                    a, b = original.getpixel((x, y)), volta.getpixel((x, y))
                    if (a[3] >= 128) != (b[3] >= 128) or (a[3] >= 128 and a[:3] != b[:3]):
                        raise SystemExit(f"DIFERE {png} em ({x},{y}): {a} x {b}")
        else:
            png.with_suffix(".svg").write_text(svg, encoding="utf-8")
        n += 1
    print(("conferidos" if verificar else "gravados"), n, "sprites")


if __name__ == "__main__":
    main()
