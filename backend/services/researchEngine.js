const db = require('../config/db');
const searchService = require('./searchService');
const contentExtractor = require('./contentExtractor');
const aiService = require('./aiService');

class ResearchEngine {
  async executeResearch(sessionId) {
    try {
      // 1. Update status -> Planning
      await this.updateStatus(sessionId, 'planning', 'Generating optimized search queries...');
      const sessionRes = await db.query('SELECT * FROM research_sessions WHERE id = $1', [sessionId]);
      const session = sessionRes.rows[0];

      const queries = await aiService.generateSearchQueries(session.topic, session.instructions, session.depth);
      for (const q of queries) {
        await db.query('INSERT INTO research_queries (research_session_id, query) VALUES ($1, $2)', [sessionId, q]);
      }

      // 2. Multi-source Search
      await this.updateStatus(sessionId, 'searching', `Executing ${queries.length} search queries across sources...`);
      let allRawResults = [];
      for (const query of queries) {
        const results = await searchService.search(query, session.depth === 'deep' ? 5 : 3);
        allRawResults.push(...results);
      }

      // Deduplicate results by URL
      const uniqueResultsMap = new Map();
      allRawResults.forEach(item => {
        if (!uniqueResultsMap.has(item.url)) uniqueResultsMap.set(item.url, item);
      });
      const uniqueResults = Array.from(uniqueResultsMap.values());

      // 3. Content Extraction & Storage
      await this.updateStatus(sessionId, 'processing', `Extracting and cleaning content from ${uniqueResults.length} sources...`);
      const processedSources = [];

      for (const item of uniqueResults) {
        const cleanedContent = contentExtractor.cleanText(item.rawContent);
        if (!cleanedContent || cleanedContent.length < 50) continue; // Skip unviable sources

        const credScore = contentExtractor.calculateCredibility(item.domain, item.url);

        const sourceRes = await db.query(
          `INSERT INTO sources (url, title, domain, author, published_at, content, credibility_score)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (url) DO UPDATE SET content = EXCLUDED.content
           RETURNING id`,
          [item.url, item.title, item.domain, item.author, item.publishedAt ? new Date(item.publishedAt) : null, cleanedContent, credScore]
        );
        const sourceId = sourceRes.rows[0].id;

        await db.query(
          `INSERT INTO research_sources (research_session_id, source_id, relevance_score)
           VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
          [sessionId, sourceId, 0.85]
        );

        processedSources.push({ id: sourceId, url: item.url, title: item.title, content: cleanedContent });
      }

      // 4. Source Analysis
      await this.updateStatus(sessionId, 'analyzing', 'Performing detailed analysis and claim extraction on sources...');
      const sourceAnalysisList = [];
      for (const src of processedSources) {
        const analysis = await aiService.extractSourceData(src.content, src.title);
        
        await db.query('UPDATE sources SET summary = $1 WHERE id = $2', [analysis.summary, src.id]);
        
        for (const claim of (analysis.claims || [])) {
          await db.query(
            'INSERT INTO source_claims (source_id, claim, evidence, confidence) VALUES ($1, $2, $3, $4)',
            [src.id, claim.claim, claim.evidence, claim.confidence || 0.8]
          );
        }

        sourceAnalysisList.push({ id: src.id, url: src.url, title: src.title, summary: analysis.summary, claims: analysis.claims });
      }

      // 5. Cross-Source Comparison
      await this.updateStatus(sessionId, 'comparing', 'Comparing claims across sources to discover conflicts & consensus...');
      const comparisons = [];
      for (let i = 0; i < sourceAnalysisList.length; i++) {
        for (let j = i + 1; j < sourceAnalysisList.length; j++) {
          const comp = await aiService.compareSources(sourceAnalysisList[i], sourceAnalysisList[j]);
          await db.query(
            `INSERT INTO source_comparisons (research_session_id, source_a_id, source_b_id, relationship, explanation)
             VALUES ($1, $2, $3, $4, $5)`,
            [sessionId, sourceAnalysisList[i].id, sourceAnalysisList[j].id, comp.relationship, comp.explanation]
          );
          comparisons.push(comp);
        }
      }

      // 6. Report Generation & Citations
      await this.updateStatus(sessionId, 'generating', 'Synthesizing insights and generating grounded research report...');
      const reportData = await aiService.generateFinalReport(session.topic, sourceAnalysisList, comparisons);

      const reportRes = await db.query(
        `INSERT INTO reports (research_session_id, title, executive_summary, report_content)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [
          sessionId,
          reportData.title,
          reportData.executive_summary,
          JSON.stringify({
            key_findings: reportData.key_findings,
            detailed_analysis: reportData.detailed_analysis,
            source_comparison_summary: reportData.source_comparison_summary,
            contradictions: reportData.contradictions,
            research_gaps: reportData.research_gaps,
            conclusion: reportData.conclusion
          })
        ]
      );
      const reportId = reportRes.rows[0].id;

      // Link Citations
      let citationCount = 1;
      for (const item of (reportData.claims_with_citations || [])) {
        if (item.source_urls && item.source_urls.length > 0) {
          for (const url of item.source_urls) {
            const srcMatch = processedSources.find(s => s.url === url);
            if (srcMatch) {
              await db.query(
                `INSERT INTO citations (report_id, source_id, claim_reference, citation_number)
                 VALUES ($1, $2, $3, $4)`,
                [reportId, srcMatch.id, item.claim, citationCount]
              );
            }
          }
          citationCount++;
        }
      }

      // 7. Complete Session
      await db.query(
        `UPDATE research_sessions SET status = 'completed', progress_message = 'Research successfully completed.', completed_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [sessionId]
      );

    } catch (error) {
      console.error(`Research execution failure for session ${sessionId}:`, error);
      await db.query(
        `UPDATE research_sessions SET status = 'failed', error_message = $1, progress_message = 'Research process failed.' WHERE id = $2`,
        [error.message, sessionId]
      );
    }
  }

  async updateStatus(sessionId, status, message) {
    await db.query(
      `UPDATE research_sessions 
       SET status = $1, progress_message = $2, started_at = COALESCE(started_at, CURRENT_TIMESTAMP)
       WHERE id = $3`,
      [status, message, sessionId]
    );
  }
}

module.exports = new ResearchEngine();