const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  company: { type: String, required: true },
  jobTitle: { type: String },
  department: { type: String },
  linkedin: { type: String },
  location: { type: String },
  notes: { type: String },
  contactType: { 
    type: String, 
    enum: ['Decision Maker', 'Influencer', 'Champion', 'Procurement', 'Technical', 'Other'],
    default: 'Other'
  }
}, { timestamps: true });

module.exports = mongoose.model('Contact', ContactSchema);
