# Admin Notifications Specification

## Purpose
Provide store administrators with real-time notifications about recent orders, new user registrations, and product variants with low inventory levels.

## Requirements

### Requirement: Dynamic Admin Notifications
The system MUST generate and compile notifications based on real database records.

#### Scenario: Compiling Alerts
- GIVEN new orders are processed, users register, or stock levels fall below 6 units
- WHEN the administrator opens or reloads the dashboard
- THEN the system MUST display notifications for these events
- AND notifications MUST be formatted with descriptive text and relative time information (e.g., "Hace 5 minutos").

#### Scenario: Dismissing Notifications
- GIVEN the administrator has active notifications
- WHEN they click "Marcar todas como leídas"
- THEN the system MUST hide all current notifications
- AND those notifications MUST NOT reappear in subsequent reloads.
