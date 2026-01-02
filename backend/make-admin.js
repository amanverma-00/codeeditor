// Script to make a user an admin
// Usage: node make-admin.js <email>

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  firstName: String,
  emailId: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isVerified: Boolean,
  problemSolved: [String]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function makeAdmin(email) {
  try {
    if (!email) {
      console.error('❌ Please provide an email address');
      console.log('Usage: node make-admin.js <email>');
      process.exit(1);
    }

    // Find user by email
    const user = await User.findOne({ emailId: email });

    if (!user) {
      console.error(`❌ User with email "${email}" not found`);
      process.exit(1);
    }

    // Check if already admin
    if (user.role === 'admin') {
      console.log(`ℹ️ User "${email}" is already an admin`);
      process.exit(0);
    }

    // Update to admin
    user.role = 'admin';
    await user.save();

    console.log(`✅ Successfully made "${email}" an admin!`);
    console.log(`   Name: ${user.firstName}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Verified: ${user.isVerified}`);
    console.log('\n⚠️ Please logout and login again for changes to take effect.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

// Get email from command line arguments
const email = process.argv[2];
makeAdmin(email);
