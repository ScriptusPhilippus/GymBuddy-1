"""
audit_poses.py

Walks every PNG in public/poses/, decodes it as RGBA, and reports the
opaque-pixel ratio (alpha == 255) plus the count of mid-luma opaque
pixels (potential residual checker squares). Any file with >15% opaque
or >5000 mid-luma pixels gets flagged as suspicious.

Also normalizes any fully-opaque pixel to pure (255, 255, 255, 255) so
brightness/intensity is uniform across the whole pose set — this fixes
the "some icons look dimmer than others" coherence issue.
"""

from pathlib import Path
from PIL import Image

POSES_DIR = Path(__file__).parent / 'public' / 'poses'

OPAQUE_RATIO_LIMIT = 0.15      # > 15% opaque means residual background
MID_LUMA_PIXEL_LIMIT = 5000    # > 5000 mid-grey pixels means visible checker


def audit(path: Path) -> tuple[float, int, bool]:
    """Return (opaque_ratio, mid_luma_count, normalized?)."""
    img = Image.open(path).convert('RGBA')
    px = img.load()
    w, h = img.size

    opaque = 0
    mid_luma = 0
    changed = False
    total = w * h

    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a >= 250:
                opaque += 1
                lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
                if lum < 230:
                    mid_luma += 1
                # Normalize: force every fully-opaque pixel to pure white.
                if (r, g, b, a) != (255, 255, 255, 255):
                    px[x, y] = (255, 255, 255, 255)
                    changed = True

    if changed:
        img.save(path, format='PNG', optimize=True)

    return opaque / total, mid_luma, changed


def main() -> None:
    files = sorted(POSES_DIR.glob('*.png'))
    flagged: list[str] = []
    print(f'Auditing {len(files)} pose PNGs in {POSES_DIR}\n')
    print(f'{"file":25s}  {"opaque%":>9s}  {"mid-luma":>10s}  {"normalized":>11s}  {"flagged":>8s}')
    for p in files:
        ratio, mid, changed = audit(p)
        suspicious = ratio > OPAQUE_RATIO_LIMIT or mid > MID_LUMA_PIXEL_LIMIT
        flag = 'YES' if suspicious else ''
        if suspicious:
            flagged.append(p.name)
        print(f'{p.name:25s}  {ratio*100:>8.2f}%  {mid:>10d}  {"yes" if changed else "":>11s}  {flag:>8s}')

    print('\n— Summary —')
    if flagged:
        print(f'Flagged {len(flagged)} file(s) for residual checker: {", ".join(flagged)}')
    else:
        print('All icons clean.')


if __name__ == '__main__':
    main()
