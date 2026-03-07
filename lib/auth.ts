import { authApi } from "./api"

export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "employee" | "customer"
  avatar?: string
  employee_id?: number
  customer_id?: number
  branch_id?: number
}

// Auth state management with local persistence
let currentUser: User | null = null
let authToken: string | null = null
let refreshToken: string | null = null

// Initialize from localStorage if on client
if (typeof window !== "undefined") {
  const savedUser = localStorage.getItem("cm_user")
  if (savedUser) {
    try {
      currentUser = JSON.parse(savedUser)
    } catch (e) {
      console.error("Failed to parse saved user")
    }
  }
  authToken = localStorage.getItem("cm_token")
  refreshToken = localStorage.getItem("cm_refresh_token")
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  status: "active" | "inactive"
  balance: number
  createdAt: string
  prepaymentBalance?: number
  outstandingBalance?: number
  paymentHistory?: Payment[]
  website?: string
  boxFiles?: BoxFile[] // Added to match your backend structure
  username?: string // Added for backend integration
  dueDate?: string // Added for service subscription due dates
}

// Added BoxFile and Document interfaces to match your backend structure
export interface BoxFile {
  id: string
  name?: string // For existing mock data
  label?: string // For backend data
  reference_code?: string // For backend data
  description?: string // For backend data
  status?: string // Made optional to accommodate mock data
  created_at?: string // For backend data
  uploadedAt?: string // For mock data
  customerId: string
  taskId?: string
  uploadedBy?: string // For mock data
  customer?: number // For backend data
  customer_name?: string // For backend data
  documents?: Document[] // For backend data
  transactions?: any[] // For backend data
  type?: string // For mock data
  size?: number // For mock data
  url?: string // For mock data
  current_holder?: string | null // For backend data
  last_checked_out_at?: string | null // For backend data
  last_checked_in_at?: string | null // For backend data
}

export interface Document {
  id: string
  name: string
  file: string
  uploaded_at: string
  status: string
  current_holder: string | null
  last_checked_out_at: string | null
  last_checked_in_at: string | null
  transactions: any[]
}

export interface Payment {
  id: string
  date: string
  amount: number
  notes: string
  type: "payment" | "adjustment" | "charge"
  paymentMethod?: "Transfer" | "Cash" | null
}

export interface Service {
  id: string
  name: string
  description: string
  price: number
  requiresLicense: boolean
  requiredFields?: string[] // New field for required fields
  requires_document?: boolean
  category: string
  subscribedCustomers?: Customer[]
  pendingCustomers?: Customer[]
  subtasks?: SubTask[]
  // Added fields to match backend response structure
  subscribed_customers?: Array<{ name: string, dueDate: string }>
  pending_customers?: string[]
  status?: string
  recurrence_days?: number
  subtask_templates?: Array<{
    id: number
    title: string
    description: string
    requires_proof: boolean
  }>
}

export interface Task {
  id: string
  title: string
  description: string
  customerId: string
  serviceId: string
  assignedTo?: string
  status: "pending" | "in-progress" | "completed" | "cancelled"
  priority: "low" | "medium" | "high" | number // Updated to accommodate number priority from backend
  dueDate: string
  createdAt: string
  updatedAt?: string // Added for backend response
  completedAt?: string
  subtasks: SubTask[]
  progress: number
  price?: number
  base_price?: string // Added for backend response
  customer?: { // Added for backend response
    id: number
    name: string
    email: string
  }
  service?: { // Added for backend response
    id: number
    name: string
    category: string
  }
  customer_name?: string // Added for list view
  service_name?: string // Added for list view
  assigned_to?: {
    id: number
    name: string
    role: string
  }
}

export interface ProofFile {
  id: number;
  file: string; // URL
  original_name: string;
  uploaded_at: string;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  assignedTo: string;    //It is better if this doesn't exist
  requiresProof?: boolean;
  proofFiles?: ProofFile[];
  additionalCost?: { amount: number; comment: string };
  description?: string;  // Added to match the actual usage
}

export interface Notification {
  id: string
  type: string
  title: string
  message: string
  timestamp: string
  read: boolean
}

export interface Reminder {
  id: string
  title: string
  description: string
  adminId: string
  scheduledTime: string
  status: "pending" | "snoozed" | "done"
  snoozeUntil?: string
  repeat?: "none" | "daily" | "weekly" | "monthly"
  createdAt: string
}

