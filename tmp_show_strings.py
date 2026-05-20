import sys
sys.stdout.reconfigure(encoding='utf-8')

with open(r'C:\Users\Trader\easyChef-Pro-Ops-Center\tmp_about_us_current.txt', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Show exact content for the sections we need to patch
sections = [
    (52, 57, 'hero body'),
    (82, 95, 'section2 body'),
    (189, 195, 'section5 lead'),
    (200, 212, 'feat1 body - deterministic by design'),
    (217, 230, 'feat2 body - DNI'),
    (435, 452, 'timeline Q2 2026'),
    (500, 506, 'cta body'),
]
for start, end, name in sections:
    print(f'\n=== {name} (lines {start}-{end}) ===')
    for i in range(start-1, min(end, len(lines))):
        print(repr(lines[i].rstrip('\n')))
