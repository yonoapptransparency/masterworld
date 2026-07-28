const fs = require('fs');
let code = fs.readFileSync('src/components/FirebaseStatusPanel.tsx', 'utf8');

const oldCheckStatus = `      try {
        const response = await fetch('/api/v1/admin/firebase-status');
        if (response.ok) {
          if (mounted) {
            setFirestoreStatus('connected');
            setAuthStatus('connected');
          }
        } else {
          if (mounted) {
            setFirestoreStatus('disconnected');
            setAuthStatus('disconnected');
          }
        }
      } catch (err) {
        if (mounted) {
          setFirestoreStatus('disconnected');
          setAuthStatus('disconnected');
        }
      }`;

const newCheckStatus = `      try {
        const response = await fetch('/api/v1/admin/firebase-status');
        if (response.ok) {
          const data = await response.json();
          if (mounted) {
            setFirestoreStatus(data.status === 'live' ? 'connected' : 'disconnected');
            // Assuming Auth is up if we can hit our own backend and Firebase is minimally configured
            setAuthStatus(auth ? 'connected' : 'disconnected');
          }
        } else {
          if (mounted) {
            setFirestoreStatus('disconnected');
            setAuthStatus('disconnected');
          }
        }
      } catch (err) {
        if (mounted) {
          setFirestoreStatus('disconnected');
          setAuthStatus('disconnected');
        }
      }`;

code = code.replace(oldCheckStatus, newCheckStatus);
fs.writeFileSync('src/components/FirebaseStatusPanel.tsx', code);
