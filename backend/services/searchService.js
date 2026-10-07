const axios = require('axios');

class SearchService {
  constructor() {
    this.apiKey = process.env.SEARCH_API_KEY; // e.g., SerpAPI, Tavily, Google Custom Search
  }

  async search(query, limit = 5) {
    try {
      if (!query || query.trim() === '') return [];

      // Fallback mock search implementation if no key is supplied for immediate local testing
      if (!this.apiKey) {
        return this.generateMockSearchResults(query, limit);
      }

      // Tavily Search API Example Implementation
      const response = await axios.post(
        'https://api.tavily.com/search',
        {
          api_key: this.apiKey,
          query: query,
          search_depth: 'advanced',
          max_results: limit,
          include_answer: false,
          include_raw_content: true,
        },
        { timeout: 10000 }
      );

      return (response.data.results || []).map((item) => ({
        url: item.url,
        title: item.title,
        domain: new URL(item.url).hostname.replace('www.', ''),
        snippet: item.content,
        rawContent: item.raw_content || item.content,
        publishedAt: item.published_date || null,
        author: item.author || 'Unknown',
      }));
    } catch (error) {
      console.error(`Search error for query "${query}":`, error.message);
      return [];
    }
  }

  generateMockSearchResults(query, limit) {
    const domains = ['edu-journal.org', 'techresearch.io', 'gov-policy.gov', 'academic-insight.com'];
    return Array.from({ length: limit }).map((_, idx) => ({
      url: `https://${domains[idx % domains.length]}/article-${Date.now()}-${idx}`,
      title: `Empirical Analysis on ${query} (Study ${idx + 1})`,
      domain: domains[idx % domains.length],
      snippet: `Comprehensive findings regarding ${query}. Data indicates substantial statistical variance across core indicators.`,
      rawContent: `Full research paper content discussing ${query}. Section 1 outlines methodology while Section 2 highlights significant implications for governance and technology deployment.`,
      publishedAt: new Date().toISOString(),
      author: `Dr. Researcher ${idx + 1}`,
    }));
  }
}

module.exports = new SearchService();