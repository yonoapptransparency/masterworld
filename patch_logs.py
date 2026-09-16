import re

with open('src/server/services/communityStoreService.ts', 'r') as f:
    content = f.read()

target = "public async queryAdminReviews(query: {"
replacement = """public async queryAdminReviews(query: {
    console.log("[DEBUG] queryAdminReviews STARTED", query);
    const startT = Date.now();
"""

if target in content:
    content = content.replace(target, replacement)
    
target2 = "return { \n      reviews: sliced, \n      stats, \n      globalStats: overview.globalStats,\n      appCounts: overview.appCounts,\n      totalCount: list.length \n    };"
replacement2 = """    console.log("[DEBUG] queryAdminReviews ENDED. Took:", Date.now() - startT, "ms");
""" + target2

if target2 in content:
    content = content.replace(target2, replacement2)

with open('src/server/services/communityStoreService.ts', 'w') as f:
    f.write(content)
