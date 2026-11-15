"""Slice the ANU design sheet into placeholder state PNGs.

Re-runnable: every output is rewritten deterministically, nothing is appended.

Background removal: border flood fill. rembg could not be used on this machine
(its pymatting -> numba DLL is blocked by the Windows Application Control
policy), so we key the background out starting from the crop border. The fill
only walks between 4-connected neighbours whose colour differs by <= TOL per
channel, which follows the smooth navy gradient but stops on the sharp
character edge. Interior dark pixels (hoodie, headphone cups) are never touched
because the fill can never reach them.
"""

from collections import deque
from datetime import date
from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
SHEET = ROOT / "assets" / "ref" / "ANU_sheet.png"
STATES = ROOT / "assets" / "states"
ICONS = ROOT / "assets" / "icons"

TOL = 10          # per channel, between neighbouring pixels
PAD = 8           # transparent padding kept around hero/front
FEATHER = 0.6     # gaussian radius applied after the 1px erode

KEEP = 0.12       # expression components below 12% of the largest are decoration
ISLAND = 0.12     # same rule after the erode, which can detach thin slivers
FACE = 172        # target face width on the 1x canvas (344 px in the 2x file)
FACE_BAND = (0.45, 0.75)
EXPR_CANVAS = (201, 171)   # 402x342 after the 2x upscale, shared by all six

# Expression grid: one rect per cell, label chips and panel chrome excluded.
CELLS = {
    "happy":     (718, 408, 962, 562),
    "winking":   (978, 408, 1152, 562),
    "excited":   (1170, 408, 1385, 562),
    "thinking":  (718, 596, 962, 762),
    "sleepy":    (978, 596, 1152, 762),
    "surprised": (1170, 596, 1385, 762),
}
FRONT_BOX = (745, 68, 965, 355)
HERO_BOX = (40, 60, 715, 800)

# Palette circles, sampled at their exact centre pixel (y = 859).
SWATCHES = {"blue": 483, "aqua": 527, "offwhite": 571, "lavender": 614, "violet": 655}
SWATCH_Y = 859
BUBBLE_FILL_BOX = (575, 190, 700, 240)   # bubble interior, below the two text lines
BUBBLE_GLOW_XY = (610, 125)              # crisp core of the outline's top arc
RING_CYAN_XY = (263, 377)                # brightest point of the headphone ring


def flood_background(px, box, tol=TOL):
    """True where the pixel belongs to the border-connected background."""
    x0, y0, x1, y1 = box
    w, h = x1 - x0, y1 - y0
    bg = [[False] * w for _ in range(h)]
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if not bg[y][x]:
                bg[y][x] = True
                q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if not bg[y][x]:
                bg[y][x] = True
                q.append((x, y))
    while q:
        x, y = q.popleft()
        c = px[x0 + x, y0 + y]
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and not bg[ny][nx]:
                p = px[x0 + nx, y0 + ny]
                if (abs(p[0] - c[0]) <= tol and abs(p[1] - c[1]) <= tol
                        and abs(p[2] - c[2]) <= tol):
                    bg[ny][nx] = True
                    q.append((nx, ny))
    return bg, w, h


def components(bg, w, h):
    """Label 4-connected foreground blobs.

    Returns (labels, blobs) where labels[y][x] is the blob id (0 = background)
    and blobs is a list of (id, area, bbox), largest first.
    """
    labels = [[0] * w for _ in range(h)]
    blobs, nid = [], 0
    for sy in range(h):
        for sx in range(w):
            if bg[sy][sx] or labels[sy][sx]:
                continue
            nid += 1
            labels[sy][sx] = nid
            q = deque([(sx, sy)])
            area, l, t, r, b = 0, sx, sy, sx, sy
            while q:
                x, y = q.popleft()
                area += 1
                l, t, r, b = min(l, x), min(t, y), max(r, x), max(b, y)
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < w and 0 <= ny < h and not bg[ny][nx] and not labels[ny][nx]:
                        labels[ny][nx] = nid
                        q.append((nx, ny))
            blobs.append((nid, area, (l, t, r, b)))
    blobs.sort(key=lambda c: c[1], reverse=True)
    return labels, blobs


