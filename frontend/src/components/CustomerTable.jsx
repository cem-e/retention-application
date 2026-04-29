import StatusPill from "./StatusPill";

export default function CustomerTable({
  customers,
  onSelectCustomer,
  formatCurrency,
  sortConfig,
  onSort,
}) {
  function getSortIndicator(column) {
    if (sortConfig.column !== column) {
      return "";
    }

    return sortConfig.direction === "asc" ? " ↑" : " ↓";
  }

  return (
    <div className="table-shell">
      <table>
        <thead>
          <tr>
            <th>Merchant</th>
            <th>ID</th>

            <th>Country</th>
            <th>Product</th>
            <th>
              <button
                className="table-sort-button"
                type="button"
                onClick={() => onSort("total_volume_last_90_days")}
              >
                Volume (90d){getSortIndicator("total_volume_last_90_days")}
              </button>
            </th>
            <th>
              <button
                className="table-sort-button"
                type="button"
                onClick={() => onSort("transaction_count_last_90_days")}
              >
                Transactions (90d)
                {getSortIndicator("transaction_count_last_90_days")}
              </button>
            </th>
            <th>
              <button
                className="table-sort-button"
                type="button"
                onClick={() => onSort("days_since_last_transaction")}
              >
                Days Since Last Tx
                {getSortIndicator("days_since_last_transaction")}
              </button>
            </th>
            <th>
              <button
                className="table-sort-button"
                type="button"
                onClick={() => onSort("status")}
              >
                Status{getSortIndicator("status")}
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr
              key={customer.customer_id}
              onClick={() => onSelectCustomer(customer.customer_id)}
            >
              <td className="merchant-name">{customer.company_name}</td>
              <td>{customer.customer_id}</td>
              <td>{customer.country}</td>
              <td>{customer.product_type}</td>
              <td>{formatCurrency(customer.total_volume_last_90_days)}</td>
              <td>{customer.transaction_count_last_90_days}</td>
              <td>{customer.days_since_last_transaction}</td>
              <td>
                <StatusPill status={customer.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
