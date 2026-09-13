import re

with open('src/server/services/communityStoreService.ts', 'r') as f:
    content = f.read()

# Replace any withTimeout(..., <small number>, ...) with withTimeout(..., 15000, ...)
content = re.sub(r'withTimeout\(([^,]+(?:,[^,]+)*),\s*(3000|3500|4000|5000),\s*null\)', r'withTimeout(\1, 15000, null)', content)

with open('src/server/services/communityStoreService.ts', 'w') as f:
    f.write(content)