def cutout(img, box, keep_ratio=0.0, min_island=0.0):
    """RGBA crop of `box` with the background keyed out.

    keep_ratio=0.0 keeps only the largest foreground component (used for the
    hero / front view, dropping the speech bubble and cast shadow).
    Otherwise every component at least keep_ratio * largest survives, which
    drops the decorative sparkle / "?" / "zzz" / "!" marks.
    min_island applies the same rule again to the eroded mask, where a thin
    attachment can snap: it drops the slivers the erode detached from the body.
    """
    px = img.load()
    bg, w, h = flood_background(px, box)
    labels, blobs = components(bg, w, h)
    if not blobs:
        raise RuntimeError(f"nothing found in {box}")
    if keep_ratio:
        limit = blobs[0][1] * keep_ratio
        kept = {b[0] for b in blobs if b[1] >= limit}
    else:
        kept = {blobs[0][0]}

    alpha = Image.new("L", (w, h), 0)
    ap = alpha.load()
    for y in range(h):
        row = labels[y]
        for x in range(w):
            if row[x] in kept:
                ap[x, y] = 255
    # erode one pixel so the navy antialias fringe dies, then soften the edge
    alpha = alpha.filter(ImageFilter.MinFilter(3))
    if min_island:
        prune_islands(alpha, min_island)
    alpha = alpha.filter(ImageFilter.GaussianBlur(FEATHER))
    out = img.crop(box).convert("RGBA")
    out.putalpha(alpha)
    return out, [b for b in blobs if b[0] in kept]


def bbox(rgba):
    return rgba.getchannel("A").getbbox()


