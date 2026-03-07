# Backend API Mapping for Case Management System

## 1. Overview

This document maps out all the backend API endpoints required to make the frontend operational, replacing all mock data with actual API calls. The system supports three user roles: Admin, Employee, and Customer, each with different permissions and access levels.

## 2. Architecture Overview

The backend follows a layered architecture:
- **API Layer**: RESTful endpoints with JSON request/response
- **Service Layer**: Business logic implementation
- **Data Access Layer**: Database operations
- **Authentication Layer**: JWT-based authentication and authorization

## 3. Authentication & Authorization

### 3.1 Authentication Endpoints

```
POST /api/auth/login
- Request: { email, password }
- Response: { success, token, refreshToken, user }
- Description: Authenticates user and returns JWT tokens

POST /api/auth/logout
- Request: { token }
- Response: { success, message }
- Description: Invalidates user session

GET /api/auth/me
- Headers: Authorization: Bearer <token>
- Response: { success, user }
- Description: Returns authenticated user information

POST /api/auth/refresh
- Request: { refreshToken }
- Response: { success, token, refreshToken }
- Description: Refreshes JWT access token

POST /api/auth/register (Admin only)
- Request: { email, name, role, password }
- Response: { success, user }
- Description: Creates a new user account
```

### 3.2 Authorization Requirements

All endpoints (except authentication) require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

Role-based access control:
- **Admin**: Full access to all endpoints
- **Employee**: Access to task, file, and customer-related endpoints
- **Customer**: Limited access to their own data only

### 3.3 Token Management

- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Tokens are stored in HTTP-only cookies for web clients
- Mobile clients receive tokens in response body

## 4. User Management

### 4.1 User Endpoints

```
GET /api/users
- Headers: Authorization: Bearer <token>
- Query Parameters: page, limit, search, role
- Response: { success, users: User[], pagination }
- Permissions: Admin only

GET /api/users/{id}
- Headers: Authorization: Bearer <token>
- Response: { success, user: User }
- Permissions: Admin, Self-access

POST /api/users
- Headers: Authorization: Bearer <token>
- Request: { email, name, role, password }
- Response: { success, user: User }
- Permissions: Admin only

PUT /api/users/{id}
- Headers: Authorization: Bearer <token>
- Request: { email, name, role }
- Response: { success, user: User }
- Permissions: Admin, Self-update (limited fields)

DELETE /api/users/{id}
- Headers: Authorization: Bearer <token>
- Response: { success, message }
- Permissions: Admin only

GET /api/users/profile
- Headers: Authorization: Bearer <token>
- Response: { success, user: User }
- Permissions: All authenticated users

PUT /api/users/profile
- Headers: Authorization: Bearer <token>
- Request: { name, email, avatar }
- Response: { success, user: User }
- Permissions: All authenticated users
```

### 4.2 User Data Model

```typescript
interface User {
  id: string
  email: string
  name: string
  role: "admin" | "employee" | "customer"
  avatar?: string
  createdAt: string
  updatedAt: string
  lastLogin?: string
}
```

## 5. Customer Management

### 5.1 Customer Endpoints

