# Retention Dashboard

Small internal tool for retention agents to monitor merchant activity, review customer context, and log retention interactions.

## Setup

### 1. Create the database

```bash
createdb data_solutions_project
```

### 2. Load the provided seed data

```bash
psql -U postgres -d data_solutions_project -f database/seed.sql
```

### 3. Create the retention calls table

Run this command from the project root:

```bash
psql -U postgres -d data_solutions_project <<'SQL'
CREATE TABLE IF NOT EXISTS retention_calls (
    id BIGSERIAL PRIMARY KEY,
    merchant_id BIGINT NOT NULL REFERENCES dim_customer(merchant_id),
    call_timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    outcome VARCHAR(50) NOT NULL,
    notes TEXT,
    agent_name VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_retention_calls_merchant_id
ON retention_calls(merchant_id);
SQL
```

### 4. Install backend dependencies

```bash
cd backend
npm install
```

### 5. Start the backend

```bash
npm run dev
```

The backend runs on:

```text
http://localhost:3000
```

### 6. Open a second terminal and install frontend dependencies

```bash
cd frontend
npm install
```

### 7. Start the frontend

```bash
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

## Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: PostgreSQL

## Features

- Customer overview page:
  - total transaction volume for the last 90 days
  - number of transactions for the last 90 days
  - days since last transaction
  - status classification
- Customer detail page:
  - daily transaction trend
  - aggregated monthly transaction volume
  - full transaction history
  - retention interaction history
- Retention interaction logging without page refresh
- Merchant search
- Sorting on key activity columns

## Customer Risk Classification Logic

The status logic is based on transaction recency relative to the latest transaction date in the dataset, not the real current date.

This is important because the provided data is historical. Using the dataset reference date keeps the classification stable and meaningful.

Rules:

- `Active`: the merchant has had at least one transaction within the last 7 days
- `At Risk`: the merchant has had no transactions for 8 to 30 days
- `Inactive`: the merchant has had no transactions for more than 30 days

`days_since_last_transaction` is calculated from:

- `customer.last_transaction_at`
- compared against
- `MAX(transaction_timestamp)` from `fct_transactions`

## Architecture

The project is split into three parts:

- `frontend/`: React application
- `backend/`: Express API
- `database/`: SQL schema and seed data
