#!/usr/bin/env python
"""
Baut Prompts programmatisch aus global-style.md + einem Szenenblock.

Nie von Hand einen Prompt schreiben — sonst driftet der Stil zwischen
Generierungen, und genau das soll das System verhindern. Der Stilblock wird
hier nur GELESEN, niemals verändert.

Aufruf:
    python production/compose.py image 00-world-master  > body.json
    python production/compose.py video 02-wrack-in      > body.json
"""
import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent
STYLE = ROOT / "global-style.md"


def block(name: str) -> str:
    """Holt den ersten ```-Block unter einer Überschrift aus global-style.md."""
    text = STYLE.read_text(encoding="utf-8")
    m = re.search(rf"^##\s+{re.escape(name)}\b.*?```\n(.*?)\n```", text, re.S | re.M)
    if not m:
        raise SystemExit(f"Block '{name}' nicht in global-style.md gefunden")
    return m.group(1).strip()


def scene(slug: str) -> str:
    p = ROOT / "scenes" / f"{slug}.md"
    if not p.exists():
        raise SystemExit(f"Szene fehlt: {p}")
    m = re.search(r"## SCENE_DESCRIPTION\s*```\n(.*?)\n```", p.read_text(encoding="utf-8"), re.S)
    if not m:
        raise SystemExit(f"SCENE_DESCRIPTION fehlt in {p}")
    return m.group(1).strip()


def build_image(slug: str) -> dict:
    style = block("WORLD_STYLE")
    # Der Rochen ist das einzige Asset, das eine Kreatur zeigen darf.
    if slug.startswith("rochen"):
        style = style.replace(", no creatures or fish", "")
    prompt = f"{style} {scene(slug)}"
    if len(prompt) > 1500:
        raise SystemExit(f"Prompt {len(prompt)} Zeichen — Minimax erlaubt 1500. Szene kürzen.")
    return {
        "model": "image-01",
        "prompt": prompt,
        # `aspect_ratio` MUSS gesetzt werden. Sein Standard ist 1:1 und hat
        # Vorrang vor width/height — real passiert: der erste Lauf lieferte
        # 1024x1024, obwohl nur width/height gesetzt waren. Für Frame-Lock
        # gegen 16:9-Videos ist ein quadratisches Master wertlos.
        "aspect_ratio": "16:9",
        "n": 1,
        # Muss aus bleiben, sonst schreibt Minimax den Stilblock um.
        "prompt_optimizer": False,
        "response_format": "url",
    }


def build_video(slug: str, first_url: str = "", last_url: str = "") -> dict:
    parts = [
        block("WORLD_STYLE"),
        f"SCENE: {scene(slug)}",
        block("FRAME_CONSTRAINTS") if slug.endswith("-in") else block("CAMERA_LOCK"),
        block("KOMPOSITIONSREGEL"),
    ]
    prompt = " ".join(p.replace("\n", " ") for p in parts)
    if len(prompt) > 3800:
        print(f"WARNUNG: {len(prompt)} Zeichen — ab ~4000 verdrängen sich "
              f"Anweisungen gegenseitig.", file=sys.stderr)
    content: list = [{"type": "text", "text": prompt}]
    for url, role in ((first_url, "first_frame"), (last_url, "last_frame")):
        if url:
            content.append({"type": "image_url", "image_url": {"url": url}, "role": role})
    return {
        "content": content,
        "resolution": "720p",
        "ratio": "16:9",
        "duration": 5 if slug.endswith("-in") else 6,
        "generate_audio": False,
        "watermark": False,
    }


def main() -> None:
    kind, slug = sys.argv[1], sys.argv[2]
    if kind == "image":
        body = build_image(slug)
        text = body["prompt"]
    else:
        body = build_video(slug, *(sys.argv[3:5] + ["", ""])[:2])
        text = body["content"][0]["text"]
    print(json.dumps(body, ensure_ascii=False, indent=2))
    digest = hashlib.sha256(text.encode()).hexdigest()[:12]
    print(f"# {len(text)} Zeichen · prompt_hash {digest}", file=sys.stderr)


if __name__ == "__main__":
    main()
