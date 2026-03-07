# Customer Management Backend Integration

## Overview
The customer management system has been successfully integrated with your backend APIs. The system now supports full CRUD operations for customers using your Django backend endpoints.

## Backend API Endpoints Used

### Customer Operations
- **GET** `http://localhost:8001/api/customers/list/?page=1&page_size=20` - Retrieve all customers
- **GET** `http://localhost:8001/api/customers/{id}` - Get customer details with payment history and box files
- **POST** `http://localhost:8001/api/customers/` - Create new customer
- **PATCH** `http://localhost:8001/api/customers/{id}/update/` - Update customer information
- **DELETE** `http://localhost:8001/api/customers/{id}/delete/` - Delete customer

## Features Implemented

### 1. Customer List View
- Displays all customers from your backend
- Shows customer information: name, email, phone, address, status, balance
- Search functionality to filter customers
- Loading states and error handling
- Action buttons: View, Edit, Delete

### 2. Customer Creation
- Form to create new customers with required fields:
  - Username (auto-generated from email)
  - Email address
  - Password
  - Name
  - Phone number
  - Address
- Validates required fields and password strength
- Sends data to your backend create endpoint

### 3. Customer Details View
- Displays comprehensive customer information
- Shows payment history from your backend
- Displays box files and documents
- Organized in tabs: Personal, Financial, Files, Activity, Settings

### 4. Customer Editing
- Update customer information
- Maintains existing data while allowing modifications
- Uses PATCH method to update specific fields

### 5. Customer Deletion
- Confirmation dialog before deletion
- Removes customer from backend database
- Success/error feedback

## Data Transformation

The system automatically transforms data between your backend format and the frontend interface:

### Backend to Frontend
```javascript
// Backend response format
{
  "id": 2,
  "name": "Customer Name",
  "email": "customer@example.com",
  "phone": "+1234567890",
  "address": "Customer Address",
  "status": "active",
  "balance": "-5048.00",
  "createdAt": "2025-09-17T11:16:03.583866Z",
  "paymentHistory": [...],
  "boxFiles": [...]
}

// Transformed to frontend format
{
  id: "2",
  name: "Customer Name",
  email: "customer@example.com",
  phone: "+1234567890",
  address: "Customer Address",
  status: "active",
  balance: -5048.00,
  prepaymentBalance: -5048.00,
  createdAt: "2025-09-17T11:16:03.583866Z",
  paymentHistory: [...],
  boxFiles: [...]
}
```

### Frontend to Backend
```javascript
// Frontend form data
{
  name: "Customer Name",
  email: "customer@example.com",
  phone: "+1234567890",
  address: "Customer Address"
}

// Transformed for backend create
{
  username: "customer",
  email: "customer@example.com",
  password: "StrongPass!23",
  name: "Customer Name",
  phone: "+1234567890",
  address: "Customer Address"
}
```

## Error Handling

The system includes comprehensive error handling:
- Network errors
- Authentication failures
- Backend validation errors
- Loading states
- User-friendly error messages

## Success/Error Feedback

- Success messages for successful operations
- Error messages for failed operations
- Auto-dismissing notifications (3 seconds)
- Visual feedback with color-coded messages

## Usage Instructions

1. **Access Customer Management**: Navigate to the admin dashboard and click on "Customers"

2. **View Customers**: The customer list loads automatically from your backend

3. **Add Customer**: Click "Add Customer" button, fill the form, and submit

4. **Edit Customer**: Click "Edit" button on any customer card

5. **View Details**: Click "View" button to see full customer information including payment history and files

6. **Delete Customer**: Click "Delete" button and confirm the action

## Authentication

The system uses JWT tokens for authentication. Make sure your backend is running and accessible at `http://localhost:8001`.

## File Structure

```
components/customers/
├── customer-management.tsx    # Main management component
├── customer-list.tsx          # Customer list view
├── customer-form.tsx          # Create/edit form
└── customer-details.tsx       # Detailed customer view

lib/
└── api.ts                     # API configuration and endpoints
```

## Next Steps

1. Test the integration with your running backend
2. Verify all CRUD operations work correctly
3. Check that payment history and box files display properly
4. Test error scenarios (network issues, invalid data, etc.)
5. Customize the UI styling if needed

The customer management system is now fully integrated with your backend and ready for use!
