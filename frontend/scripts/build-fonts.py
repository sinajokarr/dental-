"""Build the self-hosted web fonts (D-049) from the OFL sources in google/fonts.

Usage (fontTools is a tool, not a project dependency):
  python3 -m venv /tmp/fontvenv && /tmp/fontvenv/bin/pip install fonttools brotli
  /tmp/fontvenv/bin/python scripts/build-fonts.py <dir with the downloaded *.ttf>   # run from frontend/

Sources: https://github.com/google/fonts/tree/main/ofl/{cormorantgaramond,manrope,vazirmatn}
Writes public/fonts/*.woff2 and prints the metric-matched fallback @font-face rules for globals.css.
"""

import sys
from io import BytesIO
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

LATIN = "U+0000-00FF,U+0100-017F,U+0192,U+02C6,U+02DA,U+02DC,U+1E9E,U+2000-206F,U+20AC,U+2122,U+2212,U+FEFF,U+FFFD"
PERSIAN = "U+0000-00FF,U+0600-06FF,U+200C-200F,U+2010-2027,U+FEFF,U+FFFD"
MUST_LATIN = "İıŞşĞğÇçÖöÜüÄäßẞ€–—’“”"
MUST_PERSIAN = "ابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهیءآأؤئ۰۱۲۳۴۵۶۷۸۹‌"

# output name: (source file, weight axis range, unicodes, required characters, local fallback font)
FONTS = {
    "cormorant-garamond": ("CormorantGaramond[wght].ttf", 300, LATIN, MUST_LATIN, "Georgia"),
    "cormorant-garamond-italic": ("CormorantGaramond-Italic[wght].ttf", 300, LATIN, MUST_LATIN, "Georgia"),
    "manrope": ("Manrope[wght].ttf", (400, 700), LATIN, MUST_LATIN, "Arial"),
    "vazirmatn": ("Vazirmatn[wght].ttf", (200, 600), PERSIAN, MUST_PERSIAN, "Tahoma"),
}
FALLBACK_DIR = Path("/System/Library/Fonts/Supplemental")


def build(src_dir: Path, name: str, spec: tuple) -> TTFont:
    source, weight, unicodes, must, _ = spec
    font = TTFont(next(p for p in src_dir.iterdir() if p.name.endswith(source)))  # "[wght]" breaks glob
    font = instantiateVariableFont(font, {"wght": weight})
    buffer = BytesIO()  # round-trip: lazily loaded tables go stale after instancing (KeyError in subset)
    font.save(buffer)
    font = TTFont(BytesIO(buffer.getvalue()))
    options = subset.Options()
    options.flavor = "woff2"
    options.layout_features = ["*"]  # keep Persian shaping and Latin kerning
    options.hinting = False
    options.desubroutinize = True
    subsetter = subset.Subsetter(options)
    subsetter.populate(unicodes=subset.parse_unicodes(unicodes))
    subsetter.subset(font)
    missing = [c for c in must if ord(c) not in font.getBestCmap()]
    assert not missing, f"{name} is missing {missing}"
    out = Path("public/fonts") / f"{name}.woff2"
    font.flavor = "woff2"
    font.save(out)
    print(f"/* {out}: {out.stat().st_size // 1024} KB */", file=sys.stderr)
    return font


def fallback_rule(name: str, font: TTFont, fallback: str) -> str:
    # Same approach as next/font's adjustFontFallback: match average width, then scale vertical metrics.
    def metrics(f: TTFont):
        return f["head"].unitsPerEm, f["hhea"].ascent, f["hhea"].descent, f["hhea"].lineGap, f["OS/2"].xAvgCharWidth

    upm, asc, desc, gap, avg = metrics(font)
    fupm, *_, favg = metrics(TTFont(FALLBACK_DIR / f"{fallback}.ttf"))
    size = (avg / upm) / (favg / fupm)
    return (
        f'@font-face {{\n  font-family: "{name} Fallback";\n  src: local("{fallback}");\n'
        f"  size-adjust: {size * 100:.2f}%;\n  ascent-override: {asc / upm / size * 100:.2f}%;\n"
        f"  descent-override: {abs(desc) / upm / size * 100:.2f}%;\n  line-gap-override: {gap / upm / size * 100:.2f}%;\n}}"
    )


if __name__ == "__main__":
    src = Path(sys.argv[1])
    Path("public/fonts").mkdir(parents=True, exist_ok=True)
    built = {name: build(src, name, spec) for name, spec in FONTS.items()}
    for family, name in (("Cormorant Garamond", "cormorant-garamond"), ("Manrope", "manrope"), ("Vazirmatn", "vazirmatn")):
        print(fallback_rule(family, built[name], FONTS[name][4]))
