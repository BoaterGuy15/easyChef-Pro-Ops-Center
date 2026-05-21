import re, os

TEMPLATES = [
    ('email-templates/ALPHA-E1_v1.html', 'UM8eaZ'),
    ('email-templates/ALPHA-E2_v1.html', 'Tx68VK'),
    ('email-templates/ALPHA-E3_v1.html', 'XEjGdW'),
    ('email-templates/ALPHA-E4_v1.html', 'Uxet8P'),
    ('email-templates/ALPHA-E5_v1.html', 'QRKrLt'),
    ('email-templates/ALPHA-E6_v1.html', 'VC23Fh'),
]

def fix_liquid(html):
    # {{person.X|default('VALUE', true)}} → {{ person.X | default: 'VALUE' }}
    html = re.sub(
        r"\{\{person\.(\w+)\|default\('([^']+)',\s*true\)\}\}",
        r"{{ person.\1 | default: '\2' }}",
        html
    )
    # {{person.X|default(N, true)}} → {{ person.X | default: N }}
    html = re.sub(
        r"\{\{person\.(\w+)\|default\((\d+),\s*true\)\}\}",
        r"{{ person.\1 | default: \2 }}",
        html
    )
    return html

results = []
for path, tid in TEMPLATES:
    with open(path, 'r', encoding='utf-8') as f:
        original = f.read()
    fixed = fix_liquid(original)
    count = original.count('|default(') - fixed.count('|default(')
    with open(path, 'w', encoding='utf-8') as f:
        f.write(fixed)
    results.append({'file': path, 'template_id': tid, 'replacements': count})
    print(f"Fixed {path}: {count} replacements")

# Verify no Jinja2 default() remain
print("\n--- Verification ---")
for path, tid in TEMPLATES:
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    remaining = content.count('|default(')
    print(f"{path}: {remaining} Jinja2 default() remaining")

print("\nDone. Push each template_id to Klaviyo via klaviyo_update_template.")
