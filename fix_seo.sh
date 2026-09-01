sed -i 's|    );|    );\n    return finalUrl.replace(/\\.webp$/i, ".jpg").replace(/\\.png$/i, ".jpg");|' src/seo/utils.ts
