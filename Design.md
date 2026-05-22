# Design Overview

## Architecture

The application follows a modular architecture where controllers are decoupled from courier-specific implementations.

The system is designed so that new courier providers can be added with minimal changes to the core application.

High-level flow:

```txt
Client Request
      ↓
Controller
      ↓
Courier Factory
      ↓
Courier Partner
      ↓
Database
      ↓
Response
```

---

## Design Pattern Used

### Factory Pattern

A factory pattern is used to dynamically select courier partners.

File:

```txt
src/courier/index.js
```

Based on the `courier_partner` value, the appropriate courier implementation is returned.

Example:

```js
const CourierPartner =
  getCourierPartner(
    courier_partner
  );

await CourierPartner.createOrder(
  payload
);
```

### Why Factory Pattern?

The factory pattern was chosen for the following reasons:

1. Controllers remain independent of courier-specific logic.
2. New courier integrations can be added with minimal code changes.
3. A common function contract is maintained across courier partners.
4. Courier-specific implementation details remain isolated.

Each courier implementation exposes the same methods:

```js
createOrder()
trackOrder()
cancelOrder()
```

This ensures consistency across integrations.

---

## Database Design

### Order Collection

Stores shipment-level information.

| Field | Description |
|--------|-------------|
| internalOrderId | Internal unique identifier |
| clientOrderId | Consumer-provided order id |
| courierPartner | Selected courier partner |
| courierOrderId | Courier-generated order id |
| awbNumber | Tracking number |
| status | Shipment status |
| requestPayload | Incoming payload |
| responsePayload | Courier response |

Indexes:

- `internalOrderId`
- `clientOrderId`

Purpose:

- Idempotency handling
- Shipment lookup
- Tracking and cancellation

---

### TrackingHistory Collection

Stores shipment tracking history.

| Field | Description |
|--------|-------------|
| internalOrderId | Internal order reference |
| courierPartner | Courier provider |
| status | Shipment status |
| rawPayload | Courier response payload |

Indexes:

- `internalOrderId`
- `trackedAt`

Purpose:

- Tracking history
- Auditing
- Shipment status timeline

---

## Validation Strategy

Joi validation is used to validate incoming request payloads before processing.

Invalid requests return HTTP 400 with field-level validation errors.

Example:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "customer_name",
      "message": "\"customer_name\" is required"
    }
  ]
}
```

---

## Error Handling

A centralized error handler is used to maintain consistent API responses.

Example:

```json
{
  "success": false,
  "message": "Failed to create shipment"
}
```

---

## Trade-offs

### Why No Service Layer?

A separate service layer was intentionally avoided to keep the solution simple and maintainable for the current scope.

Since the business logic is limited, controller-level orchestration was considered sufficient.

A service layer can be introduced later if the application grows.

### Why MongoDB?

MongoDB was selected due to its flexible schema support for courier request and response payloads.

Different courier providers may return different response structures, and MongoDB makes storing raw payloads easier.

---

## Future Improvements

- Multiple courier integrations
- Webhook support
- Retry strategy for courier APIs
- Rate limiting
- Better shipment status normalization