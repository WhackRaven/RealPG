from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

shop_dir = Path('assets/images/shop')
shop_dir.mkdir(parents=True, exist_ok=True)

items = [
    ('legendary_avatar', 'Legendärer\nFuchs', '#FF7F24'),
    ('golden_frame', 'Goldener\nRahmen', '#FFD700'),
    ('joker_card', 'Joker\nKarte', '#EC4899'),
    ('neon_theme', 'Neon\nTheme', '#00CD00'),
    ('xp_booster', 'XP\nBooster', '#3B82F6'),
    ('coins_booster', 'Blitz\nBooster', '#FF7F24'),
    ('streak_shield', 'Streak\nSchild', '#EF4444'),
    ('treasure_chest', 'Schatz\nTruhe', '#7C3AED'),
    ('level_up_pill', 'Level-\nSprung', '#FF00E4'),
    ('coin_pouch', 'Blitz-\nBeutel', '#FFD700'),
    ('streak_freeze', 'Streak-\nRetter', '#3B82F6'),
]

for id, name, color in items:
    img = Image.new('RGBA', (512, 512), color)
    draw = ImageDraw.Draw(img)
    try:
        font = ImageFont.truetype('arial.ttf', 40)
    except Exception:
        font = ImageFont.load_default()
    text = name
    lines = text.split('\n')
    line_sizes = []
    for line in lines:
        bbox = font.getbbox(line)
        line_sizes.append((bbox[2] - bbox[0], bbox[3] - bbox[1]))
    w = max(w for w, _ in line_sizes)
    h = sum(h for _, h in line_sizes) + (len(lines) - 1) * 10
    y = (512 - h) / 2
    for line in lines:
        bbox = font.getbbox(line)
        line_w, line_h = bbox[2] - bbox[0], bbox[3] - bbox[1]
        draw.text(((512 - line_w) / 2, y), line, fill='white', font=font)
        y += line_h + 10
    img.save(shop_dir / f'{id}.png')

print('created', len(items), 'shop placeholders')
