import os

gs_path  = r'C:\Users\Trader\easyChef-Pro-Ops-Center\Operations_DriveExport.gs'
txt_path = r'C:\Users\Trader\easyChef-Pro-Ops-Center\tmp_p4_export_fns.txt'

with open(txt_path, 'r', encoding='utf-8') as f:
    new_code = f.read()

with open(gs_path, 'r', encoding='utf-8') as f:
    existing = f.read()

if 'function exportEmailsAsDocs' in existing:
    print('ALREADY PRESENT — skipping')
else:
    with open(gs_path, 'a', encoding='utf-8') as f:
        f.write('\n' + new_code)
    print('Appended export functions to Operations_DriveExport.gs')
