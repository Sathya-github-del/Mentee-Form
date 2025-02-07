const { Admin } = require('./db.cjs');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@gmail.com' });
    if (existingAdmin) {
      console.log('Admin already exists');
      return;
    }

    // Create new admin with specified credentials
    const hashedPassword = await bcrypt.hash('admin000', 10);
    const admin = new Admin({
      email: 'admin@gmail.com',
      password: hashedPassword
    });

    await admin.save();
    console.log('Admin created successfully with email: admin@gmail.com');
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    // Close the connection after creating admin
    process.exit();
  }
}

// Run the function
createAdmin();
