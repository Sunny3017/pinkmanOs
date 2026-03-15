const axios = require('axios');
const User = require('../models/User');
const Log = require('../models/Log');

const redactData = (data, role) => {
  if (role === 'admin') {
    return data;
  }

  const redactSingle = (item) => {
    const { name, address, circle } = item;
    return {
      name,
      address,
      circle,
      father_name: '********',
      alternate_number: '********',
      email: '********',
      aadhaar: '********'
    };
  };

  if (Array.isArray(data)) {
    return data.map(redactSingle);
  }

  return redactSingle(data);
};

const searchPhone = async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) {
    return res.status(400).json({ error: 'Please provide a valid 10-digit phone number' });
  }

  const user = req.user;

  // Check search limits
  if (user.totalSearchUsed >= user.allowedSearchLimit) {
    return res.status(403).json({ error: 'Search limit exceeded' });
  }

  try {
    const apiUrl = `${process.env.EXTERNAL_API_BASE_URL}?match=${phoneNumber}`;
    const response = await axios.get(apiUrl);

    if (response.data.error) {
      // Log the failed search
      await Log.create({
        userId: user._id,
        username: user.username,
        phoneNumber,
        status: 'failure',
        error: response.data.error
      });
      return res.status(404).json({ error: response.data.error });
    }

    const result = response.data.result;

    if (!result || (Array.isArray(result) && result.length === 0)) {
      return res.status(404).json({ error: 'No records found' });
    }

    // Update user usage
    user.totalSearchUsed += 1;
    user.lastSearchAt = new Date();
    await user.save();

    // Log the successful search
    await Log.create({
      userId: user._id,
      username: user.username,
      phoneNumber,
      status: 'success'
    });

    res.json({
      result: result, // No redaction, show full data
      usage: {
        totalSearchUsed: user.totalSearchUsed,
        allowedSearchLimit: user.allowedSearchLimit
      }
    });
  } catch (error) {
    // Log the error
    await Log.create({
      userId: user._id,
      username: user.username,
      phoneNumber,
      status: 'failure',
      error: error.message
    });
    res.status(500).json({ error: 'External API error, please try again later' });
  }
};

module.exports = { searchPhone };
