const mongoose = require('mongoose');
require('dotenv').config();
const uri = process.env.DB_URI;
console.log('Connecting to:', uri);
mongoose.connect(uri).then(async () => {
  const db = mongoose.connection.db;
  const user = await db.collection('users').findOne({ email: 'studentest1765@gmail.com' });
  console.log('User:', user ? user._id : 'Not Found');
  if (user) {
    const student = await db.collection('students').findOne({ userId: String(user._id) });
    console.log('Student enrolledCourseIds:', student?.enrolledCourseIds);
    if (student && student.enrolledCourseIds) {
       const sessions = await db.collection('sessions').find({ courseId: { $in: student.enrolledCourseIds } }).toArray();
       console.log('Sessions count for student courses:', sessions.length);
       if (sessions.length > 0) {
          console.log('First session status:', sessions[0].status, 'date:', sessions[0].sessionDateAndTime);
       }
    } else {
        console.log('Student has no enrolledCourseIds');
    }
  }
  
  const allSessions = await db.collection('sessions').find().toArray();
  console.log('Total sessions in DB:', allSessions.length);

  const assignments = await db.collection('assignments').find().toArray();
  console.log('Total assignments in DB:', assignments.length);
  process.exit(0);
}).catch(console.error);
