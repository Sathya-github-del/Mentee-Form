const { Admin } = require('./db.cjs');
const bcrypt = require('bcryptjs');

async function createAdmin() {
    try {
        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email: 'admin@mentorship.com' });
        if (existingAdmin) {
            console.log('Admin already exists');
            return;
        }

        // Create new admin with default credentials
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const admin = new Admin({
            email: 'admin@mentorship.com',
            password: hashedPassword
        });

        await admin.save();
        console.log('Admin created successfully');
    } catch (error) {
        console.error('Error creating admin:', error);
    }
}

createAdmin();
