const fs = require('fs');
let config = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));

if (!config.functions) {
  config.functions = {
    "api/**/*": {
      "includeFiles": "src/lib/*.json"
    }
  };
} else if (config.functions["api/**/*"]) {
  config.functions["api/**/*"].includeFiles = "src/lib/*.json";
} else {
  config.functions["api/**/*"] = { "includeFiles": "src/lib/*.json" };
}

fs.writeFileSync('vercel.json', JSON.stringify(config, null, 2));
