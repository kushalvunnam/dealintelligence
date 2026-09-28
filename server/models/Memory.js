const mongoose = require('mongoose');

const MemorySchema = new mongoose.Schema({
  dealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal' },
  type: { 
    type: String, 
    enum: ['Meeting', 'Objection', 'Competitor', 'Pricing', 'Stakeholder', 'Outcome', 'Preference'],
    required: true
  },
  content: { type: String, required: true },
  date: { type: Date, default: Date.now },
  interactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity' }
}, { timestamps: true });

module.exports = mongoose.model('Memory', MemorySchema);
