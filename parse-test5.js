const fs = require('fs');
const ts = require('typescript');
const program = ts.createProgram(['src/server/routes/securityRoutes.ts'], {});
const diagnostics = ts.getPreEmitDiagnostics(program);
if (diagnostics.length > 0) {
    console.log("Errors:", diagnostics.length);
} else {
    console.log("No errors");
}