```
GET /api/customers
- Headers: Authorization: Bearer <token>
- Query Parameters: page, limit, search, status
- Response: { success, customers: Customer[], pagination }
- Permissions: Admin, Employee

GET /api/customers/{id}
- Headers: Authorization: Bearer <token>
- Response: { success, customer: Customer }
- Permissions: Admin, Employee, Customer (own data)

POST /api/customers
- Headers: Authorization: Bearer <token>
- Request: { name, email, phone, address, status }
- Response: { success, customer: Customer }
- Permissions: Admin

PUT /api/customers/{id}
- Headers: Authorization: Bearer <token>
- Request: { name, email, phone, address, status }
- Response: { success, customer: Customer }
- Permissions: Admin

DELETE /api/customers/{id}
- Headers: Authorization: Bearer <token>
- Response: { success, message }
- Permissions: Admin

GET /api/customers/{id}/services
- Headers: Authorization: Bearer <token>
- Response: { success, services: ServiceAssignment[] }
- Permissions: Admin, Employee, Customer (own data)

GET /api/customers/{id}/tasks
- Headers: Authorization: Bearer <token>
- Query Parameters: status, priority
- Response: { success, tasks: Task[] }
- Permissions: Admin, Employee, Customer (own data)

GET /api/customers/{id}/files
- Headers: Authorization: Bearer <token>
- Response: { success, files: BoxFile[] }
- Permissions: Admin, Employee, Customer (own data)

GET /api/customers/{id}/payments
- Headers: Authorization: Bearer <token>
- Response: { success, payments: Payment[] }
- Permissions: Admin, Employee, Customer (own data)

GET /api/customers/{id}/payment-history
- Headers: Authorization: Bearer <token>
- Response: { success, payments: Payment[] }
- Permissions: Admin, Employee, Customer (own data)
```

### 5.2 Customer Data Model

```typescript
interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  status: "active" | "inactive"
  createdAt: string
  updatedAt: string
  balance: number
  prepaymentBalance: number
  outstandingBalance: number
}
```

## 6. Service Management

### 6.1 Service Endpoints

```
GET /api/services
- Headers: Authorization: Bearer <token>
- Query Parameters: category, search, page, limit
- Response: { success, services: Service[], pagination }
- Permissions: All authenticated users

GET /api/services/{id}
- Headers: Authorization: Bearer <token>
- Response: { success, service: Service }
- Permissions: All authenticated users

POST /api/services
- Headers: Authorization: Bearer <token>
- Request: { name, description, category, price, requiresLicense, requiredFields, subtasks }
- Response: { success, service: Service }
- Permissions: Admin

PUT /api/services/{id}
- Headers: Authorization: Bearer <token>
- Request: { name, description, category, price, requiresLicense, requiredFields, subtasks }
- Response: { success, service: Service }
- Permissions: Admin

DELETE /api/services/{id}
- Headers: Authorization: Bearer <token>
- Response: { success, message }
- Permissions: Admin

GET /api/services/{id}/subscribed-customers
- Headers: Authorization: Bearer <token>
- Response: { success, customers: Customer[] }
- Permissions: Admin, Employee

GET /api/services/{id}/pending-customers
- Headers: Authorization: Bearer <token>
- Response: { success, customers: Customer[] }
- Permissions: Admin, Employee
```

### 6.2 Service Assignment Endpoints

```
GET /api/service-assignments
- Headers: Authorization: Bearer <token>
- Query Parameters: customerId, serviceId, status, page, limit
- Response: { success, assignments: ServiceAssignment[], pagination }
- Permissions: Admin, Employee, Customer (own assignments)

GET /api/service-assignments/{id}
- Headers: Authorization: Bearer <token>
- Response: { success, assignment: ServiceAssignment }
- Permissions: Admin, Employee, Customer (own assignments)

POST /api/service-assignments
- Headers: Authorization: Bearer <token>
- Request: { customerId, serviceId, customPrice, notes }
- Response: { success, assignment: ServiceAssignment }
- Permissions: Admin, Customer (own assignments)

PUT /api/service-assignments/{id}
- Headers: Authorization: Bearer <token>
- Request: { status, customPrice, notes }
- Response: { success, assignment: ServiceAssignment }
- Permissions: Admin

DELETE /api/service-assignments/{id}
- Headers: Authorization: Bearer <token>
- Response: { success, message }
- Permissions: Admin
```

### 6.3 Service Data Models

```typescript
interface Service {
  id: string
  name: string
  description: string
  price: number
  requiresLicense: boolean
  requiredFields?: string[]
  category: string
  createdAt: string
  updatedAt: string
  subtasks?: SubTask[]
}

interface ServiceAssignment {
  id: string
  customerId: string
  serviceId: string
  status: "pending" | "active" | "completed" | "cancelled"
  customPrice?: number
  notes?: string
  assignedDate: string
  startDate?: string
  endDate?: string
}
```

