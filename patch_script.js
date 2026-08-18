const fs = require('fs');
let code = fs.readFileSync('src/server/routes/securityRoutes.ts', 'utf8');

// The file ends with:
//    } catch (e) {}
//    }
//    return res.redirect(302, fallbackTarget);
//  } catch (error) {

const search = "    } catch (e) {}\n    }\n    return res.redirect(302, fallbackTarget);\n  } catch (error) {";
const replace = `    } catch (e) {}

    if (req.query.json === 'true' || (req.headers.accept && req.headers.accept.includes('application/json'))) {
      return res.json({ success: false, url: '', error: 'Link not configured' });
    }

    return res.status(404).send(\`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Link Not Configured - RummyDex</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body style="font-family: system-ui, sans-serif; background: #09090b; color: #f4f4f5; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 1rem;">
          <div style="text-align: center; max-width: 420px; width: 100%; padding: 2.5rem 2rem; background: #18181b; border-radius: 1.5rem; border: 1px solid #27272a;">
            <h2 style="font-size: 1.25rem; font-weight: 800; color: #ffffff; margin-bottom: 0.5rem;">Link Not Available</h2>
            <p style="color: #a1a1aa; font-size: 0.875rem; line-height: 1.5; margin-bottom: 1.5rem;">
              The download link for this application has not been configured yet. Please check back later.
            </p>
            <a href="/app/\${encodeURIComponent(realSlug || appId)}" style="display: inline-block; width: 100%; padding: 0.875rem 1.5rem; background: #2563eb; color: #ffffff; border-radius: 0.875rem; text-decoration: none; font-weight: 700; font-size: 0.875rem; box-sizing: border-box;">Go Back</a>
          </div>
        </body>
      </html>
    \`);
  } catch (error) {`;

code = code.replace(search, replace);
fs.writeFileSync('src/server/routes/securityRoutes.ts', code);
