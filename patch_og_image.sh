sed -i 's|return absUrl.replace(|let finalUrl = absUrl.replace(|' src/seo/utils.ts
sed -i 's|);|);\n    return finalUrl.replace(/\\.webp$/i, ".jpg").replace(/\\.png$/i, ".jpg");|' src/seo/utils.ts
