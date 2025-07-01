const express = require('express');
const { User } = require('../models');
const utils = require('../utils'); // Assuming you have a utils file for common functions
const { StatusCodes } = require('http-status-codes');

const router = express.Router();

// POST /login
router.post('/login', async (req, res) => {
    const { publicKey } = req.body;

    // Validate the request body
    if (!publicKey) {
        return res.status(400).json({ error: 'Public key is required' });
    }

    try {
        let user = await User.findOne({ publicKey })
        let statusCode = StatusCodes.OK;
        if (!user) {
            // If user does not exist, create a new user
            user = new User({ publicKey, nickname: publicKey });
            await user.save();
            statusCode = StatusCodes.CREATED;
        }
        // Generate JWT token
        const token = utils.jwt.generateToken(user);
        // If user exists, return the user data
        return res.status(statusCode).json({ ok: true, user, token });
    } catch (error) {
        return res.status(500).json({ ok: false, error: 'Database error' });
    }
});

router.put("/", async (req, res) => {
    const { JWT } = req.headers.authorization;

    // Validate the JWT
    if (!JWT) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ ok: false, error: 'Unauthorized' });
    }

    let decoded = null;
    try {
        decoded = utils.jwt.verifyToken(JWT)
        if (!decoded || !decoded.id) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ ok: false, error: 'Invalid token' });
        }
    } catch (error) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ ok: false, error: 'Invalid token' });
    }

    const { nickname } = req.body;
    // Validate the request body
    if (!nickname) {
        return res.status(StatusCodes.BAD_REQUEST).json({ ok: false, error: 'Nickname is required' });
    }

    let user = null;
    try {
        user = await User.findById(decoded.id);
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ ok: false, error: 'User not found' });
        }

        // Update the user's nickname
        user.nickname = nickname;
        await user.save();

        // Generate a new JWT token
        const token = utils.jwt.generateToken(user);

        return res.status(StatusCodes.OK).json({ ok: true, user, token });
    } catch (error) {
        console.error('Error updating user:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ ok: false, error: 'Database error' });
    }
})
module.exports = router;