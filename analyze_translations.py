import os
import re
import json

# Find all translation keys used in components
used_keys = set()
used_keys_per_file = {}
component_dirs = {
    'src/components/auth': [],
    'src/components/common': [],
    'src/components/dashboard': [],
    'src/components/home': [],
    'src/components/profile': []
}

for component_dir in component_dirs:
    if os.path.exists(component_dir):
        for file in os.listdir(component_dir):
            if file.endswith('.js'):
                filepath = os.path.join(component_dir, file)
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    # Match patterns like t('key') or t("key")
                    matches = re.findall(r"t\(['\"]([^'\"]+)['\"]\)", content)
                    file_keys = set(matches)
                    used_keys.update(file_keys)
                    component_dirs[component_dir].append({
                        'file': file,
                        'keys': sorted(file_keys)
                    })

# Find all defined keys in i18n.js
defined_keys = set()
if os.path.exists('src/i18n.js'):
    with open('src/i18n.js', 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
        # Match pattern like "key":
        matches = re.findall(r'"([^"]+)":\s*"', content)
        defined_keys.update(matches)

# Find missing keys
missing_keys = sorted(used_keys - defined_keys)

print('=' * 80)
print('TRANSLATION KEY ANALYSIS REPORT')
print('=' * 80)
print()
print(f'Total unique keys used in components: {len(used_keys)}')
print(f'Total keys defined in i18n.js: {len(defined_keys)}')
print(f'Missing keys (used but not defined): {len(missing_keys)}')
print()

if missing_keys:
    print('=' * 80)
    print('MISSING KEYS THAT NEED TO BE ADDED TO i18n.js')
    print('=' * 80)
    for i, key in enumerate(missing_keys, 1):
        print(f'{i}. "{key}"')
    print()

print('=' * 80)
print('WHERE EACH MISSING KEY IS USED')
print('=' * 80)
print()

for missing_key in missing_keys:
    print(f'\n{missing_key}:')
    for dir_name, files_data in component_dirs.items():
        for file_info in files_data:
            if missing_key in file_info['keys']:
                print(f'  - {dir_name}/{file_info["file"]}')
