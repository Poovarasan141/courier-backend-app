# 🏗️ Courier Aggregation System Design

---

## 📌 Overview

This system is a Courier Aggregation Layer that unifies multiple courier partners (DHL, Delhivery, etc.) into a single API interface for:

- Order creation
- Tracking shipments
- Cancelling orders
- Tracking history storage

---

## 🎯 Goals

- Unified courier abstraction
- Easy addition of new courier partners
- Reliable tracking system
- Idempotent order creation
- Secure API access

---

## 🧱 Architecture

Client
  ↓
Express API Layer
  ↓
Middleware Layer (Auth + Validation)
  ↓
Controller Layer
  ↓
Courier Factory (Switch-based routing)
  ↓
Courier Partner APIs (DHL, Delhivery)
  ↓
MongoDB (Orders + TrackingHistory)

---

## 🔁 Request Flow

Create Order:
Client → API → Validation → Controller → Courier Factory → Partner API → DB → Response

Track Order:
Client → API → Controller → DB → Courier API → Update DB → Response

Cancel Order:
Client → API → Controller → DB → Courier API → Update DB → TrackingHistory → Response

---

## 🧩 Core Modules

### Controller Layer
Handles business logic:
- createOrder
- trackOrder
- cancelOrder

---

### Courier Factory
Switch-based implementation:
getCourierPartner("dhl") → DHL implementation

Each courier supports:
- createOrder()
- trackOrder()
- cancelOrder()

---

### Middleware Layer
- authMiddleware → API key validation
- validationMiddleware → Joi validation
- errorMiddleware → centralized error handling

---

### Database Layer

Orders Collection:
- internalOrderId
- clientOrderId
- courierOrderId
- status
- requestPayload
- responsePayload

TrackingHistory Collection:
- internalOrderId
- courierPartner
- status updates
- raw responses
- timestamps

---

## 🔐 Security Design

- API Key authentication (x-api-key)
- Joi validation for input
- Centralized error handling
- No direct courier exposure to client

---

## 📦 Idempotency Strategy

clientOrderId (order_id) is used to prevent duplicates

Flow:
- If order exists → return existing order
- Else → create new order

---

## 📊 Order Status Flow

CREATED
↓
IN_TRANSIT
↓
DELIVERED
OR
CANCELLED
OR
FAILED

---

## ⚠️ Failure Handling

- Courier failure → status = FAILED
- Error stored in responsePayload
- Logged using logger utility
- Safe fallback response ensured

---

## 📈 Future Enhancements

- Redis caching for tracking
- Kafka event streaming for status updates
- Circuit breaker for courier APIs
- Multi-courier fallback routing
- Webhook-based updates

---

## 🧠 Design Principles

- Factory Pattern
- Controller separation
- Stateless API design
- Idempotent operations
- Modular architecture

---

## 🚀 Summary

This system is:

✔ Extensible  
✔ Modular  
✔ Courier-agnostic  
✔ Production-ready base architecture  