from pathlib import Path
path = Path('scripts/generate_shop_assets.py')
text = path.read_text(encoding='utf8')
old = "        txt = 'XP'\n        w, h = draw.textsize(txt, font=font)\n        draw.text(((size-w)/2, (size-h)/2), txt, font=font, fill=(255, 255, 255, 255))\n"
new = "        txt = 'XP'\n        bbox = font.getbbox(txt)\n        w, h = bbox[2]-bbox[0], bbox[3]-bbox[1]\n        draw.text(((size-w)/2, (size-h)/2), txt, font=font, fill=(255, 255, 255, 255))\n"
if old not in text:
    raise SystemExit('Text pattern not found in generate_shop_assets.py')
path.write_text(text.replace(old, new), encoding='utf8')
print('fixed generator')
