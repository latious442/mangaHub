const dotenv = require('dotenv');
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const homeRoutes = require('./routes/homeRoutes');
const mangaRoutes = require('./routes/mangaRoutes');
const serieRoutes = require('./routes/serieRoutes');
const payRoutes = require('./routes/payRoutes');
const adminRoutes = require('./routes/adminRoutes');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const { randomInt } = require('node:crypto');
const User = require('./models/User');
const Pay = require('./models/Pay');
const AuthMiddleware = require('./middleware/AuthMiddleware');
const AdminMiddleware = require('./middleware/AdminMiddleware');
const { createVerifiedUser, formatCreateUserError, setJwtCookie, setVipCookie } = require('./controllers/homeController');
const createToken = require('./helpers/createToken');
const vipToken = require('./helpers/vipToken');
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const url = process.env.URL;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

async function connectToAtlas() {
  try {
    await mongoose.connect(url);
    console.log('Connected to MongoDB Atlas');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}
connectToAtlas();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const otpByEmail = new Map()
const OTP_TTL_MS = 10 * 60 * 1000

function storePendingRegistration(email, { otp, name, password }) {
  otpByEmail.set(email.toLowerCase(), {
    otp: String(otp),
    name: String(name).trim(),
    password: String(password),
    expiresAt: Date.now() + OTP_TTL_MS,
  })
}

function getPendingRegistration(email) {
  const entry = otpByEmail.get(email.toLowerCase())
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    otpByEmail.delete(email.toLowerCase())
    return null
  }
  return entry
}

app.use('/', homeRoutes);
app.use('/manga', mangaRoutes);
app.use('/serie',serieRoutes);
app.use('/pay',payRoutes);
app.use('/admin',adminRoutes);




app.get('/api/me', AuthMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('name email');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ username: user.name, email: user.email });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get current user' });
  }
});
app.post('/send-email', async (req, res) => {
  try {
    const { email, name, password } = req.body
    const trimmedEmail = String(email || '').trim().toLowerCase()
    const trimmedName = String(name || '').trim()

    if (!trimmedName || !trimmedEmail || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' })
    }

    if (String(password).length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }

    const existingUser = await User.findOne({ email: trimmedEmail })
    if (existingUser) {
      return res.status(400).json({ error: 'email is already registered' })
    }

    const otp = randomInt(1000, 9999)
    storePendingRegistration(trimmedEmail, {
      otp,
      name: trimmedName,
      password: String(password),
    })

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: trimmedEmail,
      subject: 'Your OTP code',
      text: `Your OTP code is ${otp}`,
      html: `<b>Your OTP code is ${otp}</b>`,
    })

    console.log('Message sent:', info.messageId)
    return res.json({ ok: true, message: 'Email sent', id: info.messageId })
  } catch (err) {
    console.error('Error while sending mail:', err)
    return res.status(500).json({ error: 'Send failed', detail: err.message })
  }
})

app.post('/vip/access/:id', AdminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Pay.findById(id).select('user username');

    if (!payment) {
      return res.status(404).json({ ok: false, error: 'Payment request not found' });
    }

    const user = await User.findByIdAndUpdate(
      payment.user,
      { vipInvitePending: true },
      { new: true }
    ).select('name email vipInvitePending');

    if (!user) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }

    return res.json({
      ok: true,
      message: `VIP invite sent to ${user.name || payment.username}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        vipInvitePending: user.vipInvitePending,
      },
    });
  } catch (e) {
    console.error('VIP access error:', e);
    return res.status(500).json({ ok: false, error: 'Failed to grant VIP invite' });
  }
});

app.get('/vip/pending', AuthMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('vipInvitePending vipMember');
    if (!user) return res.status(404).json({ ok: false, error: 'User not found' });

    return res.json({
      ok: true,
      pending: Boolean(user.vipInvitePending),
      vipMember: Boolean(user.vipMember),
    });
  } catch (e) {
    console.error('VIP pending error:', e);
    return res.status(500).json({ ok: false, error: 'Failed to check VIP invite' });
  }
});

app.post('/vip/accept', AuthMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('vipInvitePending vipMember');
    if (!user) return res.status(404).json({ ok: false, error: 'User not found' });

    if (!user.vipInvitePending && !user.vipMember) {
      return res.status(403).json({ ok: false, error: 'No VIP invite found for this account' });
    }

    user.vipInvitePending = false;
    user.vipMember = true;
    await user.save();
    const show = 1000*2;
    const vip = vipToken(user._id,show);
    setVipCookie(res, vip);

    return res.json({ ok: true, vipToken: vip });
  } catch (e) {
    console.error('VIP accept error:', e);
    return res.status(500).json({ ok: false, error: 'Failed to accept VIP invite' });
  }
});

app.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body
    const trimmedEmail = String(email || '').trim().toLowerCase()

    if (!trimmedEmail) {
      return res.status(400).json({ ok: false, error: 'Email is required' })
    }
    if (!otp) {
      return res.status(400).json({ ok: false, error: 'OTP is required' })
    }

    const pending = getPendingRegistration(trimmedEmail)
    if (!pending) {
      return res.status(401).json({ ok: false, error: 'OTP expired or not found. Please request a new code.' })
    }

    if (String(otp) !== pending.otp) {
      return res.status(401).json({ ok: false, error: 'Wrong OTP' })
    }

    const newUser = await createVerifiedUser({
      name: pending.name,
      email: trimmedEmail,
      password: pending.password,
    })
    const token = createToken(newUser._id)
    setJwtCookie(res, token)

    otpByEmail.delete(trimmedEmail)
    return res.status(201).json({
      ok: true,
      token,
      user: { id: newUser._id, name: newUser.name, email: newUser.email },
    })
  } catch (err) {
    console.error('Error verifying OTP:', err)

    if (err.status) {
      return res.status(err.status).json({ ok: false, error: err.message })
    }

    const formatted = formatCreateUserError(err)
    return res.status(formatted.status).json({ ok: false, error: formatted.message })
  }
})
app.get('/api/loginuser/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password')
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
