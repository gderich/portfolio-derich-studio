#!/usr/bin/env python3
"""Converte PNG/JPG novos de dist/images para WebP (largura máx. 1600 px).

Uso:  python3 tools/optimize_images.py            # converte tudo que não for .webp
      python3 tools/optimize_images.py arquivo.png

Requer: pip install pillow
Os arquivos de pré-visualização social (derich-preview-v2.jpg, *-og.jpg) são mantidos em JPG.
"""
import sys
from pathlib import Path
from PIL import Image

IMAGES = Path(__file__).resolve().parent.parent / "dist" / "images"
KEEP = ("derich-preview", "-og.")
MAX_W = 1600

def convert(path: Path) -> None:
    if path.suffix.lower() == ".webp" or any(k in path.name for k in KEEP):
        return
    im = Image.open(path)
    im = im.convert("RGBA" if im.mode in ("RGBA", "LA", "P") else "RGB")
    if im.width > MAX_W:
        im = im.resize((MAX_W, round(im.height * MAX_W / im.width)), Image.LANCZOS)
    out = path.with_suffix(".webp")
    im.save(out, "WEBP", quality=82, method=6)
    path.unlink()
    print(f"{path.name} -> {out.name} ({out.stat().st_size // 1024} KB, {im.width}x{im.height})")

if __name__ == "__main__":
    targets = [Path(a) for a in sys.argv[1:]] or sorted(IMAGES.iterdir())
    for p in targets:
        if p.is_file():
            convert(p)
