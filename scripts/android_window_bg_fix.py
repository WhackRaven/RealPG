from pathlib import Path

base_dir = Path(__file__).resolve().parent.parent
styles = base_dir / 'android' / 'app' / 'src' / 'main' / 'res' / 'values' / 'styles.xml'
colors = base_dir / 'android' / 'app' / 'src' / 'main' / 'res' / 'values' / 'colors.xml'
night_colors = base_dir / 'android' / 'app' / 'src' / 'main' / 'res' / 'values-night' / 'colors.xml'

styles_text = styles.read_text('utf-8')
old = (
    '  <style name="AppTheme" parent="Theme.AppCompat.DayNight.NoActionBar">\n'
    '    <item name="android:enforceNavigationBarContrast" tools:targetApi="29">true</item>\n'
    '    <item name="android:editTextBackground">@drawable/rn_edit_text_material</item>\n'
    '    <item name="colorPrimary">@color/colorPrimary</item>\n'
    '    <item name="android:statusBarColor">#ffffff</item>\n'
)
new = (
    '  <style name="AppTheme" parent="Theme.AppCompat.DayNight.NoActionBar">\n'
    '    <item name="android:enforceNavigationBarContrast" tools:targetApi="29">true</item>\n'
    '    <item name="android:editTextBackground">@drawable/rn_edit_text_material</item>\n'
    '    <item name="android:windowBackground">@color/window_background</item>\n'
    '    <item name="colorPrimary">@color/colorPrimary</item>\n'
    '    <item name="android:statusBarColor">@color/status_bar_color</item>\n'
)
if 'android:windowBackground' not in styles_text:
    styles.write_text(styles_text.replace(old, new), 'utf-8')

colors_text = colors.read_text('utf-8')
add = ''
if 'window_background' not in colors_text:
    add += '  <color name="window_background">#FFFFFF</color>\n'
if 'status_bar_color' not in colors_text:
    add += '  <color name="status_bar_color">#FFFFFF</color>\n'
if add:
    colors.write_text(colors_text.replace('</resources>', add + '</resources>'), 'utf-8')

night_colors.parent.mkdir(parents=True, exist_ok=True)
if not night_colors.exists():
    night_colors.write_text(
        '<resources>\n'
        '  <color name="splashscreen_background">#000000</color>\n'
        '  <color name="window_background">#0F172A</color>\n'
        '  <color name="status_bar_color">#0F172A</color>\n'
        '</resources>\n',
        'utf-8'
    )
else:
    nt = night_colors.read_text('utf-8')
    add = ''
    if 'window_background' not in nt:
        add += '  <color name="window_background">#0F172A</color>\n'
    if 'status_bar_color' not in nt:
        add += '  <color name="status_bar_color">#0F172A</color>\n'
    if add:
        night_colors.write_text(nt.replace('</resources>', add + '</resources>'), 'utf-8')

print('updated android theme files')