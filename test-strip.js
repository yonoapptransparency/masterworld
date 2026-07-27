const html = `<!DOCTYPE html>
<html>
<head>
<style>body{color:red}</style>
<title>Title</title>
</head>
<body>
<h1>Hello</h1>
<p>World</p>
</body>
</html>`;
const stripHtmlWrapper = (html) => {
  if (!html) return html;
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) return bodyMatch[1].trim();
  return html.replace(/<!DOCTYPE[^>]*>/gi, '')
             .replace(/<html[^>]*>/gi, '')
             .replace(/<\/html>/gi, '')
             .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
             .replace(/<body[^>]*>/gi, '')
             .replace(/<\/body>/gi, '').trim();
};
console.log(stripHtmlWrapper(html));
console.log("---");
console.log(stripHtmlWrapper("<h1>Hello</h1>"));
