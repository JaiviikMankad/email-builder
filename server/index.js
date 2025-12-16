// server/index.js
const dotenv = require("dotenv");
dotenv.config();
const tenantId = process.env.OUTLOOK_TENANT_ID;
console.log("Loaded Tenant ID:", tenantId);

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000' }));
app.use(express.json({ limit: '10mb' }));

// Simple token store (file). For production use a DB.
const TOKENS_FILE = path.join(__dirname, 'tokens.json');
function loadTokens() {
  try {
    return JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf8'));
  } catch (e) {
    return {};
  }
}
function saveTokens(tokens) {
  fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokens, null, 2));
}

// Utility: refresh token if needed
async function refreshAccessToken(refresh_token) {
  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  const params = new URLSearchParams({
    client_id: process.env.OUTLOOK_CLIENT_ID,
    client_secret: process.env.OUTLOOK_CLIENT_SECRET,
    grant_type: 'refresh_token',
    refresh_token,
    scope: 'offline_access openid email Mail.Send',
  });

  const resp = await axios.post(tokenUrl, params.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return resp.data; // contains access_token, refresh_token, expires_in
}

// Step 1: Start OAuth flow (frontend calls this to open MS login)
app.get('/auth/outlook', (req, res) => {
  const redirectUri = process.env.BACKEND_REDIRECT_URI || 'http://localhost:5000/auth/outlook/callback';
  const params = new URLSearchParams({
    client_id: process.env.OUTLOOK_CLIENT_ID,
    response_type: 'code',
    redirect_uri: redirectUri,
    response_mode: 'query',
    scope: 'openid offline_access email Mail.Send',
    // Optionally state param can be added for CSRF protection
  });

  const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?${params.toString()}`;
  res.redirect(authUrl);
});

// Step 2: Callback - exchange code for tokens
app.get('/auth/outlook/callback', async (req, res) => {
  try {
    const code = req.query.code;
    if (!code) return res.status(400).send('No code provided');

    const redirectUri = process.env.BACKEND_REDIRECT_URI;
    const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
    const params = new URLSearchParams({
      client_id: process.env.OUTLOOK_CLIENT_ID,
      client_secret: process.env.OUTLOOK_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    });

    const tokenResp = await axios.post(tokenUrl, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const tokens = tokenResp.data; 

    // Get user email using Graph
    const profile = await axios.get('https://graph.microsoft.com/v1.0/me', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const email = profile.data.mail || profile.data.userPrincipalName;

    // Save tokens keyed by email
    const store = loadTokens();
    store[email] = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: Date.now() + (tokens.expires_in || 3600) * 1000,
      obtained_at: Date.now(),
    };
    saveTokens(store);

    // After connect, we can redirect to frontend success page / close popup
    // If frontend opens a popup, it can detect the redirect URL.
    const frontendSuccess = process.env.FRONTEND_ORIGIN ;
    return res.send(`<script>
      // notify opener (if opened as popup)
      if (window.opener) {
        window.opener.postMessage({ type: 'outlook_connected', email: "${email}" }, "${frontendSuccess}");
        window.close();
      } else {
        // otherwise redirect to frontend
        window.location = "${frontendSuccess}";
      }
    </script>`);
  } catch (err) {
    console.error('Callback error', err.response?.data || err.message || err);
    return res.status(500).send('OAuth callback error. Check server logs.');
  }
});

// Endpoint: list connected accounts (reads tokens.json)
app.get('/connected', (req, res) => {
  const store = loadTokens();
  // return email and expiry info
  const list = Object.entries(store).map(([email, t]) => ({
    email,
    expires_at: t.expires_at,
  }));
  res.json(list);
});

// Endpoint: send mail on behalf of a connected user
app.post('/send-mail', async (req, res) => {
  try {
    const { fromEmail, to, cc, subject, html } = req.body;
    if (!fromEmail || !to || !subject || !html) {
      return res.status(400).json({ error: 'fromEmail, to, subject, html are required' });
    }

    const store = loadTokens();
    const entry = store[fromEmail];
    if (!entry) return res.status(400).json({ error: 'No tokens found for this email. Connect first.' });

    // refresh token if expired or near expiry
    if (!entry.access_token || Date.now() > (entry.expires_at - 60 * 1000)) {
      console.log('Refreshing token for', fromEmail);
      const refreshed = await refreshAccessToken(entry.refresh_token);
      entry.access_token = refreshed.access_token;
      entry.refresh_token = refreshed.refresh_token || entry.refresh_token;
      entry.expires_at = Date.now() + (refreshed.expires_in || 3600) * 1000;
      saveTokens(store);
    }

    // send email using Graph - sendMail endpoint
    const sendUrl = 'https://graph.microsoft.com/v1.0/users/' + encodeURIComponent(fromEmail) + '/sendMail';
    // message object
    const message = {
      message: {
        subject,
        body: { contentType: 'HTML', content: html },
        toRecipients: Array.isArray(to) ? to.map(t => ({ emailAddress: { address: t } })) : [{ emailAddress: { address: to } }],
        ccRecipients: cc ? (Array.isArray(cc) ? cc.map(c => ({ emailAddress: { address: c } })) : [{ emailAddress: { address: cc } }]) : [],
      },
      saveToSentItems: true,
    };

    // call Graph
    await axios.post(sendUrl, message, {
      headers: { Authorization: `Bearer ${entry.access_token}`, 'Content-Type': 'application/json' },
    });

    return res.json({ success: true });
  } catch (err) {
    console.error('send-mail error', err.response?.data || err.message || err);
    return res.status(500).json({ error: err.response?.data || err.message || err });
  }
});

// simple health
app.get('/', (req, res) => res.send('Outlook OAuth backend running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
