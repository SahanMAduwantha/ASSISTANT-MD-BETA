const { default: makeWASocket, useSingleFileAuthState } = require('@adiwajshing/baileys');
const express = require('express');
const app = express();
const { state, saveState } = useSingleFileAuthState('./auth_info.json');

app.use(express.static('public')); // Static files for web interface

app.get('/qr', (req, res) => {
  const sock = makeWASocket({
    auth: state,
  });

  sock.ev.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    res.send(`<html><body><h1>Scan this QR Code to login</h1><img src="https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qr)}&size=200x200" alt="QR Code" /></body></html>`);
  });

  sock.ev.on('creds.update', saveState);

  sock.connect();
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
