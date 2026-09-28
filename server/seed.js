const mongoose = require('mongoose');
const Deal = require('./models/Deal');
const Activity = require('./models/Activity');
const Memory = require('./models/Memory');
const HindsightService = require('./services/hindsightService');

async function seedDatabase() {
  const count = await Deal.countDocuments();
  if (count > 0) {
    console.log('Database already seeded.');
    return;
  }

  console.log('Seeding demo data...');

  // 1. Create Deals
  const dealsData = [
    {
      company: 'ABC Motors',
      name: 'Enterprise Fleet Management',
      value: 1850000,
      stage: 'Negotiation',
      probability: 70,
      owner: 'Alex'
    },
    {
      company: 'NovaTech',
      name: 'CRM Integration',
      value: 1200000,
      stage: 'Proposal',
      probability: 50,
      owner: 'Alex'
    },
    {
      company: 'GreenFleet',
      name: 'Service Platform',
      value: 850000,
      stage: 'Qualified',
      probability: 30,
      owner: 'Alex'
    }
  ];

  const deals = await Deal.insertMany(dealsData);
  const abcMotors = deals.find(d => d.company === 'ABC Motors');

  // 2. Create Activities & Memories for ABC Motors to demonstrate Hindsight
  const activities = [
    { dealId: abcMotors._id, type: 'Meeting', summary: 'Initial discovery meeting', details: 'Customer explains basic requirements for fleet management.', date: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000) },
    { dealId: abcMotors._id, type: 'Meeting', summary: 'Technical deep dive', details: 'Discussed requirements in detail. Customer wants implementation completed within 30 days.', date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000) },
    { dealId: abcMotors._id, type: 'Objection', summary: 'Pricing objection', details: 'ABC Motors says our pricing is too high.', date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000) },
    { dealId: abcMotors._id, type: 'Competitor', summary: 'Competitor mentioned', details: 'ABC Motors is evaluating AutoCorp.', date: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000) },
    { dealId: abcMotors._id, type: 'Stakeholder', summary: 'Procurement stakeholder added', details: 'Sarah from procurement joined the process.', date: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000) },
    { dealId: abcMotors._id, type: 'Pricing', summary: 'Discount requested', details: 'The procurement manager requested a 10% discount.', date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
    { dealId: abcMotors._id, type: 'Meeting', summary: 'Implementation timeline discussed', details: 'Confirmed we can meet the 30-day timeline if they sign by Friday.', date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
    { dealId: abcMotors._id, type: 'Objection', summary: 'Technical concern raised', details: 'Worried about API rate limits on our standard tier.', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    { dealId: abcMotors._id, type: 'Email', summary: 'Follow-up sent', details: 'Sent documentation regarding API rate limits and custom enterprise limits.', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
    { dealId: abcMotors._id, type: 'Meeting', summary: 'Customer requests updated proposal', details: 'They want to see the new numbers including the discount and updated SLA.', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) }
  ];

  for (const act of activities) {
    const activity = new Activity(act);
    await activity.save();
    try {
      await HindsightService.rememberDealInteraction(abcMotors._id.toString(), `${act.summary}. ${act.details}`, act.type, abcMotors, act.date);
    } catch (err) {
      console.warn("Could not save memory to Hindsight in seed data. (Expected if Hindsight API not yet configured)");
    }
  }

  console.log('Database seeded successfully.');
}

module.exports = seedDatabase;
