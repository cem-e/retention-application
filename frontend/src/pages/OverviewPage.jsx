import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import CustomerTable from "../components/CustomerTable";
import { API_BASE_URL } from "../config";

const euroFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "EUR",
});

function formatCurrency(minorUnits) {
  return euroFormatter.format(minorUnits / 100);
}

export default function OverviewPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    column: "company_name",
    direction: "asc",
  });
  const navigate = useNavigate();

  async function loadCustomers() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/api/customers`);

      if (!response.ok) {
        throw new Error("Failed to load customers");
      }

      const data = await response.json();
      setCustomers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  function openCustomerDetail(customerId) {
    navigate(`/customers/${customerId}`);
  }

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const searchResults =
    normalizedQuery === ""
      ? []
      : customers
          .filter((customer) => {
            const companyName = customer.company_name.toLowerCase();
            const customerId = String(customer.customer_id);
            const customerCountry = customer.country.toLowerCase();

            return (
              companyName.includes(normalizedQuery) ||
              customerId.includes(normalizedQuery) ||
              customerCountry.includes(normalizedQuery)
            );
          })
          .slice(0, 8);

  function handleSearchSelect(customerId) {
    setSearchQuery("");
    setIsSearchOpen(false);
    openCustomerDetail(customerId);
  }

  function handleSort(column) {
    setSortConfig((currentSort) => {
      if (currentSort.column === column) {
        return {
          column,
          direction: currentSort.direction === "asc" ? "desc" : "asc",
        };
      }

      return {
        column,
        direction: "asc",
      };
    });
  }

  const statusPriority = {
    inactive: 0,
    at_risk: 1,
    active: 2,
  };

  const sortedCustomers = [...customers].sort((a, b) => {
    let comparison = 0;

    if (sortConfig.column === "company_name") {
      comparison = a.company_name.localeCompare(b.company_name);
    }

    if (sortConfig.column === "customer_id") {
      comparison = a.customer_id - b.customer_id;
    }

    if (sortConfig.column === "country") {
      comparison = a.country.localeCompare(b.country);
    }

    if (sortConfig.column === "product_type") {
      comparison = a.product_type.localeCompare(b.product_type);
    }

    if (sortConfig.column === "total_volume_last_90_days") {
      comparison =
        Number(a.total_volume_last_90_days) -
        Number(b.total_volume_last_90_days);
    }

    if (sortConfig.column === "transaction_count_last_90_days") {
      comparison =
        Number(a.transaction_count_last_90_days) -
        Number(b.transaction_count_last_90_days);
    }

    if (sortConfig.column === "days_since_last_transaction") {
      comparison =
        Number(a.days_since_last_transaction) -
        Number(b.days_since_last_transaction);
    }

    if (sortConfig.column === "status") {
      comparison = statusPriority[a.status] - statusPriority[b.status];
    }

    if (sortConfig.direction === "desc") {
      return comparison * -1;
    }

    return comparison;
  });

  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <h1>Merchant Dashboard</h1>

          <Button onClick={loadCustomers}>
            {loading ? "Loading..." : "Refresh customers"}
          </Button>
          <p className="helper-text">
            {customers.length > 0
              ? `${customers.length} merchants loaded`
              : "Loading merchant data"}
          </p>
        </div>
      </section>

      {error && <p className="error-message">{error}</p>}

      <section className="overview-card">
        <div className="overview-header">
          <div>
            <p className="section-label">Overview</p>
            <h2>Merchant Activity</h2>
          </div>

          <div className="searchbar-shell">
            <input
              className="merchant-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onFocus={() => setIsSearchOpen(true)}
              onBlur={() => {
                window.setTimeout(() => setIsSearchOpen(false), 100);
              }}
              placeholder="Search merchant by name or ID"
            />

            {isSearchOpen && searchResults.length > 0 && (
              <ul className="search-results">
                {searchResults.map((customer) => (
                  <li key={customer.customer_id}>
                    <button
                      className="search-result-button"
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => handleSearchSelect(customer.customer_id)}
                    >
                      <strong>{customer.company_name}</strong>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {customers.length === 0 ? (
          <div className="empty-state">
            <p>
              {loading ? "Loading merchant activity..." : "No customers found."}
            </p>
          </div>
        ) : (
          <CustomerTable
            customers={sortedCustomers}
            onSelectCustomer={openCustomerDetail}
            formatCurrency={formatCurrency}
            sortConfig={sortConfig}
            onSort={handleSort}
          />
        )}
      </section>
    </>
  );
}
