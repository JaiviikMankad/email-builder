// src/ConnectOutlook.jsx
import React, { useEffect, useState } from 'react';

export default function ConnectOutlook({ onConnected }) {
  const [connected, setConnected] = useState([]);

  useEffect(() => {
    // listen for popup message
    function handleMessage(e) {
      if (!e.data || e.data.type !== 'outlook_connected') return;
      const email = e.data.email;
      setConnected(prev => {
        if (!prev.includes(email)) {
          const next = [...prev, email];
          onConnected && onConnected(email);
          return next;
        }
        return prev;
      });
    }
    window.addEventListener('message', handleMessage);
    // initial load of connected accounts
    fetch(`${process.env.REACT_APP_BACKEND_ORIGIN || 'http://localhost:5000'}/connected`)
      .then(r => r.json())
      .then(list => setConnected(list.map(i => i.email)))
      .catch(()=>{});
    return () => window.removeEventListener('message', handleMessage);
  }, [onConnected]);

  const openPopup = () => {
    const url = `${process.env.REACT_APP_BACKEND_ORIGIN || 'http://localhost:5000'}/auth/outlook`;
    const w = window.open(url, 'outlook_oauth', 'width=600,height=700');
    if (!w) alert('Popup blocked — allow popups for this site');
  };

  return (
    <div>
      <button onClick={openPopup}>Connect Outlook</button>
      <div style={{ marginTop: 8 }}>
        <strong>Connected accounts:</strong>
        <ul>
          {connected.length === 0 && <li>(none)</li>}
          {connected.map(e => <li key={e}>{e}</li>)}
        </ul>
      </div>
    </div>
  );
}
