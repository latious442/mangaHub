const Pay = require('../models/Pay');
const User = require('../models/User');

const postPay = async (req, res) => {
  try {
    const { ph } = req.body;
    const payFile = req.file;
    const user = await User.findById(req.user._id).select('name');

    if (!ph || !payFile) {
      return res.status(400).json({ error: 'payment ss and ph-no are required' });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newPay = await Pay.create({
      username: user.name,
      user: user._id,
      ph,
      pay: payFile.filename,
    });
    console.log('payment posted');
    res.status(201).json(newPay);
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: 'Server error' });
  }
};


const getPay = async (req, res) => {
    try {
        const pay = await Pay.find();
        res.json(pay);
    } catch (error) {
        console.error('Error fetching payment data:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
};

module.exports={postPay , getPay};
