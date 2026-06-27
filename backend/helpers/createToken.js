const jwt = require('jsonwebtoken');
const duration = '1h';
const secret = process.env.JWT_SECRET || 'myooo';

module.exports = function createToken(_id, role = 'user') {
    return jwt.sign({ _id, role }, secret, { expiresIn: duration });
}
