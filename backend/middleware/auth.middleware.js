import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';

/**
 * Require valid Bearer JWT. Sets req.user = { id, email, role, firstName, lastName }.
 */
export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: 'Missing token' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query(
      `SELECT id, email, role, is_active, first_name, last_name FROM users WHERE id = $1`,
      [decoded.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const row = result.rows[0];
    if (!row.is_active) {
      return res.status(403).json({ error: 'Account is disabled' });
    }
    req.user = {
      id: row.id,
      email: row.email,
      role: row.role,
      firstName: row.first_name,
      lastName: row.last_name,
    };
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    return res.status(500).json({ error: err.message });
  }
}
