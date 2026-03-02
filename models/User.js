import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^[a-zA-Z0-9._%+-]+@sastra\.ac\.in$/, // Strictly matches @sastra.ac.in
      'Please use a valid SASTRA college email ID',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false, // Don't return the password in API calls by default
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Encrypt password using bcrypt before saving to the database
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) { //only change password if it is modified
    return next();
  }
  const salt = await bcrypt.genSalt(10); // generate random salt
  this.password = await bcrypt.hash(this.password, salt); // perform hashing with the salt on to the password
});

export default mongoose.model('User', userSchema);