const fs = require('fs');
let code = fs.readFileSync('src/contexts/DataContext.tsx', 'utf8');

const oldCheck = `        await getDocFromServer(testDoc);
        setIsConnected(true);
      } catch (err: any) {`;

const newCheck = `        await getDocFromServer(testDoc);
        setIsConnected(true);
        setIsLive(true);
      } catch (err: any) {`;

code = code.replace(oldCheck, newCheck);
fs.writeFileSync('src/contexts/DataContext.tsx', code);
