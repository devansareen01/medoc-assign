const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'refreshsecret';
const ACCESS_TOKEN_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['doctor', 'lab_assistant'],
    required: true
  },
  refreshTokens: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAccessToken = function() {
  return jwt.sign({ id: this._id, role: this.role }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
};

userSchema.methods.generateRefreshToken = function() {
  return jwt.sign({ id: this._id }, REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
};

userSchema.statics.createUser = async function({ username, password, role }) {
  return this.create({ username, password, role });
};

userSchema.statics.findByUsername = function(username) {
  return this.findOne({ username });
};

module.exports = mongoose.model('User', userSchema); 