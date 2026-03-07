# Financial Manager Usage Guide

## Overview
The Financial Manager is a comprehensive admin tool for managing customer finances, payments, and balances. This guide explains how to use all features of the component.

## User Flow

### 1. Accessing the Financial Manager
1. Log in to the admin dashboard
2. Click on "Financial Manager" in the sidebar navigation
3. The financial dashboard will load showing customer financial status and summary metrics

### 2. Viewing Customer Financial Status
- The main table displays all customers with their:
  - Name
  - Email
  - Phone
  - Outstanding Balance (color-coded: red for outstanding, green for clear)
- Customers can be sorted by clicking column headers
- Use the search bar to find customers by name or email
- Use the filter dropdown to show only customers with outstanding balances or clear accounts

### 3. Viewing Payment History
1. Find the customer in the table
2. Click the "History" button in the Actions column
3. A modal will open showing:
   - Customer details (email, phone, current balance)
   - Complete payment history with dates, amounts, types, and notes
   - Color-coded payment types (green for payments, blue for adjustments)

### 4. Recording a Payment
1. Find the customer in the table
2. Click the "Payment" button in the Actions column
3. In the modal, enter:
   - Amount (positive number)
   - Type (Payment or Adjustment)
   - Notes (optional description)
4. Click "Record Payment" to save
5. The customer's balance will update immediately

### 5. Adjusting a Customer's Balance
1. Find the customer in the table
2. Click the "Adjust" button in the Actions column
3. In the modal, enter:
   - Amount (positive to add to balance, negative to subtract)
   - Notes (required reason for adjustment)
4. Click "Adjust Balance" to save
5. The customer's balance will update immediately

## Financial Summary Dashboard
The dashboard shows key financial metrics at the top:
- **Total Outstanding**: Sum of all customer outstanding balances
- **Payments (30 days)**: Total payments received in the last 30 days
- **Total Customers**: Number of active customers in the system

## Sorting and Filtering
- **Search**: Type in the search box to filter customers by name or email
- **Status Filter**: 
  - "All Status" - Show all customers
  - "Outstanding" - Show only customers with balances owed
  - "Clear" - Show only customers with zero or negative balances
- **Sort By**:
  - "Sort by Name" - Alphabetical order
  - "Sort by Balance" - Highest balances first

## Best Practices
1. **Regular Monitoring**: Check the dashboard regularly to monitor financial health
2. **Payment Recording**: Record payments immediately when received to keep balances accurate
3. **Balance Adjustments**: Use adjustments sparingly and always include detailed notes
4. **Customer Communication**: Use payment history to inform customer communications about their account status

## Troubleshooting
- If customer balances don't update immediately, refresh the page
- If you can't find a customer, try clearing the search filter
- For issues with payment recording, check that all required fields are filled

## Technical Notes
- All data is currently mocked for demonstration purposes
- In a production environment, this component would connect to a Django REST API
- API endpoints are documented in [api-documentation.md](./api-documentation.md)