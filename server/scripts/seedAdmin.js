require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { MONGO_URI } = require('../config');

// Admin credentials (có thể thay đổi qua environment variables)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_FULLNAME = process.env.ADMIN_FULLNAME || 'Administrator';

async function seedAdmin() {
  try {
    // Connect to MongoDB
    console.log('Đang kết nối MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Đã kết nối MongoDB thành công');

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      $or: [
        { email: ADMIN_EMAIL },
        { username: ADMIN_USERNAME },
        { role: 'admin' }
      ]
    });

    if (existingAdmin) {
      console.log('⚠️  Tài khoản admin đã tồn tại!');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Username: ${existingAdmin.username}`);
      console.log(`   Role: ${existingAdmin.role}`);
      
      // Ask if user wants to update password
      if (process.argv.includes('--update-password')) {
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
        existingAdmin.password = hashedPassword;
        existingAdmin.verified = true;
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('✅ Đã cập nhật mật khẩu admin thành công!');
      } else {
        console.log('   Để cập nhật mật khẩu, chạy: npm run seed:admin -- --update-password');
      }
      
      await mongoose.connection.close();
      return;
    }

    // Hash password
    console.log('Đang hash mật khẩu...');
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    // Create admin user
    console.log('Đang tạo tài khoản admin...');
    const admin = new User({
      username: ADMIN_USERNAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin',
      verified: true, // Admin không cần verify qua email
      fullName: ADMIN_FULLNAME
    });

    await admin.save();

    console.log('✅ Tạo tài khoản admin thành công!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Thông tin đăng nhập:');
    console.log(`   Username: ${ADMIN_USERNAME}`);
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  Lưu ý: Hãy đổi mật khẩu sau khi đăng nhập!');

    // Close connection
    await mongoose.connection.close();
    console.log('Đã đóng kết nối MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi khi tạo tài khoản admin:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run seed
seedAdmin();

