import re

with open('src/server/services/communityStoreService.ts', 'r') as f:
    content = f.read()

target = """        const queryPromises = [
          db.collection('reviews').where('appId', '==', cleanId).limit(5000).get(),
          db.collection('reviews').where('appSlug', '==', cleanId).limit(5000).get(),
        ];"""

replacement = """        const queryPromises = [
          withTimeout(db.collection('reviews').where('appId', '==', cleanId).limit(5000).get(), 3000, null),
          withTimeout(db.collection('reviews').where('appSlug', '==', cleanId).limit(5000).get(), 3000, null),
        ];"""

if target in content:
    content = content.replace(target, replacement)
    with open('src/server/services/communityStoreService.ts', 'w') as f:
        f.write(content)
    print("Fixed admin timeout!")
else:
    print("Not found!")

