import re

gs_path  = r'C:\Users\Trader\easyChef-Pro-Ops-Center\Operations_DriveExport.gs'
txt_path = r'C:\Users\Trader\easyChef-Pro-Ops-Center\tmp_p4_export_fns2.txt'

with open(txt_path, 'r', encoding='utf-8') as f:
    new_code = f.read()

with open(gs_path, 'r', encoding='utf-8') as f:
    existing = f.read()

# Remove old version if present (both function definitions)
def remove_fn(src, fn_name):
    # Find function start
    idx = src.find('function ' + fn_name + '(')
    if idx == -1:
        return src
    # Find matching closing brace
    depth = 0
    i = idx
    start_found = False
    while i < len(src):
        if src[i] == '{':
            depth += 1
            start_found = True
        elif src[i] == '}':
            depth -= 1
            if start_found and depth == 0:
                # Remove from the function keyword back to the previous newline
                line_start = src.rfind('\n', 0, idx)
                if line_start == -1:
                    line_start = 0
                return src[:line_start] + src[i+1:]
        i += 1
    return src

# Remove comment lines + old function blocks
for fn in ['_dpairSafe', 'exportEmailsAsDocs', 'exportSocialAsDocs']:
    existing = remove_fn(existing, fn)

# Remove trailing whitespace/newlines introduced
existing = existing.rstrip() + '\n'

# Append new code
existing += '\n' + new_code

with open(gs_path, 'w', encoding='utf-8') as f:
    f.write(existing)

print('Replaced export functions in Operations_DriveExport.gs')
