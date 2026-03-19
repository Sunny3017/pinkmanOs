const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '24h'
  });
};

const login = async (req, res) => {
  const { username, email, password } = req.body;
  const loginId = (username || email || '').trim();

  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'Server misconfiguration: JWT_SECRET is missing' });
    }
    if (!process.env.JWT_COOKIE_NAME) {
      console.warn('[auth] JWT_COOKIE_NAME not set; using default "token"');
    }
    if (!loginId || !password) {
      return res.status(400).json({ error: 'username/email and password are required' });
    }

    const user = await User.findOne({ username: loginId });

    if (!user || !(await user.comparePassword(password))) {
      console.warn('[auth] login failed', {
        loginId,
        ip: req.ip,
        ua: req.headers['user-agent'],
      });
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    if (user.expiryDate < new Date()) {
      return res.status(403).json({ error: 'Account has expired' });
    }

    const token = generateToken(user._id);
    const cookieName = process.env.JWT_COOKIE_NAME || 'token';
    const isProd = process.env.NODE_ENV === 'production';

    res.cookie(cookieName, token, {
      httpOnly: true,
      secure: isProd, // requires app.set('trust proxy', 1) behind proxies
      sameSite: isProd ? 'none' : 'lax', // cross-site in prod (Netlify -> Render)
      path: '/',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    user.lastLoginAt = new Date();
    await user.save();

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        allowedSearchLimit: user.allowedSearchLimit,
        totalSearchUsed: user.totalSearchUsed,
        expiryDate: user.expiryDate
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const logout = (req, res) => {
  const cookieName = process.env.JWT_COOKIE_NAME || 'token';
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie(cookieName, {
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
  });
  res.json({ message: 'Logged out successfully' });
};

const getMe = async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      username: req.user.username,
      role: req.user.role,
      allowedSearchLimit: req.user.allowedSearchLimit,
      totalSearchUsed: req.user.totalSearchUsed,
      expiryDate: req.user.expiryDate
    }
  });
};

module.exports = { login, logout, getMe };
