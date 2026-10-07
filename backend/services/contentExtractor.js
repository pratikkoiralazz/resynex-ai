class ContentExtractor {
  cleanText(text) {
    if (!text) return '';
    return text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/[\r\n\t]+/g, ' ')
      .trim();
  }

  calculateCredibility(domain, url) {
    let score = 0.5; // Base score
    if (domain.endsWith('.edu') || domain.endsWith('.gov')) score += 0.4;
    if (domain.endsWith('.org')) score += 0.2;
    if (url.includes('/research/') || url.includes('/journal/') || url.includes('/pdf/')) score += 0.1;
    return Math.min(score, 0.99);
  }
}

module.exports = new ContentExtractor();