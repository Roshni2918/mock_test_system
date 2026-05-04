const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mock_test_system';

async function createAdmin() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // Check if admin already exists
    const existing = await db.collection('users').findOne({ email: 'admin@example.com' });
    if (existing) {
      console.log('Admin user already exists!');
      console.log('Email: admin@example.com');
      return;
    }
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const result = await db.collection('users').insertOne({
      name: 'Admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      batch: null,
      exam_type: null,
      created_at: new Date()
    });
    
    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    console.log('ID:', result.insertedId);
    
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  } finally {
    await client.close();
  }
}

createAdmin();
