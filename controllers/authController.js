import User from '../models/User.js'; 
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Helper to create the secure token
const generateToken = (id) => { 
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

  //jwt.sign is used for new token creation with key in .env file and payload as the mongodb id of the user
};

// Register a new SASTRA student
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;  //first collect the data of the user from the submitted form

    const userExists = await User.findOne({ email }); //check if the user already exists(edge case)
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password }); // add the new user to the database

    if (user) {  // send the user details back to the user with JWT inculded (JWT by his mongodb id)
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};




// @desc    Authenticate student & get token
// @route   POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user by email and explicitly include the password field
    // (Remember we set 'select: false' in the model for security)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // 2. Check if the password matches using the method we'll add to the model
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) { // sending result back to the client (includes token creation and user data after adding the user into database)
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      createdAt: req.user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};