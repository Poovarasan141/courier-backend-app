# Courier Aggregation Platform

A courier aggregation service built using Node.js and Express that integrates with courier partners through a common interface.

Currently supported courier partner:

- Urbanebolt

## Features

- Dynamic courier partner integration
- Factory pattern for courier selection
- Order creation
- Shipment tracking
- Shipment cancellation
- Idempotent order creation
- MongoDB persistence
- Request validation
- Centralized error handling
- Easily extensible for new courier partners

---

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- Joi
- Axios

---

## Project Structure

```txt
src/
│
├── config/
│   └── axios.js
│
├── courier/
│   ├── index.js
│   └── urbanebolt.js
│
├── controllers/
│   └── order.controller.js
│
├── middlewares/
│   └── validate.middleware.js
│
├── models/
│   ├── Order.js
│   └── TrackingHistory.js
│
├── routes/
│   ├── index.js
│   └── order.routes.js
│
├── validations/
│   └── order.validation.js
│
├── utils/
│   └── errorHandler.js
│
├── app.js
└── server.js
```

---

## Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd courier-platform
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root.

Example:

```env
PORT=5000

MONGO_URI=mongodb://localhost:27017/courier-platform

URBANEBOLT_BASE_URL=https://uat.urbanebolt.in/api/v1
URBANEBOLT_USERNAME=your_username
URBANEBOLT_PASSWORD=your_password
URBANEBOLT_CUSTOMER_CODE=your_customer_code
```

### 4. Run the Application

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

Server will run at:

```txt
http://localhost:5000
```

---

## API Endpoints

### Health Check

```http
GET /health
```

---

### Create Order

```http
POST /api/v1/orders
```

Sample Request:

```json
{
  "courier_partner": "urbanebolt",
  "order_id": "ORDER_1001",
  "customer_name": "John Doe",
  "customer_phone": "9876543210",
  "customer_email": "john@example.com",
  "address": "Street 1",
  "city": "Salem",
  "state": "Tamil Nadu",
  "pincode": "636001",
  "amount": 1000,
  "item_description": "Books",
  "weight": 1,
  "length": 10,
  "breadth": 10,
  "height": 10
}
```

---

### Track Order

```http
GET /api/v1/orders/:orderId/track
```

Example:

```http
GET /api/v1/orders/TF_xxxxx/track
```

---

### Cancel Order

```http
POST /api/v1/orders/:orderId/cancel
```

Example:

```http
POST /api/v1/orders/TF_xxxxx/cancel
```

---

## How to Test

You can test APIs using:

- Postman
- Thunder Client
- cURL

Recommended order:

1. Create Order
2. Track Order
3. Cancel Order

---

## Idempotency

Duplicate shipment creation is prevented using `order_id`.

If the same `order_id` is received again, the existing order is returned instead of creating a new shipment.

---

## Adding a New Courier Partner

The platform is designed to support new courier integrations with minimal changes.

### Step 1: Create Courier File

Create a new file:

```txt
src/courier/delhivery.js
```

Implement the same contract:

```js
const createOrder = async payload => {};

const trackOrder = async awbNumber => {};

const cancelOrder = async awbNumber => {};

module.exports = {
  createOrder,
  trackOrder,
  cancelOrder
};
```

### Step 2: Register Courier

Update:

```txt
src/courier/index.js
```

Example:

```js
const delhivery = require('./delhivery');

switch (
  courierPartner?.toLowerCase()
) {
  case 'urbanebolt':
    return urbanebolt;

  case 'delhivery':
    return delhivery;
}
```

No controller changes are required.

---

## Assumptions

- Urbanebolt UAT APIs are used.
- Only single shipment APIs are implemented.
- MongoDB is used for persistence.