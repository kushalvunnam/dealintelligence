const { HindsightClient } = require('@vectorize-io/hindsight-client');

class HindsightService {
  constructor() {
    this.client = null;
  }

  initializeHindsight() {
    const baseUrl = process.env.HINDSIGHT_API_URL;
    const apiKey = process.env.HINDSIGHT_API_KEY;

    if (!baseUrl || !apiKey) {
      console.warn('Hindsight API URL or Key is missing. Hindsight operations will fail.');
      return;
    }

    this.client = new HindsightClient({ baseUrl, apiKey });
    console.log(`[Hindsight] Initialized client targeting ${baseUrl}`);
  }

  _checkClient() {
    if (!this.client) {
      throw new Error("Hindsight client is not initialized. Please configure HINDSIGHT_API_URL and HINDSIGHT_API_KEY.");
    }
  }

  async rememberDealInteraction(dealId, interactionText, interactionType, dealData, activityDate) {
    this._checkClient();
    console.log(`[Hindsight] Remembering interaction for deal ${dealId}: "${interactionText.substring(0, 50)}..."`);
    
    try {
      const response = await this.client.retain(dealId, interactionText, {
        metadata: {
          company: dealData.company || 'Unknown',
          interactionType: interactionType || 'meeting',
          timestamp: new Date(activityDate).toISOString(),
          // adding some context to help LLM
          context: `This is an interaction memory for deal ID ${dealId} regarding ${dealData.company}.`
        },
        timestamp: new Date(activityDate).toISOString()
      });
      return response;
    } catch (err) {
      console.error("[Hindsight] Failed to retain memory:", err.message);
      throw err;
    }
  }

  async recallDealMemory(dealId, query = "Summarize all previous meetings, objections, competitors, and pricing concerns for this deal.") {
    this._checkClient();
    console.log(`[Hindsight] Recalling memory for deal ${dealId} with query: "${query}"`);
    
    try {
      const response = await this.client.recall(dealId, query);
      return response.results || [];
    } catch (err) {
      console.error("[Hindsight] Failed to recall memory:", err.message);
      if (err.message && err.message.includes("not found")) {
        return [];
      }
      throw err;
    }
  }

  async searchDealMemories(dealId, query) {
    // Equivalent to recall but exposes custom query
    return this.recallDealMemory(dealId, query);
  }

  // To support the timeline, Hindsight doesn't have a simple "get all" endpoint documented easily,
  // but we can just query for general context and rely on the UI formatting, or we can fetch documents if it supports it.
  // We'll run a broad recall.
  async getDealMemoryTimeline(dealId) {
    return this.recallDealMemory(dealId, "Return all historical interactions chronologically.");
  }
}

const instance = new HindsightService();
// Try to initialize on load
if (process.env.HINDSIGHT_API_URL && process.env.HINDSIGHT_API_KEY) {
  instance.initializeHindsight();
}

module.exports = instance;
