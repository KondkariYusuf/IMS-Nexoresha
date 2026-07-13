import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

import { User, Role } from './models/index.js';

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.DB_URI);
        console.log('Connected to MongoDB');

        let adminRole = await Role.findOne({ name: 'admin' });

        if (!adminRole) {
            adminRole = await Role.create({
                name: 'admin',
                description: 'System administrator',
            });

            console.log('Admin role created');
        }

        const existingAdmin = await User.findOne({
            email: 'admin@example.com',
        });

        if (existingAdmin) {
            console.log('Admin already exists');
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash('Admin@123', 10);

        await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            mobileNo: '9999999999',
            password: hashedPassword,
            roleId: adminRole._id,
            profileStatus: 'Active',
        });

        console.log('Admin user created successfully');
        console.log('Email: admin@example.com');
        console.log('Password: Admin@123');

        process.exit(0);
    } catch (error) {
        console.error('Seed admin failed:', error);
        process.exit(1);
    }
};

seedAdmin();