import re

with open('src/hooks/useClearanceFlow.ts', 'r') as f:
    content = f.read()

new_content = content.replace(
    """      // 4. Redirect the pre-opened tab
      if (targetWin && !targetWin.closed) {
        targetWin.location.href = payloadUrl;
      } else {
        setState(prev => ({ ...prev, errorMsg: 'Pop-up was closed. Please use the direct link below.' }));
      }""",
    """      // 4. Redirect seamlessly in the same tab for a true 1-click experience
      if (targetWin && !targetWin.closed) {
        targetWin.location.href = payloadUrl;
      } else {
        setTimeout(() => {
          window.location.href = payloadUrl;
        }, 500);
      }"""
)

with open('src/hooks/useClearanceFlow.ts', 'w') as f:
    f.write(new_content)

with open('src/components/ClearanceButton.tsx', 'r') as f:
    content = f.read()

new_content2 = content.replace(
    """  const handleStartHandshake = () => {
    // Open a blank tab first to bypass pop-up blockers
    const targetWin = window.open('', '_blank');
    if (targetWin) {
      targetWin.document.body.innerHTML = `
        <div style="background:#0f172a; color:#f8fafc; display:flex; flex-direction:column; justify-content:center; align-items:center; height:100vh; margin:0; font-family:sans-serif;">
          <div style="padding:24px; border:1px solid #1e293b; background:#1e293b50; border-radius:24px; text-align:center;">
            <b style="font-size:1.2rem; display:block; margin-bottom:8px;">🔐 Processing Request</b>
            <small style="opacity:0.6; font-size:0.9rem;">Verifying connection and preparing details...</small>
            <div style="margin-top:20px; color:#6366f1;">Connecting to information node...</div>
          </div>
        </div>
      `;
    } else {
      setPopMessage(true);
      setTimeout(() => setPopMessage(false), 5000);
    }
    
    triggerHandshake(targetWin);
  };""",
    """  const handleStartHandshake = () => {
    // Trigger handshake seamlessly on the same page for 1-click experience.
    // No popup, so no popup blockers.
    triggerHandshake(null);
  };"""
)

with open('src/components/ClearanceButton.tsx', 'w') as f:
    f.write(new_content2)