// Mock data
export const mockUsers: User[] = [
  { id: "1", email: "admin@company.com", name: "Admin User", role: "admin" },
  { id: "2", email: "employee@company.com", name: "John Employee", role: "employee" },
  { id: "3", email: "customer@example.com", name: "Jane Customer", role: "customer" },
]

export const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "Acme Corporation",
    email: "contact@acme.com",
    phone: "+1-555-0123",
    address: "123 Business St, City, State 12345",
    status: "active",
    createdAt: "2024-01-15",
    balance: 0.0,
    website: "https://www.acmecorp.com",
    paymentHistory: []
  },
  {
    id: "2",
    name: "Tech Solutions Inc",
    email: "info@techsolutions.com",
    phone: "+1-555-0456",
    address: "456 Innovation Ave, Tech City, TC 67890",
    status: "active",
    createdAt: "2024-02-20",
    balance: 1200.0,
    website: "https://www.techsolutions.com",
    paymentHistory: []
  },
  {
    id: "3",
    name: "Global Logistics",
    email: "shipping@global.com",
    phone: "+1-555-0789",
    address: "789 Port Rd, Logistics Hub, LH 45678",
    status: "active",
    createdAt: "2024-03-05",
    balance: -2500.0,
    website: "https://www.globallogistics.com",
    paymentHistory: []
  },
]

const mockProofFile = (name: string): ProofFile => {
  return {
    id: Math.floor(Math.random() * 1000),
    file: `/files/${name}`,
    original_name: name,
    uploaded_at: new Date().toISOString(),
  };
}

export const mockServices: Service[] = [
  {
    id: "1",
    name: "Website Development",
    description: "Custom website development and design",
    price: 2500.0,
    requiresLicense: false,
    requiredFields: ["technicalRequirements", "designPreferences", "targetAudience"], // Added required fields
    category: "Development",
    subscribedCustomers: [
      {
        id: "1",
        name: "Acme Corporation",
        email: "contact@acme.com",
        phone: "+1-555-0123",
        address: "123 Business St, City, State 12345",
        status: "active",
        createdAt: "2024-01-15",
        balance: 2500.0,
      },
    ],
    pendingCustomers: [
      {
        id: "2",
        name: "Tech Solutions Inc",
        email: "info@techsolutions.com",
        phone: "+1-555-0456",
        address: "456 Innovation Ave, Tech City, TC 67890",
        status: "active",
        createdAt: "2024-02-20",
        balance: 1200.0,
      },
    ],
    subtasks: [
      { id: "1", title: "Design mockups", completed: true, assignedTo: "2", requiresProof: true, proofFiles: [mockProofFile("mockup1.png")], additionalCost: { amount: 120, comment: "Stock images" } },
      { id: "2", title: "Frontend development", completed: false, assignedTo: "2", requiresProof: false },
      { id: "3", title: "Backend integration", completed: false, assignedTo: "2", requiresProof: true, proofFiles: [mockProofFile("api-spec.pdf")] }
    ],
  },
  {
    id: "2",
    name: "Software Licensing",
    description: "Annual software license management",
    price: 500.0,
    requiresLicense: true,
    requiredFields: ["licenseType", "numberOfUsers", "organizationDetails"], // Added required fields
    category: "Licensing",
    subscribedCustomers: [
      {
        id: "2",
        name: "Tech Solutions Inc",
        email: "info@techsolutions.com",
        phone: "+1-555-0456",
        address: "456 Innovation Ave, Tech City, TC 67890",
        status: "active",
        createdAt: "2024-02-20",
        balance: 1200.0,
      },
    ],
    pendingCustomers: [],
    subtasks: [
      { id: "4", title: "Contact vendor", completed: false, assignedTo: "1", requiresProof: true, proofFiles: [mockProofFile("vendor-email.pdf")] },
      { id: "5", title: "Renew license", completed: false, assignedTo: "1", requiresProof: false },
      { id: "6", title: "Collect documents", completed: true, assignedTo: "1", requiresProof: true, proofFiles: [mockProofFile("passport.pdf")], additionalCost: { amount: 30, comment: "Document printing" } }
    ],
  },
  {
    id: "3",
    name: "Digital Marketing",
    description: "Comprehensive digital marketing strategy and implementation",
    price: 1800.0,
    requiresLicense: false,
    requiredFields: ["marketingGoals", "targetDemographics", "budgetAllocation"], // Added required fields
    category: "Marketing",
    subscribedCustomers: [],
    pendingCustomers: [],
    subtasks: [
      { id: "7", title: "SEO audit", completed: false, assignedTo: "2", requiresProof: true },
      { id: "8", title: "Social media setup", completed: false, assignedTo: "2", requiresProof: false },
      { id: "9", title: "Content strategy", completed: false, assignedTo: "2", requiresProof: true }
    ],
  },
  {
    id: "4",
    name: "Cloud Hosting",
    description: "Reliable cloud hosting with 99.9% uptime guarantee",
    price: 299.0,
    requiresLicense: false,
    requiredFields: ["serverSpecifications", "storageRequirements", "securityPreferences"], // Added required fields
    category: "Hosting",
    subscribedCustomers: [],
    pendingCustomers: [],
    subtasks: [
      { id: "10", title: "Server setup", completed: false, assignedTo: "1", requiresProof: false },
      { id: "11", title: "Domain configuration", completed: false, assignedTo: "1", requiresProof: false },
      { id: "12", title: "SSL certificate", completed: false, assignedTo: "1", requiresProof: true }
    ],
  },
  {
    id: "5",
    name: "Mobile App Development",
    description: "Native iOS and Android app development",
    price: 4500.0,
    requiresLicense: false,
    requiredFields: ["appFunctionality", "platformPreferences", "designRequirements"], // Added required fields
    category: "Development",
    subscribedCustomers: [],
    pendingCustomers: [],
    subtasks: [
      { id: "13", title: "UI/UX design", completed: false, assignedTo: "2", requiresProof: true },
      { id: "14", title: "iOS development", completed: false, assignedTo: "2", requiresProof: false },
      { id: "15", title: "Android development", completed: false, assignedTo: "2", requiresProof: false },
      { id: "16", title: "App store submission", completed: false, assignedTo: "2", requiresProof: true }
    ],
  },
  {
    id: "6",
    name: "IT Consulting",
    description: "Strategic IT consulting and technology roadmap planning",
    price: 350.0,
    requiresLicense: false,
    requiredFields: ["businessObjectives", "currentInfrastructure", "budgetConstraints"], // Added required fields
    category: "Consulting",
    subscribedCustomers: [],
    pendingCustomers: [],
    subtasks: [
      { id: "17", title: "Current state assessment", completed: false, assignedTo: "1", requiresProof: true },
      { id: "18", title: "Technology roadmap", completed: false, assignedTo: "1", requiresProof: true }
    ],
  }
]

