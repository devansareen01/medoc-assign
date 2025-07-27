const express = require('express');
const db = require('../../model/db');
const { validateUserRegister, validateUserLogin } = require('../../utils/validation');
const asyncHandler = require('../../middleware/asyncHandler');
const { validationResult } = require('express-validator');
const createError = require('../../utils/createError');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

const REFRESH_SECRET = process.env.REFRESH_SECRET || 'refreshsecret';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication and authorization
 */

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}




/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - role
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [doctor, lab_assistant]
 *     responses:
 *       201:
 *         description: User registered successfully
 *       409:
 *         description: Username already exists
 */
router.post(
  '/register',
  validateUserRegister,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { username, password, role } = req.body;
    const existing = await db.User.findByUsername(username);
    if (existing) throw createError('Username already exists', 409);
    const user = await db.User.createUser({ username, password, role });
    res.status(201).json({ id: user._id, username: user.username, role: user.role });
  })
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login
 *       401:
 *         description: Invalid credentials
 */
router.post(
  '/login',
  validateUserLogin,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    const user = await db.User.findByUsername(username);
    if (!user) throw createError('Invalid credentials', 401);
    const match = await user.comparePassword(password);
    if (!match) throw createError('Invalid credentials', 401);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    if (!user.refreshTokens.includes(refreshToken)) {
      user.refreshTokens.push(refreshToken);
      await user.save();
    }
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      path: '/api/auth/refresh-token',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    res.json({
      accessToken,
      user: { id: user._id, username: user.username, role: user.role }
    });
  })
);

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh access token using refresh token cookie
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: New access token issued
 *       400:
 *         description: No refresh token provided
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post('/refresh-token', asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) throw createError('No refresh token provided', 400);
  let payload;
  try {
    payload = jwt.verify(refreshToken, REFRESH_SECRET);
  } catch {
    throw createError('Invalid or expired refresh token', 401);
  }
  const user = await db.User.findById(payload.id);
  if (!user || !user.refreshTokens.includes(refreshToken)) {
    throw createError('Invalid refresh token', 401);
  }
  const accessToken = user.generateAccessToken();
  res.json({ accessToken });
}));

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user and clear refresh token cookie
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out
 *       400:
 *         description: No refresh token provided
 */
router.post('/logout', asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) throw createError('No refresh token provided', 400);
  const user = await db.User.findOne({ refreshTokens: refreshToken });
  if (user) {
    user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
    await user.save();
  }
  res.clearCookie('refreshToken', { path: '/api/auth/refresh-token' });
  res.json({ message: 'Logged out' });
}));

module.exports = router; 