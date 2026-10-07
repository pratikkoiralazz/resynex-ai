const axios = require('axios');

class AIService {
  constructor() {
    this.apiKey = process.env.AI_API_KEY;
    this.apiUrl = process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions';
    this.model = process.env.AI_MODEL || 'gpt-4o-mini';
  }

  async callLLM(prompt, systemPrompt = 'You are an expert academic research assistant.', jsonMode = true) {
    if (!this.apiKey) {
      return this.generateMockAIResponse(prompt);
    }

    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          response_format: jsonMode ? { type: 'json_object' } : undefined,
          temperature: 0.2,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 45000,
        }
      );

      const content = response.data.choices[0].message.content;
      return jsonMode ? JSON.parse(content) : content;
    } catch (error) {
      console.error('AI API Call Error:', error.response?.data || error.message);
      throw new Error('AI Processing failure.');
    }
  }

  async generateSearchQueries(topic, instructions, depth) {
    const count = depth === 'quick' ? 3 : depth === 'deep' ? 7 : 5;
    const prompt = `Topic: "${topic}"\nInstructions: "${instructions || 'None'}"\n
    Generate ${count} distinct, precise web search queries to perform academic and multi-perspective research. 
    Return JSON format: { "queries": ["query1", "query2", ...] }`;

    const res = await this.callLLM(prompt);
    return res.queries || [topic];
  }

  async extractSourceData(sourceText, title) {
    const prompt = `Analyze this document titled "${title}":\n"${sourceText.substring(0, 3000)}"\n
    Return JSON format:
    {
      "summary": "Concise summary",
      "claims": [
        { "claim": "Statement of fact", "evidence": "Excerpt", "confidence": 0.85 }
      ]
    }`;
    return await this.callLLM(prompt);
  }

  async compareSources(sourceA, sourceB) {
    const prompt = `Compare Source A (${sourceA.title}) and Source B (${sourceB.title}):
    Source A Claims: ${JSON.stringify(sourceA.claims)}
    Source B Claims: ${JSON.stringify(sourceB.claims)}
    
    Return JSON format:
    {
      "relationship": "agrees" | "contradicts" | "complements" | "unrelated",
      "explanation": "Detailed explanation of findings or conflicts"
    }`;
    return await this.callLLM(prompt);
  }

  async generateFinalReport(topic, sourcesData, comparisons) {
    const prompt = `Generate a structured research report grounded strictly on these sources:
    Sources: ${JSON.stringify(sourcesData)}
    Comparisons: ${JSON.stringify(comparisons)}
    
    Return JSON format:
    {
      "title": "Comprehensive Research Report: ${topic}",
      "executive_summary": "Executive summary text...",
      "key_findings": ["Finding 1", "Finding 2"],
      "detailed_analysis": "Detailed narrative text...",
      "source_comparison_summary": "Summary of agreements and contradictions...",
      "contradictions": ["Contradiction 1"],
      "research_gaps": ["Gap 1"],
      "conclusion": "Conclusion text...",
      "claims_with_citations": [
        { "claim": "Statement", "source_urls": ["url1", "url2"] }
      ]
    }`;
    return await this.callLLM(prompt);
  }

  generateMockAIResponse(prompt) {
    if (prompt.includes('generateSearchQueries') || prompt.includes('search queries')) {
      return { queries: ['AI in education benefits', 'AI education risks', 'Academic research on AI learning'] };
    }
    if (prompt.includes('Analyze this document')) {
      return {
        summary: 'The article evaluates educational tools powered by AI.',
        claims: [{ claim: 'AI tutoring enhances outcomes by 20%.', evidence: 'Controlled trials show steady growth.', confidence: 0.9 }],
      };
    }
    if (prompt.includes('Compare Source A')) {
      return { relationship: 'complements', explanation: 'Both studies confirm benefits, though methodology differs.' };
    }
    return {
      title: 'Autonomous Research Report',
      executive_summary: 'An analysis reveals widespread integration of automated mechanisms.',
      key_findings: ['Higher efficiency observed', 'Skill transformation needed'],
      detailed_analysis: 'Detailed findings show significant adoption curves.',
      source_comparison_summary: 'Primary data aligns across regions.',
      contradictions: ['Disagreements exist on cost implementation timelines.'],
      research_gaps: ['Long-term longitudinal data remains missing.'],
      conclusion: 'Structured transformation is required.',
      claims_with_citations: [
        { claim: 'Higher efficiency observed across educational systems.', source_urls: [] }
      ]
    };
  }
}

module.exports = new AIService();