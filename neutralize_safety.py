import os

file_path = 'src/pages/SafetyStatus.tsx'
with open(file_path, 'r') as f:
    content = f.read()

content = content.replace(
    'This synchronization node ensures a secure connection between your device and the official resource server.',
    'This synchronization process optimizes the connection between your device and the primary resource server.'
)

with open(file_path, 'w') as f:
    f.write(content)
