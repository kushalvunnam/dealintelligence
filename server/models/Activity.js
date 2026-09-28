const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  dealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal' },
  type: { type: String, enum: ['Meeting', 'Email', 'Call', 'Note'], required: true },
  summary: { type: String, required: true },
  details: { type: String },
  date: { type: Date, default: Date.now },
  owner: { type: String, default: 'System' }
}, { timestamps: true });

module.exports = mongoose.model('Activity', ActivitySchema);
