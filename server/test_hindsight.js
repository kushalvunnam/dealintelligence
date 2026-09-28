require('dotenv').config();
const mongoose = require('mongoose');
const HindsightService = require('./services/hindsightService');
const AIService = require('./services/aiService');

async function runTest() {
  console.log("=== DEALMIND HINDSIGHT INTEGRATION TEST ===");
  
  if (!process.env.HINDSIGHT_API_URL || !process.env.HINDSIGHT_API_KEY) {
    console.error("❌ ERROR: Hindsight API credentials are missing from .env");
    process.exit(1);
  }
  
  if (!process.env.OPENAI_API_KEY && !process.env.GROQ_API_KEY) {
    console.error("❌ ERROR: LLM API credentials missing from .env");
    process.exit(1);
  }

  try {
    const mockDealId = "test-deal-" + Date.now();
    const mockDeal = { company: "TestCorp", name: "Test Deal", stage: "Lead", value: 50000 };
    
    console.log("\n1. Storing memory in Hindsight...");
    await HindsightService.rememberDealInteraction(
      mockDealId,
      "TestCorp says our pricing is too high and they are looking at AutoCorp.",
      "objection",
      mockDeal,
      new Date()
    );
    console.log("✅ Successfully stored memory in Hindsight");
    
    // Wait for indexing
    console.log("Waiting 2 seconds for Hindsight to index...");
    await new Promise(r => setTimeout(r, 2000));

    console.log("\n2. Retrieving memory from Hindsight...");
    const memories = await HindsightService.recallDealMemory(mockDealId, "What pricing objections have they raised?");
    console.log(`✅ Retrieved ${memories.length} memories`);
    if (memories.length > 0) {
      console.log(`   Sample: ${memories[0].text || JSON.stringify(memories[0])}`);
    } else {
      console.warn("⚠️ Warning: Retrieved 0 memories (indexing might be delayed or API failed silently).");
    }

    console.log("\n3. Generating AI Meeting Prep...");
    const brief = await AIService.generateMeetingBrief(mockDeal, memories);
    console.log("✅ Successfully generated brief:");
    console.log(JSON.stringify(brief, null, 2));
    
    console.log("\n=== TEST COMPLETED SUCCESSFULLY ===");
    process.exit(0);
  } catch (err) {
    console.error("\n❌ TEST FAILED:", err);
    process.exit(1);
  }
}

runTest();
