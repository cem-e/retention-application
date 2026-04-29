import { useState } from "react";
import StatusPill from "./StatusPill";
import TrendChart from "./TrendChart";
import MonthlySummary from "./MonthlySummary";
import TransactionHistory from "./TransactionHistory";
import { API_BASE_URL } from "../config";

export default function CustomerDetail({
  customerDetail,
  detailLoading,
  detailError,
  formatCurrency,
  onCallCreated,
}) {
  const [activeView, setActiveView] = useState("trend");
  const [expandedCallId, setExpandedCallId] = useState(null);
  const [outcome, setOutcome] = useState("Reached");
  const [notes, setNotes] = useState("");
  const [submittingCall, setSubmittingCall] = useState(false);
  const [callError, setCallError] = useState("");

  if (detailError) {
    return <p className="error-message">{detailError}</p>;
  }

  if (detailLoading) {
    return (
      <div className="empty-state">
        <p>Loading customer detail...</p>
      </div>
    );
  }

  if (!customerDetail) {
    return (
      <div className="empty-state">
        <p>Loading customer detail...</p>
      </div>
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSubmittingCall(true);
      setCallError("");

      const response = await fetch(`${API_BASE_URL}/api/retention-calls`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_id: customerDetail.customer_id,
          outcome,
          notes,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save retention call");
      }

      const newCall = await response.json();
      onCallCreated(newCall);
      setExpandedCallId(newCall.id);
      setNotes("");
      setOutcome("Reached");
    } catch (error) {
      setCallError(error.message);
    } finally {
      setSubmittingCall(false);
    }
  }

  return (
    <div className="detail-layout">
      <div className="detail-primary">
        <div className="detail-tabs">
          <button
            className={`detail-tab ${activeView === "trend" ? "is-active" : ""}`}
            onClick={() => setActiveView("trend")}
            type="button"
          >
            Trend
          </button>
          <button
            className={`detail-tab ${activeView === "monthly" ? "is-active" : ""}`}
            onClick={() => setActiveView("monthly")}
            type="button"
          >
            Monthly Summary
          </button>
          <button
            className={`detail-tab ${activeView === "history" ? "is-active" : ""}`}
            onClick={() => setActiveView("history")}
            type="button"
          >
            Transaction History
          </button>
        </div>

        <div className="detail-view">
          {activeView === "trend" && (
            <TrendChart
              dailyTrend={customerDetail.dailyTrend}
              formatCurrency={formatCurrency}
            />
          )}

          {activeView === "monthly" && (
            <div className="graph-panel">
              <h3>Monthly Transaction Volume</h3>
              <p className="panel-copy">Aggregated monthly volume summary.</p>
              <MonthlySummary
                monthlyVolume={customerDetail.monthlyVolume}
                formatCurrency={formatCurrency}
              />
            </div>
          )}

          {activeView === "history" && (
            <div className="graph-panel">
              <h3>Full Transaction History</h3>
              <p className="panel-copy">
                Review individual transactions before reaching out to the
                merchant.
              </p>
              <TransactionHistory
                transactions={customerDetail.transactions}
                formatCurrency={formatCurrency}
              />
            </div>
          )}
        </div>
      </div>

      <div className="merchant-panel">
        <h3>{customerDetail.company_name}</h3>
        <p className="merchant-id">Merchant ID {customerDetail.customer_id}</p>

        <dl className="detail-grid">
          <div>
            <dt>Status</dt>
            <dd>
              <StatusPill status={customerDetail.status} />
            </dd>
          </div>
          <div>
            <dt>Address</dt>
            <dd>{customerDetail.address || "N/A"}</dd>
          </div>
          <div>
            <dt>Phone</dt>
            <dd>{customerDetail.phone_number}</dd>
          </div>
          <div>
            <dt>Volume (90d)</dt>
            <dd>{formatCurrency(customerDetail.total_volume_last_90_days)}</dd>
          </div>
          <div>
            <dt>Transactions (90d)</dt>
            <dd>{customerDetail.transaction_count_last_90_days}</dd>
          </div>
        </dl>

        <div className="calls-panel">
          <h4>Retention interactions</h4>
          <form className="call-form" onSubmit={handleSubmit}>
            <label className="call-form-field">
              <span>Notes</span>
              <textarea
                rows="3"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Add a short note from the call"
              />
            </label>

            <label className="call-form-field">
              <span>Outcome</span>
              <select
                value={outcome}
                onChange={(event) => setOutcome(event.target.value)}
              >
                <option value="Reached">Reached</option>
                <option value="Left voicemail">Left voicemail</option>
                <option value="No answer">No answer</option>
                <option value="Follow-up needed">Follow-up needed</option>
              </select>
            </label>

            <div className="call-form-actions">
              <button
                className="detail-tab is-active"
                type="submit"
                disabled={submittingCall}
              >
                {submittingCall ? "Saving..." : "Log call"}
              </button>
              {callError && <p className="call-form-error">{callError}</p>}
            </div>
          </form>

          {customerDetail.retentionCalls?.length ? (
            <ul className="calls-list">
              {customerDetail.retentionCalls.map((call) => (
                <li key={call.id} className="call-item">
                  <button
                    className="call-item-button"
                    type="button"
                    onClick={() =>
                      setExpandedCallId((currentId) =>
                        currentId === call.id ? null : call.id,
                      )
                    }
                  >
                    <div className="call-item-meta">
                      <strong>{call.outcome}</strong>
                    </div>
                    <span>
                      {new Date(call.call_timestamp).toLocaleString("en-GB")}
                    </span>
                  </button>
                  {expandedCallId === call.id && (
                    <div className="call-item-notes">
                      <br></br>
                      {call.notes?.trim()
                        ? call.notes
                        : "No notes added for this interaction."}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="panel-copy">No retention calls logged yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
