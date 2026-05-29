"""
strip_pose_bg.py

Converts each pose image in public/poses/*.png from its current JPEG-with-
checker-background form into a real PNG with a transparent alpha channel.

Algorithm (luminance threshold):
  - Open as RGB.
  - For every pixel, compute perceived luminance.
  - Pixels brighter than THRESHOLD become opaque white (the line art).
  - Pixels darker than THRESHOLD become transparent (the grey checker).
  - Alpha smoothly fades in the SOFT_RANGE around the threshold so edges
    of the line art anti-alias cleanly against any dark background.

Then writes back to the SAME file path as a real PNG (with alpha).
"""

from pathlib import Path
from PIL import Image

POSES_DIR = Path(__file__).parent / 'public' / 'poses'
THRESHOLD = 170      # 0..255 — anything below this becomes transparent
SOFT_RANGE = 25      # anti-alias soft falloff width around the threshold


def process(path: Path) -> tuple[int, int]:
    """Convert one image to transparent-PNG. Returns (kept_px, transparent_px)."""
    img = Image.open(path).convert('RGB')
    px = img.load()
    w, h = img.size

    out = Image.new('RGBA', (w, h), (255, 255, 255, 0))
    op = out.load()

    kept = 0
    cleared = 0

    low = THRESHOLD - SOFT_RANGE
    high = THRESHOLD + SOFT_RANGE

    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            # Rec. 709 luma
            lum = 0.2126 * r + 0.7152 * g + 0.0722 * b

            if lum >= high:
                # Solid line art — force pure white with full opacity.
                op[x, y] = (255, 255, 255, 255)
                kept += 1
            elif lum <= low:
                # Background checker — fully transparent.
                op[x, y] = (255, 255, 255, 0)
                cleared += 1
            else:
                # Soft edge — fade alpha linearly between 0 and 255.
                t = (lum - low) / (high - low)
                a = int(round(t * 255))
                op[x, y] = (255, 255, 255, a)
                if a > 128:
                    kept += 1
                else:
                    cleared += 1

    # Save back to the same path as a real PNG (alpha-aware).
    out.save(path, format='PNG', optimize=True)
    return kept, cleared


def main() -> None:
    files = sorted(POSES_DIR.glob('*.png'))
    print(f'Processing {len(files)} pose images in {POSES_DIR}')
    for p in files:
        kept, cleared = process(p)
        ratio = cleared / (kept + cleared) if (kept + cleared) else 0
        print(f'  {p.name:25s}  kept={kept:7d}  cleared={cleared:7d}  ({ratio:.0%} transparent)')
    print('Done.')


if __name__ == '__main__':
    main()