export const mockTasks: Task[] = [
  {
    id: "1",
    title: "Website Redesign Project",
    description: "Complete redesign of company website with modern UI/UX",
    customerId: "1",
    serviceId: "1",
    assignedTo: "2", // Employee
    status: "in-progress",
    priority: "high",
    dueDate: "2024-03-15",
    createdAt: "2024-02-01",
    progress: 65,
    subtasks: [
      { id: "1", title: "Design mockups", completed: true, assignedTo: "2", requiresProof: true, proofFiles: [mockProofFile("mockup1.png"), mockProofFile("mockup2.png")], additionalCost: { amount: 120, comment: "Stock images" } },
      { id: "2", title: "Frontend development", completed: false, assignedTo: "2", requiresProof: false },
      { id: "3", title: "Backend integration", completed: false, assignedTo: "2", requiresProof: true }, // No proof files - should be blocked
      { id: "3b", title: "Testing and QA", completed: false, assignedTo: "2", requiresProof: true }, // New subtask requiring proof
    ],
  },
  {
    id: "2",
    title: "License Renewal",
    description: "Renew software licenses for Tech Solutions Inc.",
    customerId: "2",
    serviceId: "2",
    assignedTo: "1", // Admin
    status: "pending",
    priority: "medium",
    dueDate: "2024-09-20",
    createdAt: "2024-09-01",
    progress: 0,
    subtasks: [
      { id: "4", title: "Contact vendor", completed: false, assignedTo: "1", requiresProof: true }, // No proof files - should be blocked
      { id: "5", title: "Review contracts", completed: false, assignedTo: "1", requiresProof: false, additionalCost: { amount: 75, comment: "Legal review" } },
    ],
  },
  {
    id: "3",
    title: "Customer Onboarding",
    description: "Onboard new customer for website development.",
    customerId: "1",
    serviceId: "1",
    assignedTo: "1", // Admin
    status: "in-progress",
    priority: "high",
    dueDate: "2024-09-10",
    createdAt: "2024-08-25",
    progress: 40,
    subtasks: [
      { id: "6", title: "Collect documents", completed: true, assignedTo: "1", requiresProof: true, proofFiles: [mockProofFile("passport.pdf")], additionalCost: { amount: 30, comment: "Document printing" } },
      { id: "7", title: "Setup account", completed: false, assignedTo: "1", requiresProof: false },
    ],
  },
  {
    id: "4",
    title: "Performance Review",
    description: "Review project performance for Acme Corporation.",
    customerId: "1",
    serviceId: "1",
    assignedTo: "1", // Admin
    status: "completed",
    priority: "low",
    dueDate: "2024-08-01",
    createdAt: "2024-07-15",
    completedAt: "2024-08-01T10:30:00Z",
    progress: 100,
    subtasks: [
      { id: "8", title: "Prepare report", completed: true, assignedTo: "1", requiresProof: true, proofFiles: [mockProofFile("report.pdf")] },
      { id: "9", title: "Send feedback", completed: true, assignedTo: "1", requiresProof: false, additionalCost: { amount: 20, comment: "Client call" } },
    ],
  },
  {
    id: "5",
    title: "Database Migration",
    description: "Migrate legacy database to new cloud infrastructure",
    customerId: "1",
    serviceId: "4",
    assignedTo: "", // Unassigned
    status: "pending",
    priority: "high",
    dueDate: "2024-10-15",
    createdAt: "2024-09-05",
    progress: 0,
    subtasks: [
      { id: "10", title: "Data analysis", completed: false, assignedTo: "", requiresProof: true },
      { id: "11", title: "Migration plan", completed: false, assignedTo: "", requiresProof: false },
    ],
  },
  {
    id: "6",
    title: "Security Audit",
    description: "Comprehensive security audit for enterprise client",
    customerId: "2",
    serviceId: "6",
    assignedTo: "", // Unassigned
    status: "pending",
    priority: "medium",
    dueDate: "2024-11-01",
    createdAt: "2024-09-06",
    progress: 0,
    subtasks: [
      { id: "12", title: "Penetration testing", completed: false, assignedTo: "", requiresProof: true },
      { id: "13", title: "Security report", completed: false, assignedTo: "", requiresProof: true },
    ],
  },
  {
    id: "7",
    title: "Mobile App Testing",
    description: "Quality assurance testing for mobile application",
    customerId: "1",
    serviceId: "5",
    assignedTo: "", // Unassigned
    status: "pending",
    priority: "low",
    dueDate: "2024-10-30",
    createdAt: "2024-09-07",
    progress: 0,
    subtasks: [
      { id: "14", title: "Functional testing", completed: false, assignedTo: "", requiresProof: false },
      { id: "15", title: "Performance testing", completed: false, assignedTo: "", requiresProof: true },
    ],
  },
]

