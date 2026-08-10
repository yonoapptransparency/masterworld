const fs = require('fs');
let code = fs.readFileSync('src/server/routes/securityRoutes.ts', 'utf8');

const targetStr = "    } catch (fsFallbackErr) {";
const replaceStr = "      }\n    } catch (fsFallbackErr) {";

if (code.includes(targetStr)) {
    code = code.replace(targetStr, replaceStr);
    fs.writeFileSync('src/server/routes/securityRoutes.ts', code, 'utf8');
    console.log("Fixed brace");
} else {
    console.log("Not found target");
}

