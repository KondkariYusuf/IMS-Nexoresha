import 'dotenv/config';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { User } from '../src/models/index.js';

async function updateEmails() {
  console.log('Connecting to database:', process.env.DB_URI);
  await connectDatabase(process.env.DB_URI);
  
  // Update student user email to a Gmail alias to bypass unique index error
  const studentUser = await User.findOne({ email: 'student@example.com' });
  if (studentUser) {
    studentUser.email = 'mohdsaadkhan073+student@gmail.com';
    await studentUser.save();
    console.log('Updated student@example.com to: mohdsaadkhan073+student@gmail.com (routes to your inbox!)');
  }

  // Update instructor user email
  const instructorUser = await User.findOne({ email: 'instructor@example.com' });
  if (instructorUser) {
    instructorUser.email = 'mohdsaadkhan073@gmail.com';
    await instructorUser.save();
    console.log('Updated instructor@example.com to: mohdsaadkhan073@gmail.com');
  }
  
  await disconnectDatabase();
  console.log('Database disconnected.');
}

updateEmails().catch(console.error);
