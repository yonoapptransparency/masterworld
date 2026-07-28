const fs = require('fs');
let code = fs.readFileSync('src/contexts/DataContext.tsx', 'utf8');

const oldCheck = `        const testDoc = doc(db, 'store_data', 'public_settings');
        // Use soft cached getDoc instead of getDocFromServer to avoid active network error logs
        await getDoc(testDoc);
        setIsConnected(true);`;

const newCheck = `        const testDoc = doc(db, 'store_data', 'public_settings');
        // Use getDocFromServer to test real connectivity (Bug 13)
        await getDocFromServer(testDoc);
        setIsConnected(true);`;

code = code.replace(oldCheck, newCheck);
fs.writeFileSync('src/contexts/DataContext.tsx', code);
