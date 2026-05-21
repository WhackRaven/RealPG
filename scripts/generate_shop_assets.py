from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

shop_dir = Path('assets/images/shop')
shop_dir.mkdir(parents=True, exist_ok=True)

size = 512
font_path = None
try:
    font = ImageFont.truetype('arial.ttf', 48)
except Exception:
    font = ImageFont.load_default()

items = [
    ('legendary_avatar.png', 'legendary_avatar'),
    ('golden_frame.png', 'golden_frame'),
    ('joker_card.png', 'joker_card'),
    ('neon_theme.png', 'neon_theme'),
    ('xp_booster.png', 'xp_booster'),
    ('coins_booster.png', 'coins_booster'),
    ('streak_shield.png', 'streak_shield'),
    ('treasure_chest.png', 'treasure_chest'),
    ('level_up_pill.png', 'level_up_pill'),
    ('coin_pouch.png', 'coin_pouch'),
    ('streak_freeze.png', 'streak_freeze'),
]

for filename, item in items:
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    def rounded_rect(box, radius, fill, outline=None, width=0):
        x0, y0, x1, y1 = box
        draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)

    if item == 'legendary_avatar':
        rounded_rect((56, 56, 456, 456), 80, (255, 214, 102, 255), outline=(255, 180, 0, 255), width=16)
        draw.polygon([(256, 140), (340, 320), (172, 320)], fill=(255, 120, 20, 255))
        draw.ellipse((184, 200, 328, 344), fill=(255, 255, 255, 255), outline=(200, 100, 0, 255), width=12)
        draw.ellipse((216, 250, 248, 282), fill=(0, 0, 0, 255))
        draw.ellipse((264, 250, 296, 282), fill=(0, 0, 0, 255))
    elif item == 'golden_frame':
        rounded_rect((56, 56, 456, 456), 60, (0, 0, 0, 0), outline=(255, 215, 0, 255), width=24)
        rounded_rect((116, 116, 396, 396), 40, (0, 0, 0, 0), outline=(255, 238, 153, 255), width=20)
        draw.line((256, 80, 256, 120), fill=(255, 238, 153, 255), width=18)
        draw.line((80, 256, 120, 256), fill=(255, 238, 153, 255), width=18)
    elif item == 'joker_card':
        rounded_rect((56, 56, 456, 456), 40, (255, 245, 238, 255), outline=(180, 60, 180, 255), width=16)
        draw.text((120, 64), 'J', font=font, fill=(128, 0, 128, 255))
        draw.text((360, 360), 'J', font=font, fill=(128, 0, 128, 255))
        draw.ellipse((156, 156, 356, 356), fill=(255, 102, 102, 255), outline=(128, 0, 128, 255), width=14)
        draw.ellipse((212, 220, 252, 260), fill=(255, 255, 255, 255))
        draw.ellipse((268, 220, 308, 260), fill=(255, 255, 255, 255))
        draw.ellipse((228, 240, 242, 254), fill=(0, 0, 0, 255))
        draw.ellipse((284, 240, 298, 254), fill=(0, 0, 0, 255))
    elif item == 'neon_theme':
        rounded_rect((56, 56, 456, 456), 80, (12, 10, 40, 255), outline=(37, 170, 255, 255), width=16)
        draw.rectangle((126, 210, 386, 302), fill=(24, 0, 74, 255))
        draw.text((156, 220), 'NEON', font=font, fill=(255, 0, 255, 255))
        draw.line((100, 120, 412, 120), fill=(0, 255, 255, 255), width=8)
    elif item == 'xp_booster':
        draw.ellipse((96, 96, 416, 416), fill=(18, 105, 200, 255), outline=(100, 190, 255, 255), width=18)
        draw.ellipse((156, 156, 356, 356), fill=(135, 206, 250, 255))
        txt = 'XP'
        bbox = font.getbbox(txt)
        w, h = bbox[2]-bbox[0], bbox[3]-bbox[1]
        draw.text(((size-w)/2, (size-h)/2), txt, font=font, fill=(255, 255, 255, 255))
    elif item == 'coins_booster':
        rounded_rect((136, 126, 376, 386), 40, (82, 51, 17, 255), outline=(194, 116, 35, 255), width=18)
        draw.rectangle((156, 196, 356, 286), fill=(195, 140, 35, 255))
        for y in (220, 250, 280):
            draw.ellipse((180, y, 260, y+40), fill=(255, 215, 0, 255), outline=(196, 142, 0, 255), width=8)
    elif item == 'streak_shield':
        draw.polygon([(256, 96), (386, 196), (326, 388), (186, 388), (126, 196)], fill=(220, 50, 50, 255), outline=(190, 40, 40, 255))
        draw.polygon([(256, 156), (320, 266), (286, 266), (286, 330), (226, 330), (226, 266), (192, 266)], fill=(255, 195, 50, 255))
    elif item == 'treasure_chest':
        draw.rectangle((116, 206, 396, 336), fill=(120, 70, 20, 255), outline=(220, 160, 80, 255), width=14)
        draw.rectangle((116, 146, 396, 236), fill=(180, 110, 30, 255), outline=(230, 170, 90, 255), width=14)
        draw.ellipse((176, 236, 256, 316), fill=(160, 100, 30, 255))
        draw.ellipse((236, 216, 336, 296), fill=(170, 120, 85, 255))
        draw.ellipse((196, 186, 276, 266), fill=(180, 220, 255, 255))
    elif item == 'level_up_pill':
        draw.ellipse((116, 156, 396, 356), fill=(255, 182, 255, 255), outline=(200, 40, 190, 255), width=16)
        draw.rectangle((256-40, 156, 256+40, 356), fill=(255, 255, 255, 255))
        draw.polygon([(256, 180), (280, 220), (232, 220)], fill=(255, 50, 120, 255))
    elif item == 'coin_pouch':
        draw.ellipse((136, 166, 376, 386), fill=(179, 100, 30, 255), outline=(140, 70, 20, 255), width=14)
        draw.rectangle((156, 120, 356, 206), fill=(210, 150, 60, 255), outline=(170, 110, 40, 255), width=12)
        for y in (176, 216, 256):
            draw.ellipse((196, y, 296, y+40), fill=(255, 215, 0, 255), outline=(210, 170, 30, 255), width=8)
    elif item == 'streak_freeze':
        draw.polygon([(256, 96), (386, 196), (326, 388), (186, 388), (126, 196)], fill=(65, 150, 255, 255), outline=(40, 100, 220, 255))
        draw.line((256, 156, 256, 356), fill=(255, 255, 255, 255), width=20)
        draw.line((176, 236, 336, 236), fill=(255, 255, 255, 255), width=20)

    img.save(shop_dir / filename)

print('Generated shop assets: ' + ', '.join(f[0] for f in items))
