/**
 * Registration Workflow:
 * 1. Pre-load everything. Landing page shows a loading icon while invoicing options are fetched in the background. Always show a sign in link in upper right for skipping loading. 
 * 2. After load, show 2 options (Sign Up $65/mo) (Sign In). Add an asterisk after 65/mo to mention discounts. Select with all the other membership options. Promotions should be 
 * 3. On click, navigate to basic info: Name, Email, Password
 * 4. After that, ask for phone and address
 * 5. Then show them the subscription they've clicked and offer a button to apply discount - make sure this works for the future work discount. Maybe discount codes?
 * 6. Proceed to document signatures. Can we collapse the two of them and ask for checkbox click and e-sign?
 * 7. Payment methods are next. No one will have a payment method so don't use a modal. Show the options in the payment methods space. This is where folks should ack recurring payment
 * 8. Last, show a review and ask them to "Submit Payment"
 * 9. Show a toast notification w/ a link to the receipt and then redirect to their profile page. Slack sign up message should include link for admins to profile
 */