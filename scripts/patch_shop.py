from pathlib import Path
import re

path = Path('app/(tabs)/shop.tsx')
text = path.read_text(encoding='utf8')

# Import Image
text, count = re.subn(r"from 'react-native';", "from 'react-native';", text)
if "Alert,\n  Image" not in text and "Alert,\n  Image\n" not in text:
    text = text.replace("  Alert\n} from 'react-native';", "  Alert,\n  Image\n} from 'react-native';")

# Replace shop items with image requires
replacements = {
    "legendary_avatar": "{ id: 'legendary_avatar', name: 'Legendärer Fuchs', price: 100, icon: Ghost, color: '#FF7F24', category: 'Avatar', description: 'Ein mystischer Look für deinen Begleiter.', image: require('../../assets/images/shop/legendary_avatar.png') },",
    "golden_frame": "{ id: 'golden_frame', name: 'Goldener Rahmen', price: 50, icon: Shield, color: '#FFD700', category: 'Style', description: 'Zeige allen deinen Reichtum.', image: require('../../assets/images/shop/golden_frame.png') },",
    "joker_card": "{ id: 'joker_card', name: 'Joker-Karte', price: 30, icon: Star, color: '#EC4899', category: 'Item', description: 'Überspringe eine Quest ohne XP-Verlust.', image: require('../../assets/images/shop/joker_card.png') },",
    "neon_theme": "{ id: 'neon_theme', name: 'Neon Theme', price: 200, icon: Palette, color: '#00CD00', category: 'Theme', description: 'Die App leuchtet in futuristischen Farben.', image: require('../../assets/images/shop/neon_theme.png') },",
    "xp_booster": "{ id: 'xp_booster', name: 'XP Booster', price: 150, icon: Sparkles, color: '#3B82F6', category: 'Buff', description: 'Doppelte XP für die nächsten 3 Quests.', image: require('../../assets/images/shop/xp_booster.png') },",
    "coins_booster": "{ id: 'coins_booster', name: 'Blitz-Booster', price: 100, icon: Zap, color: '#FF7F24', category: 'Buff', description: 'Mehr Blitze für abgeschlossene Aufgaben.', image: require('../../assets/images/shop/coins_booster.png') },",
    "streak_shield": "{ id: 'streak_shield', name: 'Streak-Schild', price: 75, icon: Flame, color: '#EF4444', category: 'Item', description: 'Schützt deinen Streak für einen Tag.', image: require('../../assets/images/shop/streak_shield.png') },",
    "treasure_chest": "{ id: 'treasure_chest', name: 'Schatztruhe', price: 500, icon: Gem, color: '#7C3AED', category: 'Special', description: 'Enthält ein zufälliges seltenes Item!', image: require('../../assets/images/shop/treasure_chest.png') },",
    "level_up_pill": "{ id: 'level_up_pill', name: 'Level-Sprung', price: 250, icon: Sparkles, color: '#FF00E4', category: 'Buff', description: 'Gibt dir sofort 300 XP auf dein Konto.', image: require('../../assets/images/shop/level_up_pill.png') },",
    "coin_pouch": "{ id: 'coin_pouch', name: 'Blitz-Beutel', price: 50, icon: Zap, color: '#FFD700', category: 'Special', description: 'Enthält zwischen 20 und 150 Blitze.', image: require('../../assets/images/shop/coin_pouch.png') },",
    "streak_freeze": "{ id: 'streak_freeze', name: 'Streak-Retter', price: 75, icon: Shield, color: '#3B82F6', category: 'Buff', description: 'Verhindert den Verlust deines Streaks.', image: require('../../assets/images/shop/streak_freeze.png') },",
}
for key, replacement in replacements.items():
    pattern = re.compile(r"\{ id: '%s',.*?\}," % re.escape(key), re.DOTALL)
    text, n = pattern.subn(replacement, text)
    if n == 0:
        raise SystemExit(f'Could not replace shop item {key}')

# Replace icon display block
old_block = "        <View style={[s.iconContainer, { backgroundColor: `${item.color}20` }]}>\n          <IconComponent color={item.color} size={32} />\n          {ownedItem && item.category !== 'Avatar' && (\n            <View style={s.ownedBadge}>\n              <Text style={s.ownedBadgeText}>×{ownedItem.quantity}</Text>\n            </View>\n          )}\n        </View>\n"
new_block = "        <View style={[s.iconContainer, { backgroundColor: `${item.color}20` }]}>\n          {item.image ? (\n            <Image source={item.image} style={s.itemImage} resizeMode=\"contain\" />\n          ) : (\n            <IconComponent color={item.color} size={32} />\n          )}\n          {ownedItem && item.category !== 'Avatar' && (\n            <View style={s.ownedBadge}>\n              <Text style={s.ownedBadgeText}>×{ownedItem.quantity}</Text>\n            </View>\n          )}\n        </View>\n"
if old_block not in text:
    raise SystemExit('Icon render block not found')
text = text.replace(old_block, new_block, 1)

# Add itemImage style to both Light and Dark sections
style_pattern = "  iconContainer: {\n    width: 70,\n    height: 70,\n    borderRadius: 35,\n    justifyContent: 'center',\n    alignItems: 'center',\n    marginBottom: 12,\n  },\n  ownedBadge: {\n"
insert = "  iconContainer: {\n    width: 70,\n    height: 70,\n    borderRadius: 35,\n    justifyContent: 'center',\n    alignItems: 'center',\n    marginBottom: 12,\n  },\n  itemImage: { width: 48, height: 48 },\n  ownedBadge: {\n"
count = text.count(style_pattern)
if count < 2:
    raise SystemExit(f'Expected 2 style pattern occurrences, found {count}')
text = text.replace(style_pattern, insert, 1)
text = text.replace(style_pattern, insert, 1)

path.write_text(text, encoding='utf8')
print('patched shop.tsx')
