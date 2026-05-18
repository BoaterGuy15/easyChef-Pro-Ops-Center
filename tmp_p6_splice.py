gs_path  = r'C:\Users\Trader\easyChef-Pro-Ops-Center\Operations_KlaviyoSync.gs'
txt_path = r'C:\Users\Trader\easyChef-Pro-Ops-Center\tmp_p6_klaviyo_fns.txt'

with open(txt_path, 'r', encoding='utf-8') as f:
    new_code = f.read()

with open(gs_path, 'r', encoding='utf-8') as f:
    existing = f.read()

if 'function klaviyoBuildFlows' in existing:
    print('ALREADY PRESENT — skipping')
else:
    with open(gs_path, 'a', encoding='utf-8') as f:
        f.write('\n' + new_code)
    print('Appended Klaviyo P6 functions to Operations_KlaviyoSync.gs')
