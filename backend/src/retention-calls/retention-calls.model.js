import pool from "../config/db.js";

async function getRetentionCallsForCustomer(customerId) {
  const query = `
    SELECT
      id,
      merchant_id AS customer_id,
      call_timestamp,
      agent_name,
      outcome,
      notes
    FROM retention_calls
    WHERE merchant_id = $1
    ORDER BY call_timestamp DESC
  `;

  const { rows } = await pool.query(query, [customerId]);
  return rows;
}

async function createRetentionCall({
  customerId,
  callTimestamp = new Date(),
  outcome,
  agentName,
  notes,
}) {
  const query = `
    INSERT INTO retention_calls (merchant_id, call_timestamp, outcome, notes, agent_name)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING
      id,
      merchant_id AS customer_id,
      call_timestamp,
      agent_name,
      outcome,
      notes
  `;

  const values = [customerId, callTimestamp, outcome, notes || null, agentName];
  const { rows } = await pool.query(query, values);
  return rows[0];
}

export { getRetentionCallsForCustomer, createRetentionCall };
