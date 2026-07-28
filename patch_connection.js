const fs = require('fs');
let code = fs.readFileSync('src/contexts/DataContext.tsx', 'utf8');

const oldTest = `  const testCloudConnection = React.useCallback(async () => {
    if (!isFirebaseReal || !currentPath.startsWith('/' + getAdminPath())) return false;
    console.log("Connectivity Test: Starting...");
    const settingsDoc = doc(db, 'store_data', 'public_settings');
    
    try {
      const snap = await getDoc(settingsDoc);
      if (!snap.metadata.fromCache) {
        setIsConnected(true);
        setIsLive(true);
        return true;
      }
      return false;
    } catch (err: any) {
      console.warn("Connectivity Test: Read failed.", err.message || err);
      return false;
    }
  }, []);`;

const newTest = `  const testCloudConnection = React.useCallback(async () => {
    if (!isFirebaseReal) return false;
    console.log("Connectivity Test: Starting...");
    const settingsDoc = doc(db, 'store_data', 'public_settings');
    
    try {
      // Use getDocFromServer to force a network request
      await getDocFromServer(settingsDoc);
      setIsConnected(true);
      setIsLive(true);
      return true;
    } catch (err: any) {
      console.warn("Connectivity Test: Read failed.", err.message || err);
      return false;
    }
  }, []);`;

code = code.replace(oldTest, newTest);

const oldRefresh = `  const refreshAll = React.useCallback(async (silent = false) => {
    if (!isFirebaseReal || !currentPath.startsWith('/' + getAdminPath())) {
        setIsConnected(false);
        setLoading(false);
        return;
    }`;

const newRefresh = `  const refreshAll = React.useCallback(async (silent = false) => {
    if (!isFirebaseReal) {
        setIsConnected(false);
        setLoading(false);
        return;
    }`;

code = code.replace(oldRefresh, newRefresh);

fs.writeFileSync('src/contexts/DataContext.tsx', code);
