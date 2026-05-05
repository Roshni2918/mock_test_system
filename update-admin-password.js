const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb+srv://Roshni:Roshni123@cluster0.8sepz3g.mongodb.net/examDB';

async function updateAdminPassword() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const usersCollection = mongoose.connection.db.collection('users');

    // Hash the new password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    console.log('New hashed password:', hashedPassword);

    // Update admin user
    const result = await usersCollection.updateOne(
      { email: 'admin@example.com' },
      { 
        $set: { 
          password: hashedPassword 
        }
      }
    );

    if (result.matchedCount > 0) {
      console.log('Admin password updated successfully');
    } else {
      // Create admin user if doesn't exist
      await usersCollection.insertOne({
        name: 'Admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        created_at: new Date()
      });
      console.log('Admin user created successfully');
    }

    await mongoose.disconnect();
    console.log('Done');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateAdminPassword();
