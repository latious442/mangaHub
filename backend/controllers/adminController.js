const bcrypt = require('bcrypt');
const Admin = require('../models/Admin');
const adminToken = require('../helpers/adminToken');
const { setAdminJwtCookie } = require('./homeController');

const SALT_ROUNDS = 10;

function normalizeAdminName(name) {
    return String(name || '').trim();
}

async function createAdmin(req, res) {
    try {
        const name = normalizeAdminName(req.body.name);
        const password = String(req.body.password || '');

        if (!name || !password) {
            return res.status(400).json({ error: "please fill name & password carefully!" });
        }

        const hashed = await bcrypt.hash(password, SALT_ROUNDS);

        const admin = await Admin.create({
            name,
            password: hashed,
        });

        const safeAdmin = admin.toObject ? admin.toObject() : admin;
        if (safeAdmin.password) delete safeAdmin.password;

        res.status(201).json(safeAdmin);
    } catch (error) {
        console.error('Error creating admin:', error);
        res.status(500).json({ error: 'Failed to create admin' });
    }
}

async function loginAdmin(req, res) {
    try {
        const name = normalizeAdminName(req.body.name);
        const password = String(req.body.password || '');
        if (!name || !password) {
            return res.status(400).json({ error: 'Name and password are required' });
        }

        const admin = await Admin.findOne({ name }).select('+password');
        if (!admin) {
            return res.status(401).json({ error: 'Invalid name or password' });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid name or password' });
        }

        const token = adminToken(admin._id);
        setAdminJwtCookie(res, token);

        const safeAdmin = admin.toObject ? admin.toObject() : admin;
        if (safeAdmin.password) delete safeAdmin.password;

        return res.json({ ok: true, token, admin: { id: safeAdmin._id, name: safeAdmin.name } });
    } catch (error) {
        console.error('Error logging in admin:', error);
        return res.status(500).json({ error: 'Failed to login admin' });
    }
}

module.exports = { createAdmin, loginAdmin };
