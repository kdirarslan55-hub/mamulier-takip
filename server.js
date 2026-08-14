const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const DATA_FILE = path.join(__dirname, 'votes.json');

function readVotes() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (e) {
    return {};
  }
}

function writeVotes(v) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(v));
  } catch (e) {
    console.error('Kaydetme hatasi:', e.message);
  }
}

app.use(express.json());
app.use(express.static('public', { etag: false, maxAge: 0 }));

app.get('/api/votes', (req, res) => {
  res.json(readVotes());
});

app.post('/api/vote', (req, res) => {
  const { urun_idx, kisi, oy } = req.body;
  if (!['Şura','Ebru','Sema','Öznur'].includes(kisi)) return res.status(400).json({error:'Gecersiz kisi'});
  if (!['iste','iade','pas'].includes(oy)) return res.status(400).json({error:'Gecersiz oy'});
  const votes = readVotes();
  if (!votes[urun_idx]) votes[urun_idx] = {};
  votes[urun_idx][kisi] = oy;
  writeVotes(votes);
  res.json({ok:true});
});

app.delete('/api/vote', (req, res) => {
  const { urun_idx, kisi } = req.body;
  const votes = readVotes();
  if (votes[urun_idx]) {
    delete votes[urun_idx][kisi];
    if (Object.keys(votes[urun_idx]).length === 0) delete votes[urun_idx];
  }
  writeVotes(votes);
  res.json({ok:true});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Sunucu calisiyor: ' + PORT));