def head_width(rgba):
    """Median silhouette width across the mid-head band, in pixels.

    The design sheet draws each expression at a slightly different size (266 to
    326 px here), so crossfading raw crops pops. The band runs from 25% to 55%
    of the bbox height, which spans the headphone cups and cheeks and skips both
    the ear tips and the chin, so the number is stable against head tilt.
    """
    alpha = rgba.getchannel("A")
    ox, oy = alpha.getbbox()[:2]
    b = alpha.getbbox()
    top, height = oy, b[3] - oy
    widths = []
    for y in range(top + int(height * 0.25), top + int(height * 0.55)):
        xs = [x for x in range(alpha.width) if alpha.getpixel((x, y)) > 16]
        if xs:
            widths.append(xs[-1] - xs[0] + 1)
    widths.sort()
    return widths[len(widths) // 2] if widths else 0


def upscale_save(rgba, path):
    big = rgba.resize((rgba.width * 2, rgba.height * 2), Image.LANCZOS)
    big.save(path, "PNG", optimize=True)
    return big


def pad(rgba, p=PAD):
    canvas = Image.new("RGBA", (rgba.width + 2 * p, rgba.height + 2 * p), (0, 0, 0, 0))
    canvas.paste(rgba, (p, p))
    return canvas


def main():
    img = Image.open(SHEET).convert("RGB")
    src = img.load()
    STATES.mkdir(parents=True, exist_ok=True)
    ICONS.mkdir(parents=True, exist_ok=True)

    # ---- palette -----------------------------------------------------------
    def hexat(x, y):
        return "#%02x%02x%02x" % src[x, y]

    def mode_dark(box, limit=95):
        """Most common pixel inside `box` that is darker than `limit` luminance."""
        counts = {}
        for y in range(box[1], box[3]):
            for x in range(box[0], box[2]):
                r, g, b = src[x, y]
                if 0.2126 * r + 0.7152 * g + 0.0722 * b < limit:
                    counts[(r, g, b)] = counts.get((r, g, b), 0) + 1
        r, g, b = max(counts, key=counts.get)
        return "#%02x%02x%02x" % (r, g, b)

    colors = {name: hexat(x, SWATCH_Y) for name, x in SWATCHES.items()}
    colors["bubbleFill"] = mode_dark(BUBBLE_FILL_BOX)
    colors["bubbleGlow"] = hexat(*BUBBLE_GLOW_XY)
    colors["ringCyan"] = hexat(*RING_CYAN_XY)
    (ROOT / "palette.json").write_text(
        "{\n"
        f'  "source": "assets/ref/ANU_sheet.png",\n'
        f'  "sampledAt": "{date.today().isoformat()}",\n'
        f'  "reference": {{ "width": {img.width}, "height": {img.height} }},\n'
        '  "colors": {\n'
        + ",\n".join(f'    "{k}": "{v}"' for k, v in colors.items())
        + "\n  }\n}\n",
        encoding="utf-8",
    )

    # ---- expressions: one shared canvas, anchored on the head --------------
    cuts = {}
    for name, box in CELLS.items():
        rgba, keep = cutout(img, box, keep_ratio=0.05)
        cuts[name] = rgba
        print(f"  {name}: blobs kept {len(keep)}")

    # The sheet draws each expression at a slightly different size; scale them
    # to one median head width so the crossfade between states does not pop.
    widths = {n: head_width(c) for n, c in cuts.items()}
    target = sorted(widths.values())[len(widths) // 2]
    for name, rgba in list(cuts.items()):
        f = target / widths[name]
        if abs(f - 1) > 0.005:
            size = (round(rgba.width * f), round(rgba.height * f))
            cuts[name] = rgba.resize(size, Image.LANCZOS)
            print(f"  {name}: head {widths[name]} -> {target} (x{f:.3f})")

    anchors = {}
    for name, rgba in cuts.items():
        l, t, r, b = bbox(rgba)
        # head anchor: top edge plus the horizontal centre of the top 25 rows
        # (ears + crown). Stable across expressions, unlike the full bbox which
        # moves when a raised paw or a wide-open mouth changes the silhouette.
        strip = rgba.crop((l, t, r + 1, t + 25)).getchannel("A")
        sw, sh = strip.size
        cols = [x for x in range(sw) if any(strip.getpixel((x, y)) > 127 for y in range(sh))]
        ax = l + (sum(cols) / len(cols) if cols else (r - l) / 2)
        anchors[name] = (ax, t, l, r, b)
        print(f"  {name}: bbox {(l, t, r, b)}, anchor x {ax:.1f}")

    L = max(ax - l for ax, t, l, r, b in anchors.values())
    R = max(r - ax for ax, t, l, r, b in anchors.values())
    B = max(b - t for ax, t, l, r, b in anchors.values())
    pad_px = 6
    W, H = int(round(L + R)) + 2 * pad_px, int(round(B)) + 2 * pad_px
    print(f"  shared expression canvas: {W}x{H}")

    for name, rgba in cuts.items():
        ax, top, l, r, b = anchors[name]
        off_x = int(round(ax - L)) - pad_px   # relative to the cell box
        off_y = top - pad_px
        canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        # crop outside the cell box is transparent, so this stays aligned even
        # when the shared canvas is wider than a narrow cell
        canvas.alpha_composite(rgba.crop((off_x, off_y, off_x + W, off_y + H)))
        upscale_save(canvas, STATES / f"{name}.png")

    # ---- front view --------------------------------------------------------
    front, _ = cutout(img, FRONT_BOX)
    l, t, r, b = bbox(front)
    front = pad(front.crop((l, t, r + 1, b + 1)))
    upscale_save(front, STATES / "front.png")

    # ---- hero --------------------------------------------------------------
    hero, _ = cutout(img, HERO_BOX)
    l, t, r, b = bbox(hero)
    hero = pad(hero.crop((l, t, r + 1, b + 1)))
    upscale_save(hero, STATES / "hero.png")

    # ---- tray icon: square off the front view head -------------------------
    fw, fh = front.size
    side = fw
    head = front.crop((0, 0, side, min(side, fh)))
    head.resize((32, 32), Image.LANCZOS).save(ICONS / "tray.png", "PNG", optimize=True)

    print("written:", (ROOT / "palette.json").relative_to(ROOT))


if __name__ == "__main__":
    main()
