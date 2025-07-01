const { StatusCodes } = require("http-status-codes");
const utils = require("../utils");
const { User } = require("../models");

module.exports = async (req, res, next) => {
    // Check if the request has an authorization header
    if (!req.headers.authorization) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });
    }

    // Extract the JWT from the authorization header
    const token = req.headers.authorization.split(' ')[1];
    
    // If no token is provided, return unauthorized
    if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });
    }

    try {
        // Verify the JWT and attach the user data to the request object
        let decoded = utils.jwt.verifyToken(token);
        if (!decoded || !decoded.id) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid token' });
        }
        let user = await User.findById(decoded.id)
        if (!user) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'User not found' });
        }
        req.user = {
            id: user._id.toString(),
            publicKey: user.publicKey,
            nickname: user.nickname
        };
        next();
    } catch (error) {
        // If verification fails, return unauthorized
        return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid token' });
    }
}