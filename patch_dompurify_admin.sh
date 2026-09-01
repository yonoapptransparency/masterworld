sed -i 's/return DOMPurify.sanitize(enhancedStr);/return DOMPurify.sanitize(enhancedStr, { ADD_ATTR: ["target", "rel", "data-discover"] });/' src/lib/safeHtml.ts