## 7. Task Management

### 7.1 Task Endpoints

```
GET /api/tasks
- Headers: Authorization: Bearer <token>
- Query Parameters: assignedTo, customerId, serviceId, status, priority, page, limit
- Response: { success, tasks: Task[], pagination }
- Permissions: Admin, Employee, Customer (own tasks)

GET /api/tasks/{id}
- Headers: Authorization: Bearer <token>
- Response: { success, task: Task }
- Permissions: Admin, Employee, Customer (own tasks)

POST /api/tasks
- Headers: Authorization: Bearer <token>
- Request: { title, description, customerId, serviceId, assignedTo, priority, dueDate }
- Response: { success, task: Task }
- Permissions: Admin, Employee

PUT /api/tasks/{id}
- Headers: Authorization: Bearer <token>
- Request: { title, description, customerId, serviceId, assignedTo, status, priority, dueDate }
- Response: { success, task: Task }
- Permissions: Admin, Employee

DELETE /api/tasks/{id}
- Headers: Authorization: Bearer <token>
- Response: { success, message }
- Permissions: Admin

PATCH /api/tasks/{id}/status
- Headers: Authorization: Bearer <token>
- Request: { status }
- Response: { success, task: Task }
- Permissions: Admin, Employee, Customer (own tasks with limited status changes)

PATCH /api/tasks/{id}/assign
- Headers: Authorization: Bearer <token>
- Request: { assignedTo }
- Response: { success, task: Task }
- Permissions: Admin, Employee

GET /api/tasks/{id}/subtasks
- Headers: Authorization: Bearer <token>
- Response: { success, subtasks: SubTask[] }
- Permissions: Admin, Employee, Customer (own tasks)

POST /api/tasks/{id}/subtasks
- Headers: Authorization: Bearer <token>
- Request: { title, assignedTo, requiresProof }
- Response: { success, subtask: SubTask }
- Permissions: Admin, Employee

PUT /api/tasks/{taskId}/subtasks/{subtaskId}
- Headers: Authorization: Bearer <token>
- Request: { title, assignedTo, requiresProof, completed }
- Response: { success, subtask: SubTask }
- Permissions: Admin, Employee

DELETE /api/tasks/{taskId}/subtasks/{subtaskId}
- Headers: Authorization: Bearer <token>
- Response: { success, message }
- Permissions: Admin

PATCH /api/tasks/{taskId}/subtasks/{subtaskId}/complete
- Headers: Authorization: Bearer <token>
- Request: { completed }
- Response: { success, subtask: SubTask }
- Permissions: Admin, Employee, Customer (own task subtasks)

POST /api/tasks/{taskId}/subtasks/{subtaskId}/proof
- Headers: Authorization: Bearer <token>
- Request: { files } (multipart/form-data)
- Response: { success, subtask: SubTask }
- Permissions: Admin, Employee, Customer (own task subtasks)
```

### 7.2 Task Data Models

```typescript
interface Task {
  id: string
  title: string
  description: string
  customerId: string
  serviceId: string
  assignedTo?: string
  status: "pending" | "in-progress" | "completed" | "cancelled"
  priority: "low" | "medium" | "high"
  dueDate: string
  createdAt: string
  updatedAt: string
  completedAt?: string
  subtasks: SubTask[]
  progress: number
  price?: number
}

interface SubTask {
  id: string
  title: string
  completed: boolean
  assignedTo: string
  requiresProof?: boolean
  proofFiles?: File[]
  additionalCost?: { amount: number, comment: string }
  createdAt: string
  updatedAt: string
}
```

## 8. File Management

### 8.1 File Endpoints

