# Payments Specification

## Purpose
This specification defines the behavior for processing customer payments inside the checkout flow using the Culqi Checkout Custom inline modal.

## Requirements

### Requirement: Modal Loading and Triggering
The system MUST load the Culqi JS v4 library on the checkout page and render the Culqi modal inline when the user chooses `CARD` or `WALLET` payment methods.

#### Scenario: Open Culqi Modal
- GIVEN a customer on the confirm step of the checkout page with CARD or WALLET selected
- WHEN the customer clicks the pay button
- THEN the system MUST create the order in the database, receive the Culqi `order_id`, initialize `CulqiCheckout`, and open the inline payment modal

---

### Requirement: Card Payment Processing
For credit/debit card payments, the system MUST capture the generated payment token from the client, submit it to the backend `/api/checkout/charge` endpoint, perform the charge using Culqi's private key, and redirect the user to the success page on completion.

#### Scenario: Successful Card Payment
- GIVEN the Culqi modal is open and the customer inputs valid card details
- WHEN the customer submits the payment and Culqi generates a token ID
- THEN the system MUST send the token to `/api/checkout/charge`, charge the card, and redirect the user to `/checkout/success` with the order number

---

### Requirement: Wallet (Yape) Payment Processing
For wallet payments (Yape/Plin), the system MUST allow the user to complete the flow within the Culqi modal, close the modal on completion, and redirect the user to the success page. The final order status MUST be updated asynchronously via the Culqi Webhook.

#### Scenario: Successful Yape Payment
- GIVEN the Culqi modal is open and Yape is selected
- WHEN the customer completes the Yape flow within the modal
- THEN the modal MUST close, redirect the customer to `/checkout/success` with the order number, and the order status MUST be updated by the webhook in the background
