# Admin Orders Specification

## Purpose
Provide the store administrator with a dedicated portal to view customer orders, search/filter, view details, and update the status for logistics tracking.

## Requirements

### Requirement: Admin Orders Management
The system MUST provide a secure dashboard for store administrators to manage customer orders.

#### Scenario: Listing and Filtering Orders
- GIVEN an administrator is logged into the admin panel
- WHEN they navigate to `/admin/orders`
- THEN the system MUST display a paginated list of all customer orders
- AND the administrator MUST be able to filter orders by status
- AND search orders by order number, customer name, or email.

#### Scenario: View Order Details and Update Status
- GIVEN an administrator is on the orders list page
- WHEN they click on an order to view its details at `/admin/orders/[id]`
- THEN the system MUST display the customer's name, email, phone, shipping address, notes, order items, prices, total, and payment method
- AND the administrator MUST be able to update the order status to any of the valid statuses (e.g. PROCESSING, SHIPPED, DELIVERED, CANCELLED)
- AND updating status to CANCELLED MUST restore stock to the corresponding product variants.
