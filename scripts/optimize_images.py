#!/usr/bin/env python3
"""
Generate responsive image variants (WebP and optionally AVIF) for all images under an input folder.

- Walks the input directory recursively and finds JPG/JPEG/PNG/WebP files
- For each image, creates width-constrained variants at common breakpoints
- Preserves aspect ratio; never upscales above original width
- Writes outputs next to the original or into a separate output directory
- Emits a JSON manifest to help wire up srcset/picture in the app

Usage (PowerShell):
  python .\scripts\optimize_images.py --input .\public\images --out .\public\images --widths 320,480,640,960,1280,1600,1920,2560

Dependencies:
  pip install pillow
  # Optional AVIF support (Windows wheels are available for pillow-avif-plugin):
  pip install pillow-avif-plugin

Notes:
- If pillow-avif-plugin is available, AVIF will be generated in addition to WebP.
- For images with alpha, WebP will default to lossless to avoid halos; you can override.
- Logos/vector-like PNGs are often better as SVG if available.
"""
from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
from typing import Dict, List, Optional, Tuple

from PIL import Image

# Try enabling AVIF if the plugin is present
try:
    import pillow_avif  # type: ignore # noqa: F401
    HAS_AVIF = True
except Exception:
    HAS_AVIF = False

SUPPORTED_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".JPG", ".JPEG", ".PNG", ".WEBP"}
DEFAULT_WIDTHS = [320, 480, 640, 768, 960, 1280, 1600, 1920, 2560]

# Reasonable quality presets; tweak as needed
WEBP_QUALITY_DEFAULT = 78  # photos
WEBP_QUALITY_PNGISH = 90   # for flat graphics if we keep lossy
AVIF_QUALITY_DEFAULT = 45  # AVIF is more efficient; lower numbers ~ similar visual quality


def parse_widths(s: str) -> List[int]:
    widths: List[int] = []
    for part in s.split(','):
        part = part.strip()
        if not part:
            continue
        try:
            widths.append(int(part))
        except ValueError:
            raise SystemExit(f"Invalid width in list: {part}")
    if not widths:
        return DEFAULT_WIDTHS
    return sorted(set(widths))


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def detect_alpha(img: Image.Image) -> bool:
    mode = img.mode
    if mode in ("RGBA", "LA"):
        return True
    if mode == "P":  # palette may include transparency
        return "transparency" in img.info
    return False


def save_webp(img: Image.Image, dest: Path, *, alpha: bool, lossless_alpha: bool, quality_photo: int, quality_pngish: int) -> None:
    params = {}
    if alpha and lossless_alpha:
        params = {"lossless": True, "method": 6}
    else:
        # Photos or graphics with no alpha
        q = quality_photo
        if not img.getbands():
            q = quality_photo
        params = {"quality": q, "method": 6}
    dest.parent.mkdir(parents=True, exist_ok=True)
    img.save(dest, format="WEBP", **params)


def save_avif(img: Image.Image, dest: Path, *, quality: int) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    img.save(dest, format="AVIF", quality=quality)


def process_image(src: Path, out_root: Path, widths: List[int], *, keep_tree: bool, png_lossless: bool,
                  skip_existing: bool) -> Dict[str, Dict[str, List[Dict[str, int | str]]]]:
    rel = src.relative_to(src.anchor) if not keep_tree else src
    # If keep_tree, we mirror directory structure under out_root
    rel_out = src.relative_to(src.parents[0]) if keep_tree else src.name
    if keep_tree:
        rel_out_path = out_root / src.parent.relative_to(src.parents[0])
    else:
        rel_out_path = out_root

    manifest_entry: Dict[str, Dict[str, List[Dict[str, int | str]]]] = {}

    with Image.open(src) as im:
        im.load()
        orig_w, orig_h = im.size
        has_alpha = detect_alpha(im)
        # Convert paletted or non-RGB to RGBA/RGB for encoders
        base_mode = "RGBA" if has_alpha else "RGB"
        base = im.convert(base_mode)

        # Choose which widths we actually need (avoid upscaling)
        target_widths = [w for w in widths if w <= orig_w]
        if not target_widths:
            target_widths = [orig_w]

        # Build a clean stem (without extension)
        stem = src.stem

        formats_done: Dict[str, List[Dict[str, int | str]]] = {}

        for w in target_widths:
            h = int(round(orig_h * (w / orig_w)))
            resized = base if w == orig_w else base.resize((w, h), Image.LANCZOS)

            # WEBP
            webp_path = rel_out_path / f"{stem}-w{w}.webp"
            if not (skip_existing and webp_path.exists()):
                save_webp(
                    resized,
                    webp_path,
                    alpha=has_alpha,
                    lossless_alpha=png_lossless and has_alpha,
                    quality_photo=WEBP_QUALITY_DEFAULT,
                    quality_pngish=WEBP_QUALITY_PNGISH,
                )
            formats_done.setdefault("webp", []).append({"src": str(webp_path.as_posix()), "width": w, "height": h})

            # AVIF (optional)
            if HAS_AVIF:
                avif_path = rel_out_path / f"{stem}-w{w}.avif"
                if not (skip_existing and avif_path.exists()):
                    save_avif(resized, avif_path, quality=AVIF_QUALITY_DEFAULT)
                formats_done.setdefault("avif", []).append({"src": str(avif_path.as_posix()), "width": w, "height": h})

        manifest_entry[str(src.as_posix())] = formats_done

    return manifest_entry


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate responsive image variants.")
    parser.add_argument("--input", required=True, help="Input directory with source images (e.g. public/images)")
    parser.add_argument("--out", required=True, help="Output directory for variants (can be same as input)")
    parser.add_argument("--widths", default=",".join(map(str, DEFAULT_WIDTHS)), help="Comma-separated widths")
    parser.add_argument("--keep-tree", action="store_true", help="Mirror input directory structure inside output root")
    parser.add_argument("--png-lossless", action="store_true", help="Use lossless WebP for images with alpha (good for logos)")
    parser.add_argument("--skip-existing", action="store_true", help="Skip generating files that already exist")
    parser.add_argument("--manifest", default=None, help="Path to write a JSON manifest (default: out/_manifest.json)")

    args = parser.parse_args()

    input_dir = Path(args.input).resolve()
    out_dir = Path(args.out).resolve()
    widths = parse_widths(args.widths)

    if not input_dir.exists():
        raise SystemExit(f"Input directory not found: {input_dir}")

    ensure_dir(out_dir)

    manifest_path = Path(args.manifest) if args.manifest else (out_dir / "_manifest.json")
    global_manifest: Dict[str, Dict[str, List[Dict[str, int | str]]]] = {}

    count = 0
    for path in input_dir.rglob("*"):
        if not path.is_file():
            continue
        if path.suffix not in SUPPORTED_EXTS:
            continue
        # Skip already-generated variants by convention (-wNNN in the filename)
        if "-w" in path.stem:
            continue
        entry = process_image(
            path,
            out_root=out_dir,
            widths=widths,
            keep_tree=True,
            png_lossless=args.png_lossless,
            skip_existing=args.skip_existing,
        )
        global_manifest.update(entry)
        count += 1
        if count % 10 == 0:
            print(f"Processed {count} images...")

    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(global_manifest, f, indent=2)
    print(f"Done. Images processed: {count}. Manifest: {manifest_path}")


if __name__ == "__main__":
    main()
