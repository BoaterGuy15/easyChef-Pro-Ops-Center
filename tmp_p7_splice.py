gs_path  = r'C:\Users\Trader\easyChef-Pro-Ops-Center\Operations_ConvertSync.gs'
txt_path = r'C:\Users\Trader\easyChef-Pro-Ops-Center\tmp_p7_convert_fns.txt'

with open(txt_path, 'r', encoding='utf-8') as f:
    new_code = f.read()

with open(gs_path, 'r', encoding='utf-8') as f:
    existing = f.read()

if 'function activateConvertExperiment' in existing:
    print('ALREADY PRESENT — skipping')
else:
    with open(gs_path, 'a', encoding='utf-8') as f:
        f.write('\n' + new_code)
    print('Appended Convert.com P7 functions to Operations_ConvertSync.gs')