```
GET /api/files
- Headers: Authorization: Bearer <token>
- Query Parameters: customerId, taskId, search, type, page, limit
- Response: { success, files: BoxFile[], pagination }
- Permissions: Admin, Employee, Customer (own files)

GET /api/files/{id}
- Headers: Authorization: Bearer <token>
- Response: { success, file: BoxFile }
- Permissions: Admin, Employee, Customer (own files)

POST /api/files
- Headers: Authorization: Bearer <token>
- Request: { customerId, taskId, file } (multipart/form-data)
- Response: { success, file: BoxFile }
- Permissions: Admin, Employee

PUT /api/files/{id}
- Headers: Authorization: Bearer <token>
- Request: { name, customerId, taskId }
- Response: { success, file: BoxFile }
- Permissions: Admin

DELETE /api/files/{id}
- Headers: Authorization: Bearer <token>
- Response: { success, message }
- Permissions: Admin

GET /api/files/{id}/download
- Headers: Authorization: Bearer <token>
- Response: File stream
- Permissions: Admin, Employee, Customer (own files)

POST /api/files/{id}/delete-remark
- Headers: Authorization: Bearer <token>
- Request: { remark }
- Response: { success, message }
- Permissions: Admin
```

### 8.2 File Data Model

```typescript
interface BoxFile {
  id: string
  name: string
  type: string
  size: number
  customerId: string
  taskId?: string
  uploadedBy: string
  uploadedAt: string
  url: string
}
```

## 9. Financial Management

### 9.1 Payment Endpoints

```
GET /api/payments
- Headers: Authorization: Bearer <token>
- Query Parameters: customerId, type, startDate, endDate, page, limit
- Response: { success, payments: Payment[], pagination }
- Permissions: Admin, Employee

GET /api/payments/{id}
- Headers: Authorization: Bearer <token>
- Response: { success, payment: Payment }
- Permissions: Admin, Employee

POST /api/payments
- Headers: Authorization: Bearer <token>
- Request: { customerId, amount, notes, type, paymentMethod }
- Response: { success, payment: Payment }
- Permissions: Admin

PUT /api/payments/{id}
- Headers: Authorization: Bearer <token>
- Request: { amount, notes, type, paymentMethod }
- Response: { success, payment: Payment }
- Permissions: Admin

DELETE /api/payments/{id}
- Headers: Authorization: Bearer <token>
- Response: { success, message }
- Permissions: Admin
```

### 9.2 Balance Adjustment Endpoints

```
POST /api/balances/adjust
- Headers: Authorization: Bearer <token>
- Request: { customerId, amount, notes }
- Response: { success, adjustment: BalanceAdjustment }
- Permissions: Admin

GET /api/balances/history
- Headers: Authorization: Bearer <token>
- Query Parameters: customerId, page, limit
- Response: { success, adjustments: BalanceAdjustment[], pagination }
- Permissions: Admin, Employee, Customer (own history)
```

### 9.3 Financial Data Models

```typescript
interface Payment {
  id: string
  customerId: string
  date: string
  amount: number
  notes: string
  type: "payment" | "adjustment"
  paymentMethod?: "Transfer" | "Cash"
  createdAt: string
  updatedAt: string
}

interface BalanceAdjustment {
  id: string
  customerId: string
  amount: number
  notes: string
  createdAt: string
  createdBy: string
}
```

## 10. Reminder Management

### 10.1 Reminder Endpoints

```
GET /api/reminders
- Headers: Authorization: Bearer <token>
- Query Parameters: status, startDate, endDate, page, limit
- Response: { success, reminders: Reminder[], pagination }
- Permissions: Admin

GET /api/reminders/{id}
- Headers: Authorization: Bearer <token>
- Response: { success, reminder: Reminder }
- Permissions: Admin

POST /api/reminders
- Headers: Authorization: Bearer <token>
- Request: { title, description, scheduledTime, repeat }
- Response: { success, reminder: Reminder }
- Permissions: Admin

PUT /api/reminders/{id}
- Headers: Authorization: Bearer <token>
- Request: { title, description, scheduledTime, repeat, status }
- Response: { success, reminder: Reminder }
- Permissions: Admin

DELETE /api/reminders/{id}
- Headers: Authorization: Bearer <token>
- Response: { success, message }
- Permissions: Admin

PATCH /api/reminders/{id}/status
- Headers: Authorization: Bearer <token>
- Request: { status }
- Response: { success, reminder: Reminder }
- Permissions: Admin

PATCH /api/reminders/{id}/snooze
- Headers: Authorization: Bearer <token>
- Request: { snoozeUntil }
- Response: { success, reminder: Reminder }
- Permissions: Admin
```

