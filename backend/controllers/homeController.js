const bcrypt = require('bcrypt');
const User = require('../models/User');
const createToken = require('../helpers/createToken');
const vipToken = require('../helpers/vipToken');

const SALT_ROUNDS = 10;
const COOKIE_MAX_AGE = 60 * 60 * 1000;

function escapeRegex(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isBcryptHash(value) {
    return typeof value === 'string' && /^\$2[aby]\$\d{2}\$/.test(value);
}

function getJwtCookieOptions() {
    const isProduction = process.env.NODE_ENV === 'production';

    return {
        httpOnly: true,
        sameSite: isProduction ? 'none' : 'lax',
        secure: isProduction,
    };
}

function setJwtCookie(res, token) {
    res.cookie('jwt', token, {
        ...getJwtCookieOptions(),
        maxAge: COOKIE_MAX_AGE,
    });
}

function setAdminJwtCookie(res, token) {
    res.cookie('adminJwt', token, {
        ...getJwtCookieOptions(),
        maxAge: COOKIE_MAX_AGE,
    });
}



function setVipCookie(res, token) {
    res.cookie('vip', token, {
        ...getJwtCookieOptions(),
        maxAge: COOKIE_MAX_AGE,
    });
}

async function getHome(req, res) {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to load users' });
    }
}

function formatCreateUserError(error) {
    if (error.name === 'ValidationError') {
        const firstError = Object.values(error.errors)[0];
        return { status: 400, message: firstError?.message || 'Validation failed' };
    }

    if (error.code === 11000) {
        const field = Object.keys(error.keyValue || error.keyPattern || {})[0] || 'field';
        const value = (error.keyValue && Object.values(error.keyValue)[0]) || '';
        return { status: 400, message: `${field} ${value ? `(${value}) ` : ''}is already registered` };
    }

    return { status: 500, message: 'Failed to create user' };
}

async function createVerifiedUser({ name, email, password }) {
    if (!name || !email || !password) {
        const err = new Error('Name, email, and password are required');
        err.status = 400;
        throw err;
    }

    if (String(password).length < 6) {
        const err = new Error('Password must be at least 6 characters');
        err.status = 400;
        throw err;
    }

    const hashedPassword = await bcrypt.hash(String(password), SALT_ROUNDS);

    return User.create({ name, email: String(email).trim().toLowerCase(), password: hashedPassword });
}

async function createUser(req, res) {
    return res.status(403).json({
        error: 'Direct registration is disabled. Verify your email with OTP first.',
    });
}

async function loginUser(req, res) {
    const { email, password } = req.body;
    const trimmedEmail = String(email || '').trim().toLowerCase();

    if (!trimmedEmail || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const user = await User.findOne({
            email: new RegExp(`^${escapeRegex(trimmedEmail)}$`, 'i'),
        }).select('+password');

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isLegacyPlainPassword = !isBcryptHash(user.password);
        const isMatch = isLegacyPlainPassword
            ? String(password) === user.password
            : await bcrypt.compare(String(password), user.password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        if (isLegacyPlainPassword) {
            user.password = await bcrypt.hash(String(password), SALT_ROUNDS);
            user.email = trimmedEmail;
            await user.save();
        }

        const token = createToken(user._id);
        setJwtCookie(res, token);

        const responseBody = {
            ok: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        };

        if (user.vipMember) {
            const vip = vipToken(user._id);
            setVipCookie(res, vip);
            responseBody.vipToken = vip;
        }

        return res.json(responseBody);
    } catch (error) {
        console.error('Error logging in:', error);
        return res.status(500).json({ error: 'Failed to login' });
    }
}
async function getCurrentUser(req, res) {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.json({ ok: true, user });
    } catch (error) {
        console.error('Error fetching current user:', error);
        return res.status(500).json({ error: 'Failed to get current user' });
    }
}

async function logoutUser(req,res) {
    res.clearCookie('jwt', getJwtCookieOptions());
    res.clearCookie('adminJwt', getJwtCookieOptions());
    res.clearCookie('vip', getJwtCookieOptions());
    return res.json({ message: 'user logged out' });
}

const delUser = async(req,res)=>{

  try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'user not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ error: 'Failed to del data' });
    }

};

module.exports = {
    getHome,
    createUser,
    createVerifiedUser,
    formatCreateUserError,
    setJwtCookie,
    setAdminJwtCookie,
    setVipCookie,
    loginUser,
    getCurrentUser,
    logoutUser,
    delUser
};
