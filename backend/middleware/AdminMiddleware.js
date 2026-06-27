const jwt = require('jsonwebtoken');

const secret = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || 'kothitsar';

const AdminMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const token = bearerToken || req.cookies?.adminJwt;

    if (!token) {
        return res.status(401).json({ message: 'Admin authentication required' });
    }

    try {
        const decoded = jwt.verify(token, secret);

        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        req.admin = decoded;
        return next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired admin token' });
    }
};

module.exports = AdminMiddleware;
