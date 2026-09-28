const mongoose = require('mongoose');

const DealSchema = new mongoose.Schema({
  company: { type: String, required: true },
  name: { type: String, required: true },
  value: { type: Number, required: true },
  stage: { 
    type: String, 
    enum: ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'],
    default: 'Lead'
  },
  probability: { type: Number, default: 10 },
  lastActivityDate: { type: Date },
  nextMeetingDate: { type: Date },
  owner: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Deal', DealSchema);
