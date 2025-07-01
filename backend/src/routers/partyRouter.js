const { StatusCodes } = require('http-status-codes');
const models = require('../models');
const utils = require('../utils');
const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all parties
router.get('/', auth, async (req, res) => {
    // Find all parties where the user is a member
    const parties = await models.Party
        .find({ members: req.user.id })
        .populate('owner', 'nickname publicKey')
        .populate('members', 'nickname publicKey');
    
    // Return the list of parties
    res.status(StatusCodes.OK).json({ ok: true, parties });
});

// Get Party by ID
router.get('/:partyId', auth, async (req, res) => {
    
    const partyId = req.params.partyId;
    
    // Find the party by ID
    const party = await models.Party
        .findById(partyId)
        .populate('owner', 'nickname publicKey')
        .populate('members', 'nickname publicKey');
    if (!party) {
        return res.status(StatusCodes.NOT_FOUND).json({ error: 'Party not found' });
    }
    // Check if the user is a member of the party
    if (!party.members.find(member => member._id.toString() === req.user.id)) {
        return res.status(StatusCodes.FORBIDDEN).json({ error: 'You are not a member of this party' });
    }
    // Return the party details
    res.status(StatusCodes.OK).json({ ok: true, party });
});

// Create a new party
router.post('/', auth, async (req, res) => {
    

    const {name, description} = req.body;

    // Validate the request body
    if (!name || !description) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Name and description are required' });
    }  

    const userId = req.user.id;

    const party = new models.Party({name, description, owner: userId, members: [userId]});
    await party.generateAccessCode();
    try {
        await party.save();
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Database error' });
    }
    res.status(StatusCodes.OK).json({ok: true, party});
});

router.put('/:partyId/refresh', auth, async (req, res) => {
    
    const partyId = req.params.partyId;
    const party = await models.Party.findById(partyId);
    
    if (!party) {
        return res.status(StatusCodes.NOT_FOUND).json({ error: 'Party not found' });
    }

    if (party.owner.toString() !== req.user.id) {
        return res.status(StatusCodes.FORBIDDEN).json({ error: 'You are not the owner of this party' });
    }

    party.generateAccessCode();
    
    try {
        await party.save();
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Database error' });
    }
    
    res.status(StatusCodes.OK).json({ok: true, party});
});

// join a party
router.post('/join/:accessCode', auth,  async (req, res) => {
    
    const accessCode = req.params.accessCode;
    
    const party = await models.Party.findOne({ accessCode });
    
    if (!party) {
        return res.status(StatusCodes.NOT_FOUND).json({ error: 'Party not found' });
    }

    if (party.members.includes(req.user.id)) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'You are already a member of this party' });
    }

    party.members.push(req.user.id);
    
    try {
        await party.save();
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Database error' });
    }
    
    res.status(StatusCodes.OK).json({ok: true, party});
});


module.exports = router;