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
const bcrypt = require('bcrypt');
const { randomInt } = require('node:crypto');
const User = require('./models/User');
const Pay = require('./models/Pay');
const Otp = require('./models/Otp');
const AuthMiddleware = require('./middleware/AuthMiddleware');
const AdminMiddleware = require('./middleware/AdminMiddleware');
const { createVerifiedUser, formatCreateUserError, setJwtCookie, setVipCookie } = require('./controllers/homeController');
const createToken = require('./helpers/createToken');
const vipToken = require('./helpers/vipToken');
const connectDB = require('./db');
dotenv.config({ path: __dirname + '/.env' });

const app = express();
const port = process.env.PORT || 3000;
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

connectDB().catch((err) => console.error('MongoDB connection error:', err));

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const SALT_ROUNDS = 10
const VIP_DURATIONS = {
  '1m': { jwt: '30d', label: '1 month', maxAge: 30 * 24 * 60 * 60 * 1000 },
  '2m': { jwt: '60d', label: '2 months', maxAge: 60 * 24 * 60 * 60 * 1000 },
  '3m': { jwt: '90d', label: '3 months', maxAge: 90 * 24 * 60 * 60 * 1000 },
}

function normalizeVipDuration(duration) {
  return VIP_DURATIONS[duration] || VIP_DURATIONS['1m']
}

function storePendingRegistration(email, { otp, name, password }) {
  return Otp.create({
    email: email.toLowerCase(),
    otp: String(otp),
    name: String(name).trim(),
    password: String(password),
    type: 'registration',
  })
}

async function getPendingRegistration(email) {
  const entry = await Otp.findOne({
    email: email.toLowerCase(),
    type: 'registration',
  }).sort({ createdAt: -1 });
  if (!entry) return null;
  return {
    otp: entry.otp,
    name: entry.name,
    password: entry.password,
    expiresAt: entry.createdAt.getTime() + 10 * 60 * 1000,
    _id: entry._id,
  }
}

function storePendingPasswordReset(email, otp) {
  return Otp.create({
    email: email.toLowerCase(),
    otp: String(otp),
    type: 'password_reset',
  })
}