export const mockFiles: any[] = [
  {
    id: "1",
    name: "project-requirements.pdf",
    type: "application/pdf",
    size: 2048000,
    customerId: "1",
    taskId: "1",
    uploadedBy: "1",
    uploadedAt: "2024-02-05",
    url: "/files/project-requirements.pdf",
  },
  {
    id: "2",
    name: "design-mockups.zip",
    type: "application/zip",
    size: 15360000,
    customerId: "1",
    taskId: "1",
    uploadedBy: "2",
    uploadedAt: "2024-02-10",
    url: "/files/design-mockups.zip",
  },
  {
    id: "3",
    name: "contract-signed.pdf",
    type: "application/pdf",
    size: 1024000,
    customerId: "1",
    uploadedBy: "1",
    uploadedAt: "2024-01-20",
    url: "/files/contract-signed.pdf",
  },
  {
    id: "4",
    name: "logo-assets.png",
    type: "image/png",
    size: 512000,
    customerId: "2",
    uploadedBy: "3",
    uploadedAt: "2024-02-15",
    url: "/files/logo-assets.png",
  },
]

export const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "urgent",
    title: "Document Submission Required",
    message: "Please submit your ID documents to our physical branch by Friday",
    timestamp: "2 hours ago",
    read: false,
  },
  {
    id: "2",
    type: "payment",
    title: "Service Payment Due",
    message: "Payment of $250 required for Website Development service",
    timestamp: "1 day ago",
    read: false,
  },
  {
    id: "3",
    type: "task",
    title: "Project Update",
    message: "Your website redesign project is 65% complete",
    timestamp: "2 days ago",
    read: true,
  },
  {
    id: "4",
    type: "document",
    title: "New Document Available",
    message: "Design mockups have been uploaded to your Box File",
    timestamp: "3 days ago",
    read: true,
  },
  {
    id: "5",
    type: "payment",
    title: "Outstanding Balance",
    message: "You owe $150 after completion of Logo Design service",
    timestamp: "1 week ago",
    read: false,
  },
]

