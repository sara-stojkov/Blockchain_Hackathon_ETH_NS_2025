const jwt = require('jsonwebtoken');

module.exports = {
    generateToken: (user) => {
        const payload = {
            id: user._id,
            publicKey: user.publicKey,
            nickname: user.nickname
        };
        const secret = process.env.JWT_SECRET;
        return jwt.sign(payload, secret);
    },
    verifyToken: (token) => {
        const secret = process.env.JWT_SECRET;
        try {
            return jwt.verify(token, secret);
        } catch (error) {
            throw new Error('Invalid token');
        }
    },
    decodeToken: (token) => {
        try {
            return jwt.decode(token);
        } catch (error) {
            throw new Error('Invalid token');
        }
    }
};