async function getPendingPasswordReset(email) {
  const entry = await Otp.findOne({
    email: email.toLowerCase(),
    type: 'password_reset',
  }).sort({ createdAt: -1 });
  if (!entry) return null;
  return {
    otp: entry.otp,
    expiresAt: entry.createdAt.getTime() + 10 * 60 * 1000,
    _id: entry._id,
  }
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
    await storePendingRegistration(trimmedEmail, {
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

app.post('/send-email/again', async (req, res) => {
  try {
    const { email } = req.body
    const trimmedEmail = String(email || '').trim().toLowerCase()
    

    if ( !trimmedEmail) {
      return res.status(400).json({ error: 'Email is required' })
    }

  

    const existingUser = await User.findOne({ email: trimmedEmail })
    if (!existingUser) {
      return res.status(404).json({ error: 'No account found with this email' })
    }
    

    const otp = randomInt(1000, 9999)
    await storePendingPasswordReset(trimmedEmail, otp)

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

app.post('/verify-otp/again', async (req, res) => {
  try {
    const { email, otp, password } = req.body
    const trimmedEmail = String(email || '').trim().toLowerCase()

    if (!trimmedEmail) {
      return res.status(400).json({ ok: false, error: 'Email is required' })
    }
    if (!otp) {
      return res.status(400).json({ ok: false, error: 'OTP is required' })
    }
    if (!password || String(password).length < 6) {
      return res.status(400).json({ ok: false, error: 'Password must be at least 6 characters' })
    }

    const pending = await getPendingPasswordReset(trimmedEmail)
    if (!pending) {
      return res.status(401).json({ ok: false, error: 'OTP expired or not found. Please request a new code.' })
    }

    if (Date.now() > pending.expiresAt) {
      await Otp.deleteOne({ _id: pending._id });
      return res.status(401).json({ ok: false, error: 'OTP expired or not found. Please request a new code.' })
    }

    if (String(otp) !== pending.otp) {
      return res.status(401).json({ ok: false, error: 'Wrong OTP' })
    }

    const hashedPassword = await bcrypt.hash(String(password), SALT_ROUNDS)
    const user = await User.findOneAndUpdate(
      { email: trimmedEmail },
      { password: hashedPassword },
      { new: true }
    ).select('name email')

    if (!user) {
      return res.status(404).json({ ok: false, error: 'User not found' })
    }

    await Otp.deleteOne({ _id: pending._id })
    return res.json({
      ok: true,
      message: 'Password reset successfully',
      user: { id: user._id, name: user.name, email: user.email },
    })
  } catch (err) {
    console.error('Error resetting password:', err)
    return res.status(500).json({ ok: false, error: 'Password reset failed', detail: err.message })
  }
})

app.post('/vip/access/:id', AdminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const duration = normalizeVipDuration(req.body?.duration);
    const payment = await Pay.findById(id).select('user username');

    if (!payment) {
      return res.status(404).json({ ok: false, error: 'Payment request not found' });
    }

    const user = await User.findByIdAndUpdate(
      payment.user,
      { vipInvitePending: true, vipDuration: duration.jwt },
      { new: true }
    ).select('name email vipInvitePending vipDuration');

    if (!user) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }

    return res.json({
      ok: true,
      message: `VIP invite sent to ${user.name || payment.username} for ${duration.label}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        vipInvitePending: user.vipInvitePending,
        vipDuration: user.vipDuration,
      },
    });
  } catch (e) {
    console.error('VIP access error:', e);
    return res.status(500).json({ ok: false, error: 'Failed to grant VIP invite' });
  }
});

app.get('/vip/pending', AuthMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('vipInvitePending vipMember vipDuration');
    if (!user) return res.status(404).json({ ok: false, error: 'User not found' });

    return res.json({
      ok: true,
      pending: Boolean(user.vipInvitePending),
      vipMember: Boolean(user.vipMember),
      vipDuration: user.vipDuration,
    });
  } catch (e) {
    console.error('VIP pending error:', e);
    return res.status(500).json({ ok: false, error: 'Failed to check VIP invite' });
  }
});

app.post('/vip/accept', AuthMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('vipInvitePending vipMember vipDuration');
    if (!user) return res.status(404).json({ ok: false, error: 'User not found' });

    if (!user.vipInvitePending && !user.vipMember) {
      return res.status(403).json({ ok: false, error: 'No VIP invite found for this account' });
    }

    user.vipInvitePending = false;
    user.vipMember = true;
    await user.save();
    const duration = Object.values(VIP_DURATIONS).find((item) => item.jwt === user.vipDuration) || VIP_DURATIONS['1m'];
    const vip = vipToken(user._id, duration.jwt);
    setVipCookie(res, vip, duration.maxAge);

    return res.json({ ok: true, vipToken: vip, vipDuration: duration.jwt });
  } catch (e) {
    console.error('VIP accept error:', e);
    return res.status(500).json({ ok: false, error: 'Failed to accept VIP invite' });
  }
});


app.post('/vip/del/:id', AdminMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const payment = await Pay.findById(id).select('user username');
    if (!payment) {
      return res.status(404).json({ ok: false, error: 'Payment request not found' });
    }

    const user = await User.findById(payment.user).select('name vipInvitePending vipMember vipDuration');
    if (!user) return res.status(404).json({ ok: false, error: 'User not found' });

    if (!user.vipInvitePending && !user.vipMember) {
      return res.status(403).json({ ok: false, error: 'This user does not have VIP access or a pending invite' });
    }

    user.vipInvitePending = false;
    user.vipMember = false;
    user.vipDuration = '30d';
    await user.save();

    return res.json({
      ok: true,
      message: `VIP access removed from ${user.name || payment.username}`,
      user: {
        id: user._id,
        name: user.name || payment.username,
        vipInvitePending: user.vipInvitePending,
        vipMember: user.vipMember,
      },
    });
  } catch (e) {
    console.error('VIP revoke error:', e);
    return res.status(500).json({ ok: false, error: 'Failed to remove VIP access' });
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

    const pending = await getPendingRegistration(trimmedEmail)
    if (!pending) {
      return res.status(401).json({ ok: false, error: 'OTP expired or not found. Please request a new code.' })
    }

    if (Date.now() > pending.expiresAt) {
      await Otp.deleteOne({ _id: pending._id });
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

    await Otp.deleteOne({ _id: pending._id })
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

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}
module.exports = app;