export const mockReminders: Reminder[] = [
  {
    id: "1",
    title: "Team Meeting",
    description: "Weekly team sync to discuss project progress",
    adminId: "1",
    scheduledTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
    status: "pending",
    repeat: "weekly",
    createdAt: "2024-09-10T09:00:00Z"
  },
  {
    id: "2",
    title: "Client Presentation",
    description: "Present Q3 results to Acme Corporation",
    adminId: "1",
    scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    status: "pending",
    repeat: "none",
    createdAt: "2024-09-10T14:30:00Z"
  },
  {
    id: "3",
    title: "Follow-up Call",
    description: "Call Tech Solutions Inc about their service renewal",
    adminId: "1",
    scheduledTime: "2024-09-09T15:00:00Z",
    status: "done",
    repeat: "none",
    createdAt: "2024-09-08T10:00:00Z"
  }
]

// Auth service functions
export const login = async (email: string, password: string): Promise<User | null> => {
  try {
    console.log('Login attempt with email:', email);

    // Call real API
    const response = await authApi.login(email, password)

    // Map backend user to frontend User interface
    const mappedUser: User = {
      id: response.user.id.toString(),
      email: response.user.email,
      name: response.user.username, // Using username as name if name isn't provided
      role: response.user.role as "admin" | "employee" | "customer",
      avatar: `https://avatar.vercel.sh/${response.user.email}`,
      employee_id: response.user.employee_id,
      customer_id: response.user.customer_id,
      branch_id: response.user.branch_id,
    }

    currentUser = mappedUser
    authToken = response.access
    refreshToken = response.refresh

    if (typeof window !== "undefined") {
      localStorage.setItem("cm_user", JSON.stringify(mappedUser))
      localStorage.setItem("cm_token", response.access)
      localStorage.setItem("cm_refresh_token", response.refresh)
    }

    console.log('Login successful, setting current user:', mappedUser);
    return mappedUser
  } catch (error: any) {
    console.error('Login error:', error.message || error)
    throw error // Re-throw to show error in UI
  }
}

export const logout = async (): Promise<boolean> => {
  try {
    if (refreshToken) {
      await authApi.logout(refreshToken).catch(console.error)
    }

    currentUser = null
    authToken = null
    refreshToken = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("cm_user")
      localStorage.removeItem("cm_token")
      localStorage.removeItem("cm_refresh_token")
    }
    return true
  } catch (error) {
    console.error('Logout error:', error)
    return false
  }
}

export const getCurrentUser = (): User | null => {
  return currentUser
}

export const getAuthToken = (): string | null => {
  return authToken
}

export const refreshAuthToken = async (): Promise<boolean> => {
  try {
    if (refreshToken) {
      const response = await authApi.refresh(refreshToken)
      authToken = response.access
      refreshToken = response.refresh

      if (typeof window !== 'undefined') {
        localStorage.setItem('cm_token', response.access)
        localStorage.setItem('cm_refresh_token', response.refresh)
      }
      return true
    }
    return false
  } catch (error) {
    console.error('Token refresh error:', error)
    return false
  }
}

export const checkAuth = async (): Promise<User | null> => {
  try {
    if (!authToken) return null
    const response = await authApi.getMe()
    const mappedUser: User = {
      id: response.id.toString(),
      email: response.email,
      name: response.username,
      role: response.role,
      avatar: `https://avatar.vercel.sh/${response.email}`,
      employee_id: response.employee_id,
      customer_id: response.customer_id,
      branch_id: response.branch_id,
    }
    currentUser = mappedUser
    if (typeof window !== 'undefined') {
      localStorage.setItem('cm_user', JSON.stringify(mappedUser))
    }
    return mappedUser
  } catch (error) {
    console.error('Auth check error:', error)
    return null
  }
}
