# Financial Manager Component - Documentation

## Overview
The Financial Manager is a dedicated admin sub-page for managing customer finances, payments, and balances. It provides a comprehensive view of financial data across all customers with tools for recording payments and adjusting balances.

## Features Implemented
- Customer financial status table with name, email, phone, and outstanding balance
- Payment history viewing for each customer
- Record new payments for customers
- Adjust customer outstanding balances
- Filter and search customers by name, email, or financial status
- Sort customers by name or outstanding balance
- Financial summary dashboard with key metrics

## Component Structure
```
FinancialManager
├── Summary Cards (Total Outstanding, Payments Last 30 Days, Total Customers)
├── Controls (Search, Filters, Sort)
├── Customer Financial Status Table
├── Payment History Modal
├── Record Payment Modal
└── Adjust Balance Modal
```

## Data Flow
1. **Data Sources**: Pulls data from mockCustomers
2. **Calculations**: 
   - Total outstanding balance across all customers
   - Total payments received in the last 30 days
3. **Display**: Data is filtered and sorted based on user controls

## Key Functions
1. **Customer Financial Status**
   - Displays customer name, email, phone, and outstanding balance
   - Color-coded balances (red for outstanding, green for clear)

2. **Payment History**
   - View detailed payment history for each customer
   - See payment dates, amounts, types, and notes
   - Distinguish between payments and adjustments

3. **Payment Recording**
   - Record new payments for customers
   - Add notes about payments
   - Specify payment type (payment or adjustment)

4. **Balance Adjustment**
   - Adjust customer outstanding balances
   - Add notes about adjustments
   - Positive values add to balance, negative values subtract

5. **Filtering and Sorting**
   - Search customers by name or email
   - Filter by financial status (all, outstanding, clear)
   - Sort by name or outstanding balance

6. **Financial Summary**
   - Total outstanding balance across all customers
   - Total payments received in the last 30 days
   - Total number of active customers

## Technical Implementation
- Built with React and TypeScript
- Uses Tailwind CSS and shadcn UI components
- Designed for integration with Django REST API backend
- Modular structure for future extensions
- Performance optimized with useMemo hooks

## Usage
1. Admin clicks "Financial Manager" in the sidebar
2. Admin views the list of customers with their financial status
3. Admin can search/filter/sort the customer list
4. Admin clicks "History" to view payment history for a customer
5. Admin clicks "Payment" to record a new payment
6. Admin clicks "Adjust" to adjust a customer's balance
7. Admin views financial summary at the top of the page