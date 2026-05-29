# scripts/

Asset-prep helpers. None of them are imported by the app — they run on
the local filesystem to massage source assets before they're committed.

## Workflow when adding new pose icons

The pose icon set lives at `public/poses/*.png`. New icons usually arrive
from the design pipeline as JPEGs (with a grey-checker placeholder where
transparency should be) but already named `.png`.

1. Drop the new files into `public/poses/`.
2. `python scripts/strip_pose_bg.py` — converts each file to a real
   RGBA PNG, dropping the grey checker via a luma threshold (170 with a
   25-luma soft band by default). If a new pose has a particularly
   bright checker, bump `THRESHOLD` in the script.
3. `python scripts/audit_poses.py` — verifies every file is between
   3–11% opaque pixels, snaps any off-white opaque pixel to pure
   `(255, 255, 255, 255)`, and flags anything still suspicious.

## Dependency

```
pip install pillow
```
