import os
import glob

def remove_blur(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.tsx', '.ts')):
                path = os.path.join(root, file)
                with open(path, 'r') as f:
                    content = f.read()
                
                new_content = content.replace('backdrop-blur-md', '').replace('backdrop-blur-xl', '').replace('backdrop-blur-sm', '').replace('backdrop-blur-2xl', '')
                
                if new_content != content:
                    with open(path, 'w') as f:
                        f.write(new_content)

remove_blur('src')
