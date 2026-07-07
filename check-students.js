import 'dotenv/config';
import mongoose from 'mongoose';
import { Student } from './src/models/index.js';
import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

mongoose.connect(process.env.DB_URI)
  .then(async () => {
    const students = await Student.find();
    console.log("Students in DB:", students.map(s => s._id));
    process.exit(0);
  })
  .catch(console.error);
