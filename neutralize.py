import os

# 1. NeutralSyncButton.tsx
file_path = 'src/components/NeutralSyncButton.tsx'
with open(file_path, 'r') as f:
    content = f.read()

content = content.replace(
    'const msgs = ["Verifying Security...", "Checking Human...", "Generating Link..."];',
    'const msgs = ["Loading resources...", "Optimizing view...", "Preparing content..."];'
)
content = content.replace('setSyncMessage("Connecting Node...");', 'setSyncMessage("Syncing...");')
content = content.replace('setSyncMessage("Starting Download...");', 'setSyncMessage("Completing...");')
content = content.replace('<span>Download</span>', '<span>Proceed</span>')
content = content.replace('Safety Status: Verified', 'System: Ready')

with open(file_path, 'w') as f:
    f.write(content)

# 2. ClearanceButton.tsx
file_path = 'src/components/ClearanceButton.tsx'
with open(file_path, 'r') as f:
    content = f.read()

content = content.replace('Access Information', 'Continue')
content = content.replace('Processing Request', 'Loading Page')
content = content.replace('Verifying connection and preparing details...', 'Preparing layout and content...')
content = content.replace('Connecting to information node...', 'Loading resources...')

with open(file_path, 'w') as f:
    f.write(content)

# 3. ClearanceLoading.tsx
file_path = 'src/components/clearance/ClearanceLoading.tsx'
with open(file_path, 'r') as f:
    content = f.read()

content = content.replace('"Verifying Security..."', '"Fetching assets..."')
content = content.replace('"Checking Human..."', '"Rendering view..."')
content = content.replace('"Connecting Node..."', '"Applying styles..."')
content = content.replace('"Generating Link..."', '"Optimizing layout..."')
content = content.replace('Connecting to secure node...', 'Loading resources...')
content = content.replace('Secure connection active', 'System Ready')

with open(file_path, 'w') as f:
    f.write(content)
