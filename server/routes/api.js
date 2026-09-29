const express = require('express');
const mongoose = require('mongoose');
const Deal = require('../models/Deal');
const Activity = require('../models/Activity');
const Memory = require('../models/Memory');
const HindsightService = require('../services/hindsightService');
const AIService = require('../services/aiService');

const router = express.Router();

// GET all deals
router.get('/deals', async (req, res) => {
  try {
    const deals = await Deal.find().sort({ updatedAt: -1 });
    res.json(deals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET deal by ID
router.get('/deals/:id', async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) return res.status(404).json({ error: 'Deal not found' });
    res.json(deal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET activities for a deal
router.get('/deals/:id/activities', async (req, res) => {
  try {
    const activities = await Activity.find({ dealId: req.params.id }).sort({ date: -1 });
    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new activity (and trigger memory creation)
router.post('/deals/:id/activities', async (req, res) => {
  try {
    const { type, summary, details } = req.body;
    const dealId = req.params.id;
    
    const deal = await Deal.findById(dealId);
    if (!deal) return res.status(404).json({ error: 'Deal not found' });

    const activity = new Activity({ dealId, type, summary, details });
    await activity.save();

    // Trigger Hindsight memory extraction
    const combinedText = `${summary}. ${details || ''}`;
    try {
      await HindsightService.rememberDealInteraction(dealId.toString(), combinedText, type, deal, activity.date);
    } catch (hindsightErr) {
      console.error('Hindsight integration failed, rolling back activity if necessary, or returning partial success.', hindsightErr);
      return res.status(502).json({ error: 'Activity saved locally, but Hindsight memory storage failed.', details: hindsightErr.message });
    }

    // Update Deal last activity
    await Deal.findByIdAndUpdate(dealId, { lastActivityDate: Date.now() });

    res.status(201).json(activity);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET memories for a deal
router.get('/deals/:id/memories', async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) return res.status(404).json({ error: 'Deal not found' });
    
    const memories = await HindsightService.getDealMemoryTimeline(req.params.id);
    const mapped = memories.map(m => ({
      _id: m.id || m.chunk_id || Math.random().toString(),
      type: m.metadata?.interactionType || 'Unknown',
      content: m.text || m.content || JSON.stringify(m),
      date: m.timestamp || new Date(),
      dealId: { _id: deal._id, company: deal.company, name: deal.name }
    }));
    res.json(mapped);
  } catch (err) {
    res.status(502).json({ error: 'Failed to retrieve memories from Hindsight', details: err.message });
  }
});

// POST search memories
router.post('/deals/:id/memories/search', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Query is required' });
    
    const deal = await Deal.findById(req.params.id);
    if (!deal) return res.status(404).json({ error: 'Deal not found' });

    const memories = await HindsightService.searchDealMemories(req.params.id, query);
    const mapped = memories.map(m => ({
      _id: m.id || m.chunk_id || Math.random().toString(),
      type: m.metadata?.interactionType || 'Unknown',
      content: m.text || m.content || JSON.stringify(m),
      date: m.timestamp || new Date(),
      dealId: { _id: deal._id, company: deal.company, name: deal.name }
    }));
    res.json(mapped);
  } catch (err) {
    res.status(502).json({ error: 'Failed to search Hindsight memories', details: err.message });
  }
});

// POST generate AI meeting brief
router.post('/ai/prepare-meeting', async (req, res) => {
  try {
    const { dealId } = req.body;
    const deal = await Deal.findById(dealId);
    if (!deal) return res.status(404).json({ error: 'Deal not found' });

    const memories = await HindsightService.recallDealMemory(dealId);
    const result = await AIService.prepareDealMeeting(deal, memories);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST AI Chat
router.post('/ai/chat', async (req, res) => {
  try {
    const { dealId, message } = req.body;
    const deal = await Deal.findById(dealId);
    if (!deal) return res.status(404).json({ error: 'Deal not found' });

    const memories = await HindsightService.recallDealMemory(dealId);
    const result = await AIService.generateDealResponse(deal, memories, message);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Analyze Objections
router.post('/ai/analyze-objections', async (req, res) => {
  try {
    const { dealId } = req.body;
    const deal = await Deal.findById(dealId);
    if (!deal) return res.status(404).json({ error: 'Deal not found' });

    const memories = await HindsightService.recallDealMemory(dealId, "What pricing or other objections have been raised by the customer?");
    const result = await AIService.analyzeObjections(deal, memories);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Analyze Competitors
router.post('/ai/analyze-competitors', async (req, res) => {
  try {
    const { dealId } = req.body;
    const deal = await Deal.findById(dealId);
    if (!deal) return res.status(404).json({ error: 'Deal not found' });

    const memories = await HindsightService.recallDealMemory(dealId, "What competitors have been mentioned or evaluated?");
    const result = await AIService.analyzeCompetitors(deal, memories);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Next Actions
router.post('/ai/next-actions', async (req, res) => {
  try {
    const { dealId } = req.body;
    const deal = await Deal.findById(dealId);
    if (!deal) return res.status(404).json({ error: 'Deal not found' });

    const memories = await HindsightService.recallDealMemory(dealId, "What are the latest developments, objections, or commitments?");
    const result = await AIService.generateNextActions(deal, memories);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Detect Patterns
router.post('/ai/patterns', async (req, res) => {
  try {
    const { dealId } = req.body;
    const deal = await Deal.findById(dealId);
    if (!deal) return res.status(404).json({ error: 'Deal not found' });

    const memories = await HindsightService.recallDealMemory(dealId, "What are the recurring objections, competitors, or requests?");
    const result = await AIService.detectPatterns(deal, memories);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Prepare Meeting Compare (for Demo)
router.post('/ai/prepare-meeting-compare', async (req, res) => {
  try {
    const { dealId } = req.body;
    const deal = await Deal.findById(dealId);
    if (!deal) return res.status(404).json({ error: 'Deal not found' });

    const memories = await HindsightService.recallDealMemory(dealId);
    const result = await AIService.prepareMeetingCompare(deal, memories);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ALL Memories (for the Memory Page timeline)
router.get('/memories', async (req, res) => {
  try {
    const deals = await Deal.find();
    let allMemories = [];
    
    // Fetch memories for all deals from Hindsight
    for (const deal of deals) {
      try {
        const memories = await HindsightService.getDealMemoryTimeline(deal._id.toString());
        // Map memories to include deal info for the UI
        const mapped = memories.map(m => ({
          _id: m.id || m.chunk_id || Math.random().toString(),
          type: m.metadata?.interactionType || 'Unknown',
          content: m.text || m.content || JSON.stringify(m),
          date: m.timestamp || new Date(),
          dealId: { _id: deal._id, company: deal.company, name: deal.name }
        }));
        allMemories = allMemories.concat(mapped);
      } catch (hindsightErr) {
        console.warn(`Failed to retrieve memories for deal ${deal._id}:`, hindsightErr.message);
      }
    }
    
    // Sort chronologically
    allMemories.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(allMemories);
  } catch (err) {
    res.status(502).json({ error: 'Failed to aggregate memories from Hindsight', details: err.message });
  }
});

// ==========================================
// COMPANY ROUTES
// ==========================================
// Note: Companies are currently derived from the Deal model's 'company' string field.
// This endpoint updates the company name across all associated records to maintain consistency.
router.put('/companies/:oldName', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Company name is required' });
    }
    
    const oldName = req.params.oldName;
    
    // Update all deals associated with this company
    await Deal.updateMany({ company: oldName }, { company: name });
    
    // Update all contacts associated with this company
    const Contact = require('../models/Contact');
    if (Contact) {
      await Contact.updateMany({ company: oldName }, { company: name });
    }
    
    res.json({ success: true, message: 'Company updated successfully', newName: name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// CONTACT ROUTES
// ==========================================
const Contact = require('../models/Contact');

// GET all contacts
router.get('/contacts', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single contact
router.get('/contacts/:id', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ error: 'Contact not found' });
    res.json(contact);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new contact
router.post('/contacts', async (req, res) => {
  try {
    const contact = new Contact(req.body);
    await contact.save();
    res.status(201).json(contact);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update contact
router.put('/contacts/:id', async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!contact) return res.status(404).json({ error: 'Contact not found' });
    res.json(contact);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE contact
router.delete('/contacts/:id', async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) return res.status(404).json({ error: 'Contact not found' });
    res.json({ success: true, message: 'Contact deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
