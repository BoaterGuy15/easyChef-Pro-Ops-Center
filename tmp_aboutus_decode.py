import json, base64, sys, os

sys.stdout.reconfigure(encoding='utf-8')

with open(
    r'C:\Users\Trader\.claude\projects\C--Users-Trader-easyChef-Pro-Ops-Center-firebase-deploy'
    r'\dc1fbe53-095e-4dd4-9661-387e9b453132\tool-results'
    r'\mcp-claude_ai_Google_Drive-download_file_content-1779286193665.txt',
    'r', encoding='utf-8'
) as f:
    raw = f.read()

data = json.loads(raw)
content = base64.b64decode(data['content']).decode('utf-8')

# Write decoded content to a temp file
with open(r'C:\Users\Trader\easyChef-Pro-Ops-Center\tmp_about_us_current.txt', 'w', encoding='utf-8') as out:
    out.write(content)

lines = content.split('\n')
print(f'Total lines: {len(lines)}')
print('Done writing tmp_about_us_current.txt')
