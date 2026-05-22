# 🚚 Courier Aggregation Service

A Node.js + Express backend service that provides a unified API layer over multiple courier partners (DHL, Delhivery, etc.) for order management, tracking, and cancellation.

---

## 📦 Tech Stack

- Node.js
- Express.js
- MongoDB (Mongoose)
- Joi (Validation)
- UUID
- Express Promise Router
- Morgan (Logging)
- CORS

---


## To add new courier partner.
1. Create a file courier partner integration file inside couriers folder.
2. Import this in couriers index.js file.
3. Nothing is required to enable new partner.

## 🏗️ Project Structure

src/
├── config/
│   └── database.js
├── controllers/
│   └── orderController.js
├── middlewares/
│   ├── auth.js
│   ├── errors.js
│   └── validation.js
├── models/
│   ├── Order.js
│   └── TrackingHistory.js
├── routes/
│   ├── index.js
│   └── orderRoutes.js
├── couriers/
│   ├── index.js
│   ├── dhl.js
│   └── delhivery.js
├── utils/
│   ├── logger.js
│   └── errorHandler.js
├── validations/
│   └── orderValidation.js

---

## 🔐 Authentication

All APIs are protected using API Key authentication.

Required Header:
x-api-key: YOUR_API_KEY

---

## 🚀 Base URL

/api/v1

---

## 📌 APIs

### 1. Create Order

POST /orders

Request Body:
{
  "courier_partner": "dhl",
  "order_id": "ORD123",
  "customer_name": "John Doe",
  "customer_phone": "9876543210",
  "customer_email": "john@example.com",
  "address": "Street 123",
  "city": "Chennai",
  "state": "TN",
  "pincode": "600001",
  "amount": 500,
  "weight": 1.5
}

Response:
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "internalOrderId": "TF_xxx",
    "status": "CREATED"
  }
}

---

### 2. Track Order

GET /orders/:orderId/track?courier_partner=dhl

Response:
{
  "success": true,
  "message": "Tracking fetched successfully",
  "data": {
    "status": "IN_TRANSIT"
  }
}

---

### 3. Cancel Order

POST /orders/:orderId/cancel

Request:
{
  "courier_partner": "dhl"
}

Response:
{
  "success": true,
  "message": "Order cancelled successfully",
  "data": {
    "status": "CANCELLED"
  }
}

---

## 📊 Data Models

Order:
- internalOrderId (UUID)
- clientOrderId
- courierPartner
- courierOrderId
- awbNumber
- status
- requestPayload
- responsePayload

TrackingHistory:
- internalOrderId
- courierPartner
- status
- rawPayload
- timestamp

---

## ⚠️ Error Format

{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": null
  }
}

---

## 🔧 Setup Instructions

1. Install dependencies:
npm install

2. Create .env file:
MONGO_URI=mongodb://localhost:27017/courier
API_KEY=your-secret-key
PORT=3000

3. Run server:
npm start

---

## 🧪 Health Check

GET /health

Response:
{
  "success": true,
  "message": "Server is running"
}




<!-- PORT=5000
MONGO_URI=mongodb://localhost:27017/courier-platform

NODE_ENV=development

REQUEST_TIMEOUT=10000
RETRY_COUNT=3
API_KEY=FDSVTJYTRH4RTEGREGVYTRHV45

URBANEBOLT_BASE_URL=https://uat.urbanebolt.in/api/v1
URBANEBOLT_USERNAME=info@urbanebolt.com
URBANEBOLT_PASSWORD=EKIcygsLVV5RCtPZ
URBANEBOLT_CUSTOMER_CODE=UEBCUS0008 -->