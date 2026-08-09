import os

file_path = 'src/components/clearance/ClearanceReady.tsx'
with open(file_path, 'r') as f:
    content = f.read()
content = content.replace('Access Information', 'Continue')
content = content.replace('Node expires in', 'Session ends in')
with open(file_path, 'w') as f:
    f.write(content)

file_path = 'src/components/clearance/ClearanceError.tsx'
with open(file_path, 'r') as f:
    content = f.read()
content = content.replace('Process Interrupted', 'Loading Error')
content = content.replace('Restart Process', 'Try Again')
with open(file_path, 'w') as f:
    f.write(content)
