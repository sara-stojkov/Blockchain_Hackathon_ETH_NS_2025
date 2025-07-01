const mongoose = require('mongoose');
const crypto = require('crypto');

const partySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    accessCode: {
        type: String,
        required: true,
        unique: true
    },
});

function randomSegment(len) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let seg = '';
  for (let i = 0; i < len; i++) {
    // crypto.randomInt je kriptografski sigurniji od Math.random
    const idx = crypto.randomInt(0, chars.length);
    seg += chars[idx];
  }
  return seg;
}

function generatePartyCode() {
  const part1 = randomSegment(3);
  const part2 = randomSegment(4);
  const part3 = randomSegment(3);
  return `${part1}-${part2}-${part3}`;
}

partySchema.static.generateAccessCode = generatePartyCode;

partySchema.methods.generateAccessCode = function() {
    this.accessCode = generatePartyCode();
    return this.accessCode;
};

const Party = mongoose.model('Party', partySchema);
module.exports = Party;