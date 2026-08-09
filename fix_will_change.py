import os
import re

def fix_files(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.css', '.tsx', '.ts')):
                path = os.path.join(root, file)
                with open(path, 'r') as f:
                    content = f.read()
                
                # CSS replacements
                new_content = re.sub(r'will-change:\s*[^;]+;', '/* will-change removed for perf */', content)
                
                # TSX/Tailwind replacements
                new_content = new_content.replace('will-change-transform', '')
                new_content = new_content.replace('transform-gpu', '')
                
                if new_content != content:
                    with open(path, 'w') as f:
                        f.write(new_content)

fix_files('src')
