const OpenAI = require('openai');

class AIService {
  constructor() {
    let apiKey = process.env.OPENAI_API_KEY;
    let baseURL = undefined;

    if (!apiKey && process.env.GROQ_API_KEY) {
      apiKey = process.env.GROQ_API_KEY;
      baseURL = 'https://api.groq.com/openai/v1';
    }

    if (apiKey) {
      this.client = new OpenAI({ apiKey, baseURL });
      this.model = process.env.GROQ_API_KEY ? 'llama-3.1-8b-instant' : 'gpt-4o-mini';
    } else {
      this.client = null;
    }
  }

  _checkClient() {
    if (!this.client) throw new Error("LLM API key (OPENAI_API_KEY or GROQ_API_KEY) is missing.");
  }

  _formatMemories(memories) {
    if (!memories || memories.length === 0) return "No historical memories found for this deal.";
    return memories.map((m, i) => {
      let metaStr = m.metadata ? JSON.stringify(m.metadata) : '';
      return `[Memory ${i+1}] Date: ${m.timestamp || 'Unknown'}. Content: ${m.text || m.content || JSON.stringify(m)} ${metaStr}`;
    }).join('\n\n');
  }

  async _generateJsonResponse(systemPrompt, userPrompt) {
    this._checkClient();
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2
      });
      return JSON.parse(response.choices[0].message.content);
    } catch (err) {
      console.error("[AI] Error generating JSON response:", err.message);
      throw new Error(`LLM Error: ${err.message}`);
    }
  }

  async generateDealResponse(deal, memories, message) {
    this._checkClient();
    const formattedMemories = this._formatMemories(memories);
    const systemPrompt = `You are DealMind AI, an enterprise sales intelligence assistant.
Your goal is to answer questions using CURRENT DEAL DATA and HISTORICAL MEMORIES.
When referencing history, clarify you are using remembered context.

CURRENT DEAL DATA:
Company: ${deal.company}
Deal Name: ${deal.name}
Stage: ${deal.stage}

HISTORICAL MEMORIES (RETRIEVED FROM HINDSIGHT):
${formattedMemories}
`;

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7
      });
      return { answer: response.choices[0].message.content, memoriesUsed: memories };
    } catch (err) {
      console.error("[AI] Error processing chat:", err.message);
      throw new Error(`LLM Error: ${err.message}`);
    }
  }

  async prepareDealMeeting(deal, memories) {
    const formattedMemories = this._formatMemories(memories);
    const systemPrompt = `You are DealMind AI, preparing a salesperson for a meeting based on deal history.
Output strictly JSON matching this schema:
{
  "summary": "String (Deal Summary)",
  "customerPriorities": ["Array of Strings (Customer Priorities)"],
  "previousObjections": ["Array of Strings (Previous Objections)"],
  "competitors": ["Array of Strings (Competitors Mentioned)"],
  "stakeholderConcerns": ["Array of Strings (Stakeholder Concerns)"],
  "pricingHistory": ["Array of Strings (Pricing discussions/commitments)"],
  "previousCommitments": ["Array of Strings (Previous Commitments)"],
  "talkingPoints": ["Array of Strings (Recommended talking points)"],
  "recommendedNextAction": "String (Suggested Next Action)"
}`;
    const userPrompt = `
CURRENT DEAL DATA:
Company: ${deal.company}
Deal Name: ${deal.name}
Value: ${deal.value}
Stage: ${deal.stage}

HISTORICAL MEMORIES:
${formattedMemories}
`;
    const result = await this._generateJsonResponse(systemPrompt, userPrompt);
    return { data: result, memoriesUsed: memories };
  }

  async analyzeObjections(deal, memories) {
    const formattedMemories = this._formatMemories(memories);
    const systemPrompt = `Analyze customer objections from the historical deal memories.
Output strictly JSON matching this schema:
{
  "previousObjections": ["List of distinct objections"],
  "frequency": "String describing frequency of objections",
  "recentObjections": ["Most recent objections"],
  "relatedConversations": ["Summary of context around the objections"],
  "possibleResponseStrategy": "String outlining the suggested approach"
}`;
    const userPrompt = `Deal: ${deal.company}\n\nHISTORICAL MEMORIES:\n${formattedMemories}`;
    const result = await this._generateJsonResponse(systemPrompt, userPrompt);
    return { data: result, memoriesUsed: memories };
  }

  async analyzeCompetitors(deal, memories) {
    const formattedMemories = this._formatMemories(memories);
    const systemPrompt = `Analyze competitor mentions from historical deal memories.
Output strictly JSON matching this schema:
{
  "competitors": [
    {
      "name": "String",
      "mentions": "Number",
      "context": "String (how it was brought up)",
      "customerConcern": "String (why they are comparing us)",
      "suggestedResponse": "String (how to position against them)"
    }
  ]
}`;
    const userPrompt = `Deal: ${deal.company}\n\nHISTORICAL MEMORIES:\n${formattedMemories}`;
    const result = await this._generateJsonResponse(systemPrompt, userPrompt);
    return { data: result, memoriesUsed: memories };
  }

  async generateNextActions(deal, memories) {
    const formattedMemories = this._formatMemories(memories);
    const systemPrompt = `Generate practical next actions based on deal stage and history.
Output strictly JSON matching this schema:
{
  "nextActions": [
    {
      "action": "String (Action to take)",
      "rationale": "String (Why this action makes sense based on history or current deal stage)"
    }
  ]
}`;
    const userPrompt = `CURRENT DEAL DATA:\nStage: ${deal.stage}\nProbability: ${deal.probability}\n\nHISTORICAL MEMORIES:\n${formattedMemories}`;
    const result = await this._generateJsonResponse(systemPrompt, userPrompt);
    return { data: result, memoriesUsed: memories };
  }

  async detectPatterns(deal, memories) {
    const formattedMemories = this._formatMemories(memories);
    const systemPrompt = `Analyze historical deal memories to identify recurring patterns such as objections, competitor mentions, or specific requests.
Output strictly JSON matching this schema:
{
  "patterns": [
    {
      "type": "String (e.g., objection, competitor, pricing, request)",
      "topic": "String (e.g., pricing, AutoCorp, timeline)",
      "frequency": "Number (how many times it appears)",
      "recent": "Boolean (is it a recent concern?)",
      "evidence": ["Array of Strings (exact quotes or summaries from memory proving the pattern)"]
    }
  ]
}`;
    const userPrompt = `Deal: ${deal.company}\n\nHISTORICAL MEMORIES:\n${formattedMemories}`;
    const result = await this._generateJsonResponse(systemPrompt, userPrompt);
    return { data: result, memoriesUsed: memories };
  }

  async prepareMeetingCompare(deal, memories) {
    // Generate without memory
    const genericSystemPrompt = `You are a generic sales assistant preparing a salesperson for a meeting. 
You only have current deal data. Give generic advice based on standard sales practices for this deal stage.
Output strictly JSON matching this schema:
{
  "summary": "String",
  "customerPriorities": ["String"],
  "previousObjections": ["String"],
  "competitors": ["String"],
  "stakeholderConcerns": ["String"],
  "pricingHistory": ["String"],
  "previousCommitments": ["String"],
  "talkingPoints": ["String"],
  "recommendedNextAction": "String"
}`;
    const genericUserPrompt = `CURRENT DEAL DATA:\nCompany: ${deal.company}\nDeal Name: ${deal.name}\nValue: ${deal.value}\nStage: ${deal.stage}\n\nNo historical memory available. Generate generic guidance.`;
    
    // Generate with memory
    const genericResult = await this._generateJsonResponse(genericSystemPrompt, genericUserPrompt);
    const personalizedResult = await this.prepareDealMeeting(deal, memories);
    
    return { 
      generic: genericResult, 
      personalized: personalizedResult.data, 
      memoriesUsed: personalizedResult.memoriesUsed 
    };
  }
}

module.exports = new AIService();
