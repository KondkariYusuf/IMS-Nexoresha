import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['forgot_password', 'change_password', 'verify_email'],
    default: 'forgot_password'
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: '10m' } // Automatically delete document after 10 minutes
  }
}, { timestamps: true });

// Prevent duplicate active OTPs for the same email and type by replacing them or handling it in service layer
const Otp = mongoose.model('Otp', otpSchema);

export default Otp;
