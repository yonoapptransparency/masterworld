import re

with open('src/server/services/communityStoreService.ts', 'r') as f:
    content = f.read()

target = """  public async queryAdminReviews(query: {
    console.log("[DEBUG] queryAdminReviews STARTED", query);
    const startT = Date.now();

    appId?: string;"""

replacement = """  public async queryAdminReviews(query: {
    appId?: string;"""

if target in content:
    content = content.replace(target, replacement)
    print("Fixed!")
else:
    print("Target not found!")

with open('src/server/services/communityStoreService.ts', 'w') as f:
    f.write(content)
