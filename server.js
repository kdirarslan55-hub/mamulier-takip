const express = require('express');
const Database = require('better-sqlite3');

const app = express();
const db = new Database('votes.db');

db.exec(`CREATE TABLE IF NOT EXISTS votes (
  urun_idx INTEGER,
  kisi TEXT,
  oy TEXT,
  PRIMARY KEY (urun_idx, kisi)
)`);

app.use(express.json());
app.use(express.static('public', { etag: false, maxAge: 0 }));

app.get('/api/votes', (req, res) => {
  const rows = db.prepare('SELECT * FROM votes').all();
  const result = {};
  rows.forEach(r => {
    if (!result[r.urun_idx]) result[r.urun_idx] = {};
    result[r.urun_idx][r.kisi] = r.oy;
  });
  res.json(result);
});

app.post('/api/vote', (req, res) => {
  const { urun_idx, kisi, oy } = req.body;
  if (!['Şura','Ebru','Sema','Öznur'].includes(kisi)) return res.status(400).json({error:'Geçersiz kişi'});
  if (!['iste','iade','pas'].includes(oy)) return res.status(400).json({error:'Geçersiz oy'});
  db.prepare('INSERT OR REPLACE INTO votes (urun_idx, kisi, oy) VALUES (?,?,?)').run(urun_idx, kisi, oy);
  res.json({ok:true});
});

app.delete('/api/vote', (req, res) => {
  const { urun_idx, kisi } = req.body;
  db.prepare('DELETE FROM votes WHERE urun_idx=? AND kisi=?').run(urun_idx, kisi);
  res.json({ok:true});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Sunucu calisiyor: ${PORT}`));
