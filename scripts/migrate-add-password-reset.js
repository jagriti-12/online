const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

function getUserColumns() {
  return new Promise((resolve, reject) => {
    db.all('PRAGMA table_info(users);', (err, rows) => {
      if (err) return reject(err);
      resolve(rows.map(r => r.name));
    });
  });
}

function addColumnIfMissing(column, type) {
  return new Promise(async (resolve, reject) => {
    try {
      const cols = await getUserColumns();
      if (!cols.includes(column)) {
        const sql = `ALTER TABLE users ADD COLUMN ${column} ${type}`;
        db.run(sql, (err) => {
          if (err) return reject(err);
          console.log(`✅ Added column: ${column}`);
          resolve();
        });
      } else {
        console.log(`ℹ️  Column already exists: ${column}`);
        resolve();
      }
    } catch (e) { reject(e); }
  });
}

(async function run() {
  try {
    console.log('🔧 Migrating users table to add password reset columns (if missing)...');
    await addColumnIfMissing('resetToken', 'TEXT');
    await addColumnIfMissing('resetTokenExpires', 'DATETIME');
    console.log('✅ Migration complete.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exitCode = 1;
  } finally {
    db.close();
  }
})();