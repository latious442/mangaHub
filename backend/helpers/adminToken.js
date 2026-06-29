const jwt = require('jsonwebtoken');
const duration = '1h';
const secret = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET;

module.exports = function adminToken(_id) {
    return jwt.sign({ _id, role: 'admin' }, secret, { expiresIn: duration });
}
