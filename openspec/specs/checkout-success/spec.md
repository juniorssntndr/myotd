# Checkout Success Specification

## Purpose
Ensure successful checkout payments cleanly transition to the success page and clear the cart, without race-condition redirects.

## Requirements

### Requirement: Clean Success Redirection
The system MUST complete checkout processing and redirect the customer to `/checkout/success?order=ORDER_NUMBER` after successful payment, ensuring the cart is cleared only on the success page mount.

#### Scenario: Credit Card Payment Success
- GIVEN a cart with items
- WHEN the user completes the Culqi card checkout payment successfully
- THEN the system MUST process the charge and redirect to `/checkout/success?order=ORDER_NUMBER`
- AND the cart MUST be empty on the success page.

#### Scenario: Direct Access Prevention
- GIVEN a user tries to access `/checkout` with no items in their cart
- WHEN the checkout page initially mounts
- THEN the system MUST redirect the user to `/cart`.
