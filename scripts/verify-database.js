const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Verifying database contents...\n');

// Check users
db.all('SELECT id, email, firstName, lastName, isOwner FROM users', (err, users) => {
  if (err) {
    console.error('Error fetching users:', err);
    return;
  }
  
  console.log('👥 Users in database:');
  users.forEach(user => {
    console.log(`  - ${user.firstName} ${user.lastName} (${user.email}) ${user.isOwner ? '[OWNER]' : '[USER]'}`);
  });
  console.log();
});

// Check categories
db.all('SELECT * FROM categories', (err, categories) => {
  if (err) {
    console.error('Error fetching categories:', err);
    return;
  }
  
  console.log('📂 Categories in database:');
  categories.forEach(category => {
    console.log(`  - ${category.name}`);
  });
  console.log();
});

// Check products count
db.get('SELECT COUNT(*) as count FROM products', (err, result) => {
  if (err) {
    console.error('Error counting products:', err);
    return;
  }
  
  console.log(`📦 Total products: ${result.count}`);
});

// Check offers count
db.get('SELECT COUNT(*) as count FROM offers', (err, result) => {
  if (err) {
    console.error('Error counting offers:', err);
    return;
  }
  
  console.log(`🎁 Total offers: ${result.count}`);
  
  // Close database connection
  db.close();
  
  console.log('\n✅ Database verification completed!');
});