# FinTrack Database Schema Specification

FinTrack utilizes MongoDB with Mongoose ODM. Every financial record is strictly scoped to an authenticated `userId`.

## 1. User Model (`User`)
Represents registered users in the platform.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key, Auto | Unique User Identifier |
| `name` | String | Required, Trim, max 50 | User's full name |
| `email` | String | Required, Unique, Lowercase | Normalized email address |
| `password` | String | Required, Select: false | 10-round bcrypt hash |
| `currency` | String | Enum, Default: 'INR' | Currency symbol display (INR, USD, EUR, etc.) |
| `theme` | String | Default: 'minimalist-tech' | User dashboard theme |
| `createdAt` | Date | Auto Timestamp | Account registration date |
| `updatedAt` | Date | Auto Timestamp | Last profile update date |

## 2. Transaction Model (`Transaction`)
Stores all financial income inflows and expense outflows.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key, Auto | Unique Transaction Identifier |
| `userId` | ObjectId | Ref: User, Indexed, Required | Owner of the transaction |
| `title` | String | Required, Trim, max 100 | Merchant name or description |
| `amount` | Number | Required, Min: 0.01 | Monetary value |
| `type` | String | Enum: ['income', 'expense'] | Transaction polarity |
| `category` | String | Required, Validated Enum | Category (Food, Bills, Salary, etc.) |
| `description`| String | Optional, Trim, max 300 | Optional additional notes |
| `paymentMethod`| String | Enum, Default: 'UPI' | UPI, Credit Card, Debit Card, Cash, etc. |
| `date` | Date | Required, Indexed, Default: Now | Effective date of transaction |
| `createdAt` | Date | Auto Timestamp | Record creation timestamp |
| `updatedAt` | Date | Auto Timestamp | Record edit timestamp |

### Indexes
- `{ userId: 1, date: -1 }`: Optimizes chronological transaction history retrieval.
- `{ userId: 1, type: 1, date: -1 }`: Optimizes filtered queries and cashflow analytics.
- `{ userId: 1, category: 1 }`: Optimizes category breakdown aggregations.

## 3. Budget Model (`Budget`)
Stores monthly financial ceilings per category.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key, Auto | Unique Budget Identifier |
| `userId` | ObjectId | Ref: User, Indexed, Required | Owner of the budget |
| `category` | String | Required, Trim | Category or 'Total' for overall limit |
| `amount` | Number | Required, Min: 1 | Budget limit cap |
| `month` | Number | Required, 1 to 12 | Budget month |
| `year` | Number | Required | Budget year |
| `createdAt` | Date | Auto Timestamp | Creation timestamp |
| `updatedAt` | Date | Auto Timestamp | Modification timestamp |

### Indexes
- `{ userId: 1, category: 1, month: 1, year: 1 }` (Unique): Ensures each category has at most one budget cap per calendar month.

## 4. AI Insight Model (`AIInsight`)
Persists generated financial diagnostic tips and warnings for the user.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key, Auto | Unique Insight Identifier |
| `userId` | ObjectId | Ref: User, Indexed, Required | Target user |
| `insight` | String | Required | Recommendation or warning text |
| `category` | String | Enum | Spending, Budget, Savings, etc. |
| `severity` | String | Enum: ['info', 'warning', 'success', 'tip'] | Card visual styling code |
| `period` | String | Default: 'monthly' | Diagnostic window |
| `isRead` | Boolean | Default: false | Read acknowledgment state |
| `createdAt` | Date | Auto Timestamp | Date insight generated |
