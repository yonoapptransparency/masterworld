import re

with open('src/server/services/communityStoreService.ts', 'r') as f:
    content = f.read()

content = content.replace(
    'const doc = await withTimeout(..., 15000, null);',
    "const doc = await withTimeout(db.collection(collectionPath).doc(docId).get(), 15000, null);"
)

content = content.replace(
    'const snapshot = await withTimeout(..., 15000, null);',
    "const snapshot = await withTimeout(db.collection(collectionPath).get(), 15000, null);"
)

lines = content.split('\n')
for i, line in enumerate(lines):
    if 'const res = await withTimeout(..., 15000, null);' in line:
        if 'safeDeleteDb' in "\n".join(lines[i-15:i]):
            lines[i] = line.replace('withTimeout(..., 15000, null)', "withTimeout(db.collection(collectionPath).doc(docId).delete(), 15000, null)")
        elif 'safeWriteDb' in "\n".join(lines[i-15:i]):
            lines[i] = line.replace('withTimeout(..., 15000, null)', "withTimeout(db.collection(collectionPath).doc(docId).set(data, { merge }), 15000, null)")

for i, line in enumerate(lines):
    if 'withTimeout(..., 15000, null),' in line:
        if 'queryPromises =' in lines[i-1]:
            lines[i] = line.replace('withTimeout(..., 15000, null),', "withTimeout(db.collection('reviews').where('appId', '==', cleanId).limit(5000).get(), 15000, null),")
            lines[i+1] = lines[i+1].replace('withTimeout(..., 15000, null),', "withTimeout(db.collection('reviews').where('appSlug', '==', cleanId).limit(5000).get(), 15000, null),")


with open('src/server/services/communityStoreService.ts', 'w') as f:
    f.write('\n'.join(lines))
