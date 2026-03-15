const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '24h'
  });
};

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    if (user.expiryDate < new Date()) {
      return res.status(403).json({ error: 'Account has expired' });
    }

    const token = generateToken(user._id);

    res.cookie(process.env.JWT_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    user.lastLoginAt = new Date();
    await user.save();

    res.json({
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
  res.clearCookie(process.env.JWT_COOKIE_NAME);
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
