import re

with open("server.ts", "r") as f:
    content = f.read()

# Make app global
if "const app = express();" in content and "async function startServer() {" in content:
    content = content.replace("async function startServer() {\n  const app = express();\n", "const app = express();\nasync function startServer() {\n")
    content = content.replace("async function startServer() {\r\n  const app = express();\r\n", "const app = express();\r\nasync function startServer() {\r\n")

# Remove startServer() at the bottom if running in Vercel
bottom_code = """    } else {
      console.error('[SERVER ERROR]', err);
    }
  });
}

startServer();"""

new_bottom = """    } else {
      console.error('[SERVER ERROR]', err);
    }
  });
}

// Only start the server if we're not running in a serverless environment like Vercel
if (!process.env.VERCEL) {
  startServer();
}

export default app;"""

if bottom_code in content:
    content = content.replace(bottom_code, new_bottom)
    with open("server.ts", "w") as f:
        f.write(content)
    print("server.ts patched successfully!")
else:
    print("Could not find bottom_code to patch server.ts!")
