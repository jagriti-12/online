const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

// Create database connection
const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

async function setupDatabase() {
  console.log('🚀 Setting up GlamourCosmetics database...');

  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON');

  // Create tables
  const tables = [
    // Users table
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      city TEXT,
      zipCode TEXT,
      isOwner BOOLEAN DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // Categories table
    `CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // Products table
    `CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      originalPrice DECIMAL(10,2),
      brand TEXT NOT NULL,
      imageUrl TEXT,
      stock INTEGER DEFAULT 0,
      categoryId INTEGER,
      featured BOOLEAN DEFAULT 0,
      isActive BOOLEAN DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (categoryId) REFERENCES categories(id)
    )`,

    // Cart items table
    `CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      productId INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (productId) REFERENCES products(id)
    )`,

    // Orders table
    `CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      total DECIMAL(10,2) NOT NULL,
      status TEXT DEFAULT 'pending',
      shippingFirstName TEXT NOT NULL,
      shippingLastName TEXT NOT NULL,
      shippingEmail TEXT NOT NULL,
      shippingPhone TEXT,
      shippingAddress TEXT NOT NULL,
      shippingCity TEXT NOT NULL,
      shippingState TEXT NOT NULL,
      shippingZipCode TEXT NOT NULL,
      paymentMethod TEXT DEFAULT 'credit_card',
      paymentStatus TEXT DEFAULT 'pending',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    )`,

    // Order items table
    `CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId INTEGER NOT NULL,
      productId INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (orderId) REFERENCES orders(id),
      FOREIGN KEY (productId) REFERENCES products(id)
    )`,

    // Offers table
    `CREATE TABLE IF NOT EXISTS offers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      discountPercentage DECIMAL(5,2) DEFAULT 0,
      discountAmount DECIMAL(10,2),
      startDate DATETIME,
      endDate DATETIME,
      isActive BOOLEAN DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  // Create all tables
  for (const table of tables) {
    await new Promise((resolve, reject) => {
      db.run(table, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  console.log('✅ Database tables created successfully');

  // Insert sample data
  await insertSampleData();
  
  console.log('🎉 Database setup completed successfully!');
  console.log('\n📧 Owner Login Credentials:');
  console.log('Email: owner@glamourcosmetics.com');
  console.log('Password: Owner123!');
  console.log('\n👤 Test User Login Credentials:');
  console.log('Email: user@example.com');
  console.log('Password: User123!');
  
  db.close();
}

async function insertSampleData() {
  console.log('📝 Inserting sample data...');

  // Hash passwords
  const ownerPassword = await bcrypt.hash('Owner123!', 10);
  const userPassword = await bcrypt.hash('User123!', 10);

  // Insert users
  const users = [
    {
      email: 'owner@glamourcosmetics.com',
      password: ownerPassword,
      firstName: 'Store',
      lastName: 'Owner',
      isOwner: 1
    },
    {
      email: 'user@example.com',
      password: userPassword,
      firstName: 'Jane',
      lastName: 'Doe',
      isOwner: 0
    }
  ];

  for (const user of users) {
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT OR IGNORE INTO users (email, password, firstName, lastName, isOwner) VALUES (?, ?, ?, ?, ?)',
        [user.email, user.password, user.firstName, user.lastName, user.isOwner],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  // Insert categories
  const categories = [
    { name: 'Lipsticks', description: 'Premium lipsticks in various shades' },
    { name: 'Lip Liners', description: 'Precision lip liners for perfect definition' },
    { name: 'Foundation', description: 'Full coverage foundations for all skin types' },
    { name: 'Eyeshadow', description: 'Vibrant eyeshadow palettes and singles' },
    { name: 'Mascara', description: 'Volumizing and lengthening mascaras' },
    { name: 'Blush', description: 'Natural and bold blush colors' }
  ];

  for (const category of categories) {
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT OR IGNORE INTO categories (name, description) VALUES (?, ?)',
        [category.name, category.description],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  // Insert products
  const products = [
    // Lipsticks
    { name: 'Ruby Red Lipstick', description: 'Classic ruby red lipstick with long-lasting formula', price: 24.99, originalPrice: 29.99, brand: 'GlamourCosmetics', stock: 50, categoryId: 1, featured: 1 },
    { name: 'Rose Pink Lipstick', description: 'Soft rose pink shade perfect for everyday wear', price: 22.99, brand: 'GlamourCosmetics', stock: 45, categoryId: 1, featured: 1 },
    { name: 'Berry Burst Lipstick', description: 'Deep berry shade with matte finish', price: 26.99, brand: 'GlamourCosmetics', stock: 30, categoryId: 1, featured: 0 },
    { name: 'Coral Dream Lipstick', description: 'Vibrant coral shade with creamy texture', price: 23.99, brand: 'GlamourCosmetics', stock: 40, categoryId: 1, featured: 1 },
    
    // Lip Liners
    { name: 'Precision Red Liner', description: 'Perfect red lip liner for precise application', price: 12.99, brand: 'GlamourCosmetics', stock: 60, categoryId: 2, featured: 0 },
    { name: 'Nude Pink Liner', description: 'Natural nude pink liner for everyday use', price: 11.99, brand: 'GlamourCosmetics', stock: 55, categoryId: 2, featured: 0 },
    { name: 'Deep Berry Liner', description: 'Rich berry liner for bold looks', price: 13.99, brand: 'GlamourCosmetics', stock: 35, categoryId: 2, featured: 0 },
    
    // Foundation
    { name: 'Flawless Coverage Foundation', description: 'Full coverage foundation for all-day wear', price: 39.99, originalPrice: 44.99, brand: 'GlamourCosmetics', stock: 25, categoryId: 3, featured: 1 },
    { name: 'Natural Glow Foundation', description: 'Medium coverage with natural finish', price: 34.99, brand: 'GlamourCosmetics', stock: 30, categoryId: 3, featured: 0 },
    { name: 'Matte Perfection Foundation', description: 'Oil-free matte foundation for oily skin', price: 36.99, brand: 'GlamourCosmetics', stock: 20, categoryId: 3, featured: 0 },
    
    // Eyeshadow
    { name: 'Sunset Palette', description: '12-shade eyeshadow palette with warm tones', price: 49.99, originalPrice: 59.99, brand: 'GlamourCosmetics', stock: 15, categoryId: 4, featured: 1 },
    { name: 'Smoky Eyes Palette', description: 'Professional smoky eye palette with 8 shades', price: 42.99, brand: 'GlamourCosmetics', stock: 20, categoryId: 4, featured: 0 },
    { name: 'Natural Nudes Palette', description: 'Everyday nude eyeshadow palette', price: 38.99, brand: 'GlamourCosmetics', stock: 25, categoryId: 4, featured: 0 },
    
    // Mascara
    { name: 'Volume Max Mascara', description: 'Dramatic volume and length mascara', price: 18.99, brand: 'GlamourCosmetics', stock: 40, categoryId: 5, featured: 0 },
    { name: 'Waterproof Mascara', description: 'Long-lasting waterproof formula', price: 21.99, brand: 'GlamourCosmetics', stock: 35, categoryId: 5, featured: 0 },
    
    // Blush
    { name: 'Peachy Keen Blush', description: 'Natural peach blush for a healthy glow', price: 16.99, brand: 'GlamourCosmetics', stock: 45, categoryId: 6, featured: 0 },
    { name: 'Rose Gold Blush', description: 'Shimmery rose gold blush for special occasions', price: 19.99, brand: 'GlamourCosmetics', stock: 30, categoryId: 6, featured: 0 }
  ];

  for (const product of products) {
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT OR IGNORE INTO products (name, description, price, originalPrice, brand, stock, categoryId, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [product.name, product.description, product.price, product.originalPrice || null, product.brand, product.stock, product.categoryId, product.featured],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  // Insert sample offers
  const offers = [
    {
      title: 'Summer Sale - 25% Off All Lipsticks',
      description: 'Get 25% off on all lipstick products. Limited time offer!',
      discountPercentage: 25,
      isActive: 1
    },
    {
      title: 'Buy 2 Get 1 Free - Eyeshadow Palettes',
      description: 'Purchase any 2 eyeshadow palettes and get the third one absolutely free!',
      discountPercentage: 33,
      isActive: 1
    },
    {
      title: 'Free Shipping on Orders Over $50',
      description: 'Enjoy free shipping on all orders above $50. No code needed!',
      discountAmount: 5.99,
      isActive: 1
    }
  ];

  for (const offer of offers) {
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT OR IGNORE INTO offers (title, description, discountPercentage, discountAmount, isActive) VALUES (?, ?, ?, ?, ?)',
        [offer.title, offer.description, offer.discountPercentage || 0, offer.discountAmount || null, offer.isActive],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  console.log('✅ Sample data inserted successfully');
}

// Run the setup
setupDatabase().catch(console.error);