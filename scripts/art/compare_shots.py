"""Builds docs/shots/compare.png: one row per expression with the app capture,
the source art, and a label. Re-run to refresh.

The rig contains the art in a 512 box (object-fit: contain), so the app renders
414x342 art at 512/414 = 1.236x. The source is scaled by that same factor so the
two columns are 1:1 and any size difference is real, not a scaling artefact."""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

REPO = Path(__file__).resolve().parents[2]
SHOTS = REPO / "docs" / "shots"
ART = REPO / "assets" / "states"
OUT = SHOTS / "compare.png"

HEIGHT = 512
PAD = 12
GAP = 16
LABEL_W = 150
BG = (11, 23, 48)  # --navy from src/renderer/styles/main.css

font = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 22)

names = sorted(p.stem for p in SHOTS.glob("*.png") if p.name != OUT.name)
if not names:
    raise SystemExit("no captures in docs/shots — run scripts/shoot-states.js first")

rows = []
for name in names:
    shot = Image.open(SHOTS / f"{name}.png").convert("RGBA")
    if shot.size != (HEIGHT, HEIGHT):
        raise SystemExit(f"{name}.png is {shot.width}x{shot.height}, expected {HEIGHT}x{HEIGHT}")
    src = Image.open(ART / f"{name}.png").convert("RGBA")
    scale = HEIGHT / src.width  # the rig fits the art to the 512 box width
    src = src.resize((round(src.width * scale), round(src.height * scale)), Image.LANCZOS)
    rows.append((name, shot, src))

width = PAD + LABEL_W + HEIGHT + GAP + max(src.width for _, _, src in rows) + PAD
height = PAD + len(rows) * (HEIGHT + PAD)
canvas = Image.new("RGBA", (width, height), BG + (255,))
draw = ImageDraw.Draw(canvas)

y = PAD
for name, shot, src in rows:
    draw.text((PAD, y + 16), name, font=font, fill=(246, 243, 253))
    x = PAD + LABEL_W
    canvas.alpha_composite(shot, (x, y))
    # faint frame so it is obvious where the 512x512 stage ends
    draw.rectangle([x, y, x + HEIGHT - 1, y + HEIGHT - 1], outline=(40, 60, 100))
    canvas.alpha_composite(src, (x + HEIGHT + GAP, y + HEIGHT - src.height))
    y += HEIGHT + PAD

canvas.convert("RGB").save(OUT)
print(f"{OUT.relative_to(REPO)}  {width}x{height}  {OUT.stat().st_size} bytes  rows={len(rows)}")