### 10.2 Reminder Data Model

```typescript
interface Reminder {
  id: string
  title: string
  description: string
  adminId: string
  scheduledTime: string
  status: "pending" | "snoozed" | "done"
  snoozeUntil?: string
  repeat?: "none" | "daily" | "weekly" | "monthly"
  createdAt: string
  updatedAt: string
}
```

## 11. Notification Management

### 11.1 Notification Endpoints

```
GET /api/notifications
- Headers: Authorization: Bearer <token>
- Query Parameters: read, type, page, limit
- Response: { success, notifications: Notification[], pagination }
- Permissions: All authenticated users

GET /api/notifications/{id}
- Headers: Authorization: Bearer <token>
- Response: { success, notification: Notification }
- Permissions: Owner

POST /api/notifications
- Headers: Authorization: Bearer <token>
- Request: { userId, type, title, message }
- Response: { success, notification: Notification }
- Permissions: Admin

PUT /api/notifications/{id}
- Headers: Authorization: Bearer <token>
- Request: { read }
- Response: { success, notification: Notification }
- Permissions: Owner

DELETE /api/notifications/{id}
- Headers: Authorization: Bearer <token>
- Response: { success, message }
- Permissions: Owner

PATCH /api/notifications/mark-all-read
- Headers: Authorization: Bearer <token>
- Response: { success, message }
- Permissions: All authenticated users
```

### 11.2 Notification Data Model

```typescript
interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  timestamp: string
  read: boolean
}
```

## 12. Chat Support

### 12.1 Chat Endpoints

```
GET /api/chat/messages
- Headers: Authorization: Bearer <token>
- Query Parameters: customerId, employeeId, page, limit
- Response: { success, messages: ChatMessage[], pagination }
- Permissions: Admin, Employee, Customer (own conversations)

POST /api/chat/messages
- Headers: Authorization: Bearer <token>
- Request: { customerId, employeeId, message }
- Response: { success, message: ChatMessage }
- Permissions: Admin, Employee, Customer

PUT /api/chat/messages/{id}
- Headers: Authorization: Bearer <token>
- Request: { message }
- Response: { success, message: ChatMessage }
- Permissions: Sender

DELETE /api/chat/messages/{id}
- Headers: Authorization: Bearer <token>
- Response: { success, message }
- Permissions: Admin
```

### 12.2 Chat Data Model

```typescript
interface ChatMessage {
  id: string
  sender: "customer" | "employee" | "support"
  message: string
  timestamp: string
  read: boolean
}
```

## 13. Reporting & Analytics

### 13.1 Analytics Endpoints

```
GET /api/analytics/dashboard
- Headers: Authorization: Bearer <token>
- Response: { success, stats: DashboardStats }
- Permissions: Admin

GET /api/analytics/sales
- Headers: Authorization: Bearer <token>
- Query Parameters: startDate, endDate, period
- Response: { success, report: SalesReport }
- Permissions: Admin

GET /api/analytics/performance
- Headers: Authorization: Bearer <token>
- Query Parameters: startDate, endDate, employeeId
- Response: { success, report: PerformanceReport }
- Permissions: Admin
```

### 13.2 Reporting Data Models

