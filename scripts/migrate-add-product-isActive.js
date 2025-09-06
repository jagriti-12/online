const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

function getProductColumns() {
  return new Promise((resolve, reject) => {
    db.all('PRAGMA table_info(products);', (err, rows) => {
      if (err) return reject(err);
      resolve(rows.map(r => r.name));
    });
  });
}

(async function run() {
  try {
    console.log('🔧 Migrating products table to add isActive (if missing)...');
    const cols = await getProductColumns();
    if (!cols.includes('isActive')) {
      await new Promise((resolve, reject) => {
        db.run('ALTER TABLE products ADD COLUMN isActive BOOLEAN DEFAULT 1', (err) => {
          if (err) return reject(err);
          console.log('✅ Added column: isActive');
          resolve();
        });
      });
    } else {
      console.log('ℹ️  Column already exists: isActive');
    }
    console.log('✅ Migration complete.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exitCode = 1;
  } finally {
    db.close();
  }
})();