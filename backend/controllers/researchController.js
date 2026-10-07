const db = require('../config/db');
const researchEngine = require('../services/researchEngine');

exports.createSession = async (req, res, next) => {
  try {
    const { topic, instructions, depth } = req.body;
    if (!topic || topic.trim() === '') {
      return res.status(400).json({ error: 'Research topic is required.' });
    }

    const result = await db.query(
      `INSERT INTO research_sessions (topic, instructions, depth, status)
       VALUES ($1, $2, $3, 'pending') RETURNING id`,
      [topic.trim(), instructions || '', depth || 'standard']
    );

    const sessionId = result.rows[0].id;

    // Trigger autonomous background orchestration non-blockingly
    setImmediate(() => {
      researchEngine.executeResearch(sessionId);
    });

    res.status(202).json({ id: sessionId, message: 'Research process initialized.' });
  } catch (error) {
    next(error);
  }
};

exports.getSessions = async (req, res, next) => {
  try {
    const { search, status, sort } = req.query;
    let queryText = `
      SELECT rs.*, 
             COUNT(DISTINCT rsrc.source_id) as source_count,
             rep.id as report_id
      FROM research_sessions rs
      LEFT JOIN research_sources rsrc ON rs.id = rsrc.research_session_id
      LEFT JOIN reports rep ON rs.id = rep.research_session_id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      queryText += ` AND rs.topic ILIKE $${params.length}`;
    }
    if (status) {
      params.push(status);
      queryText += ` AND rs.status = $${params.length}`;
    }

    queryText += ` GROUP BY rs.id, rep.id ORDER BY rs.created_at ${sort === 'asc' ? 'ASC' : 'DESC'}`;

    const { rows } = await db.query(queryText, params);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

exports.getSessionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sessionRes = await db.query('SELECT * FROM research_sessions WHERE id = $1', [id]);
    if (sessionRes.rows.length === 0) return res.status(404).json({ error: 'Session not found' });

    const queriesRes = await db.query('SELECT * FROM research_queries WHERE research_session_id = $1', [id]);
    
    res.json({
      session: sessionRes.rows[0],
      queries: queriesRes.rows,
    });
  } catch (error) {
    next(error);
  }
};

exports.getStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query(
      'SELECT id, status, progress_message, error_message, started_at, completed_at FROM research_sessions WHERE id = $1',
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Session not found' });
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.getSources = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query(
      `SELECT s.*, rs.relevance_score, rs.selected
       FROM sources s
       JOIN research_sources rs ON s.id = rs.source_id
       WHERE rs.research_session_id = $1
       ORDER BY rs.relevance_score DESC`,
      [id]
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

exports.getReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reportRes = await db.query('SELECT * FROM reports WHERE research_session_id = $1', [id]);
    if (reportRes.rows.length === 0) return res.status(404).json({ error: 'Report not available yet.' });

    const report = reportRes.rows[0];
    const citationsRes = await db.query(
      `SELECT c.*, s.title as source_title, s.domain, s.url, s.published_at, s.summary as source_summary, s.credibility_score
       FROM citations c
       JOIN sources s ON c.source_id = s.id
       WHERE c.report_id = $1
       ORDER BY c.citation_number ASC`,
      [report.id]
    );

    res.json({
      ...report,
      citations: citationsRes.rows
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM research_sessions WHERE id = $1', [id]);
    res.json({ message: 'Research session successfully deleted.' });
  } catch (error) {
    next(error);
  }
};