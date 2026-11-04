# FinTrack REST API Documentation

Base URL: `http://localhost:5000/api`

All private endpoints require the `Authorization` header formatted as:
`Authorization: Bearer <jwt_token>`

---

## 1. Authentication Endpoints

### Register User
- **Method**: `POST`
- **Route**: `/auth/register`
- **Access**: Public
- **Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "securePassword123",
    "currency": "INR"
  }
  ```
- **Response**: `201 Created` with JWT token and sanitized user object.

### Login User
- **Method**: `POST`
- **Route**: `/auth/login`
- **Access**: Public
- **Body**:
  ```json
  {
    "email": "jane@example.com",
    "password": "securePassword123"
  }
  ```
- **Response**: `200 OK` with JWT token.

### Current User Profile
- **Method**: `GET`
- **Route**: `/auth/me`
- **Access**: Private

### Update Password
- **Method**: `PUT`
- **Route**: `/auth/update-password`
- **Access**: Private
- **Body**:
  ```json
  {
    "currentPassword": "oldPassword123",
    "newPassword": "newPassword456"
  }
  ```

---

## 2. Transactions Endpoints

### List Transactions (with Filtering, Search & Pagination)
- **Method**: `GET`
- **Route**: `/transactions`
- **Access**: Private
- **Query Parameters**:
  - `type`: `income` | `expense`
  - `category`: string
  - `paymentMethod`: string
  - `search`: string (matches title or notes)
  - `startDate`: ISO date string
  - `endDate`: ISO date string
  - `sortBy`: `date` | `amount` | `title`
  - `sortOrder`: `asc` | `desc`
  - `page`: integer (default 1)
  - `limit`: integer (default 20)

### Create Transaction
- **Method**: `POST`
- **Route**: `/transactions`
- **Access**: Private
- **Body**:
  ```json
  {
    "title": "Grocery Superstore",
    "amount": 3450.50,
    "type": "expense",
    "category": "Food",
    "description": "Weekly household pantry essentials",
    "paymentMethod": "Credit Card",
    "date": "2026-10-30"
  }
  ```

### Update Transaction
- **Method**: `PUT`
- **Route**: `/transactions/:id`
- **Access**: Private

### Delete Transaction
- **Method**: `DELETE`
- **Route**: `/transactions/:id`
- **Access**: Private

---

## 3. Budget Endpoints

### Get Budgets with Current Spending & Utilization
- **Method**: `GET`
- **Route**: `/budgets`
- **Access**: Private
- **Query Parameters**: `month` (1-12), `year` (e.g. 2026)
- **Response**: Returns category budget amounts, real-time spent calculation, remaining balance, and utilization percentage.

### Create / Upsert Budget
- **Method**: `POST`
- **Route**: `/budgets`
- **Access**: Private
- **Body**:
  ```json
  {
    "category": "Food",
    "amount": 12000,
    "month": 10,
    "year": 2026
  }
  ```

### Delete Budget
- **Method**: `DELETE`
- **Route**: `/budgets/:id`
- **Access**: Private

---

## 4. Analytics & Reports Endpoints

### Financial Summary
- **Method**: `GET`
- **Route**: `/analytics/summary`
- **Access**: Private
- **Response**: Total balance, all-time and current month income/expenses, savings rate, and month-over-month trend percentages.

### Monthly Cashflow Trends (Charts)
- **Method**: `GET`
- **Route**: `/analytics/monthly?months=6`
- **Access**: Private

### Category Breakdown
- **Method**: `GET`
- **Route**: `/analytics/categories?period=month`
- **Access**: Private

### Weekly Spending Distribution
- **Method**: `GET`
- **Route**: `/analytics/weekly`
- **Access**: Private

### Monthly Audit Report
- **Method**: `GET`
- **Route**: `/reports/monthly?month=10&year=2026`
- **Access**: Private

### Export Transactions as CSV
- **Method**: `GET`
- **Route**: `/reports/export`
- **Access**: Private
- **Response**: CSV attachment stream.

---

## 5. AI Assistant Endpoints

### Get AI Insights
- **Method**: `GET`
- **Route**: `/ai/insights?refresh=true`
- **Access**: Private

### Ask AI Financial Advisor
- **Method**: `POST`
- **Route**: `/ai/ask`
- **Access**: Private
- **Body**:
  ```json
  {
    "message": "How can I allocate my freelancing income to hit my emergency fund faster?"
  }
  ```

### Financial Health Score
- **Method**: `GET`
- **Route**: `/ai/health-score`
- **Access**: Private
