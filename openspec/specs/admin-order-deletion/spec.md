# Admin Order Deletion Specification

## Purpose
Allow administrators to permanently remove customer orders from the database, ensuring stock reconciliation is executed during deletion.

## Requirements

### Requirement: Order Deletion with Double Check
The system MUST support order deletion only after explicit double confirmation from the administrator.

#### Scenario: Deleting Active Order and Reconciling Stock
- GIVEN an order in PENDING, CONFIRMED, PROCESSING, or SHIPPED status
- WHEN the administrator clicks delete and confirms the action
- THEN the system MUST restore the stock values for all order items back to their product variants
- AND permanently delete the order and its items from the database.

#### Scenario: Deleting Cancelled Order
- GIVEN an order in CANCELLED status
- WHEN the administrator clicks delete and confirms the action
- THEN the system MUST delete the order and its items
- AND MUST NOT modify stock values (as stock was already restored when cancelled).
