"""Turn photos of pencil drawings into transparent PNGs: only the graphite
remains, so the drawing sits on any sticky-note color.

Usage: python3 -I clean_drawings.py <src_dir> <out_dir> name=file ...
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

src, out = Path(sys.argv[1]), Path(sys.argv[2])
out.mkdir(parents=True, exist_ok=True)

for pair in sys.argv[3:]:
    name, file = pair.split("=")
    im = Image.open(src / file).convert("L")
    im.thumbnail((1100, 1100), Image.LANCZOS)

    # Estimate the paper under the drawing (lighting is uneven in phone
    # photos), then measure how much darker each pixel is than its paper.
    bg = im.filter(ImageFilter.MaxFilter(21)).filter(ImageFilter.GaussianBlur(45))
    v = np.asarray(im, dtype=np.float32)
    b = np.maximum(np.asarray(bg, dtype=np.float32), 1)
    dark = np.clip((1 - v / b - 0.07) / 0.5, 0, 1) ** 0.85

    # Ignore page edges and folds near the border when finding the drawing.
    h, w = dark.shape
    m = int(min(h, w) * 0.05)
    core = np.zeros_like(dark)
    core[m:h - m, m:w - m] = dark[m:h - m, m:w - m]
    ys, xs = np.where(core > 0.25)
    pad = int(min(h, w) * 0.03)
    y0, y1 = max(ys.min() - pad, 0), min(ys.max() + pad, h)
    x0, x1 = max(xs.min() - pad, 0), min(xs.max() + pad, w)

    alpha = (dark[y0:y1, x0:x1] * 255).astype(np.uint8)
    rgba = np.zeros((*alpha.shape, 4), dtype=np.uint8)
    rgba[..., :3] = (38, 34, 30)  # warm graphite
    rgba[..., 3] = alpha
    res = Image.fromarray(rgba, "RGBA")
    res.thumbnail((640, 640), Image.LANCZOS)
    res.save(out / f"{name}.png", optimize=True)
    print(name, res.size, (out / f"{name}.png").stat().st_size // 1024, "KB")
