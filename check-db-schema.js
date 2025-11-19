// Check database schema
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'tnr_database.db');
const db = new sqlite3.Database(dbPath);

db.all('PRAGMA table_info(clients)', (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Clients table has', rows.length, 'columns:\n');
    rows.forEach((r, i) => {
      console.log(`${i + 1}. ${r.name} (${r.type})`);
    });
    console.log('\nTotal columns:', rows.length);
  }
  db.close();
});