```typescript
interface DashboardStats {
  totalCustomers: number
  activeServices: number
  pendingTasks: number
  totalFiles: number
  monthlyRevenue: number
  growthRate: number
}

interface SalesReport {
  totalRevenue: number
  revenueByService: { service: string, revenue: number }[]
  revenueByCustomer: { customer: string, revenue: number }[]
  monthlyTrend: { month: string, revenue: number }[]
}

interface PerformanceReport {
  employeePerformance: { employeeId: string, tasksCompleted: number, onTimeRate: number }[]
  serviceEfficiency: { serviceId: string, avgCompletionTime: number }[]
}
```

## 14. Implementation Details

### 14.1 Database Design

The system uses a relational database with the following main tables:
- users: Stores user accounts and authentication information
- customers: Customer information and financial data
- services: Service definitions and configurations
- service_assignments: Links between customers and services
- tasks: Task tracking and management
- subtasks: Breakdown of tasks into smaller components
- files: Document storage and metadata
- payments: Financial transactions
- balance_adjustments: Manual balance modifications
- reminders: Scheduled notifications
- notifications: System and user notifications
- chat_messages: Support conversation history

### 14.2 API Standards

All API endpoints follow RESTful principles:
- Use appropriate HTTP methods (GET, POST, PUT, DELETE, PATCH)
- Return consistent JSON responses
- Use proper HTTP status codes
- Implement proper error handling
- Include pagination for list endpoints
- Support filtering and sorting where appropriate

### 14.3 Security Implementation

- All API communications use HTTPS
- Passwords are hashed using bcrypt with 12 rounds
- JWT tokens are signed with RS256 algorithm
- File uploads are scanned for malware before storage
- Input validation prevents SQL injection and XSS attacks
- CORS policies restrict unauthorized domains
- Rate limiting prevents brute force and DoS attacks
- Role-based access control enforces permissions
- Sensitive data is encrypted at rest

### 14.4 File Storage

- Files are stored in cloud storage (AWS S3, Google Cloud Storage, or Azure Blob Storage)
- File metadata is stored in the database
- Files are organized in a hierarchical structure
- Access to files is controlled through the API
- Large file uploads support resumable uploads
- File versioning is implemented for important documents

### 14.5 Real-time Features

- WebSocket connections for real-time notifications
- WebSocket connections for chat functionality
- Server-sent events for dashboard updates
- Push notifications for mobile clients

## 15. Error Handling

All API responses follow a consistent format:
```json
{
  "success": boolean,
  "message": string,
  "data": object|array|null,
  "error": {
    "code": string,
    "message": string
  },
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "pages": number
  }
}
```

Common HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 422: Unprocessable Entity
- 429: Too Many Requests
- 500: Internal Server Error

## 16. Rate Limiting

API endpoints are rate-limited to prevent abuse:
- 100 requests per minute per IP for unauthenticated endpoints
- 1000 requests per minute per user for authenticated endpoints
- File upload endpoints: 10 requests per minute per user
- Login attempts: 5 attempts per hour per IP

## 17. Data Validation

All endpoints implement strict data validation:
- Required fields are enforced
- Data types are validated
- String lengths are checked
- Numeric ranges are validated
- Email formats are verified
- Date formats are validated
- Custom validation rules for business logic

## 18. Testing Strategy

### 18.1 Unit Testing
- Each service function is tested independently
- Mock database calls to isolate business logic
- Test edge cases and error conditions
- Achieve 80%+ code coverage

### 18.2 Integration Testing
- Test API endpoints with real database connections
- Validate request/response formats
- Test authentication and authorization
- Test file upload and download functionality

### 18.3 End-to-End Testing
- Simulate real user workflows
- Test role-based access controls
- Validate data consistency across operations
- Test error handling and recovery

## 19. Deployment Considerations

### 19.1 Environment Configuration
- Development, staging, and production environments
- Environment-specific configuration files
- Secure storage of secrets and API keys
- Database migration scripts

### 19.2 Scaling Strategy
- Horizontal scaling of API servers
- Database read replicas for reporting
- CDN for file delivery
- Load balancing for high availability

### 19.3 Monitoring and Logging
- Centralized logging system
- Performance monitoring
- Error tracking and alerting
- Database query performance monitoring