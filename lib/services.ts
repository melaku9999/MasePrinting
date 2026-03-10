export interface License {
  id: string
  serviceId: string
  customerId: string
  licenseKey: string
  status: "active" | "expired" | "suspended" | "pending"
  startDate: string
  endDate: string
  autoRenew: boolean
  maxUsers: number
  currentUsers: number
  cost: number
}

export interface ServiceAssignment {
  id: string
  serviceId: string
  customerId: string
  status: "active" | "inactive" | "pending"
  assignedDate: string
  notes?: string
  customPrice?: number
  assignedTo?: string
}

// Extended mock data
export const mockLicenses: License[] = [
  {
    id: "1",
    serviceId: "2",
    customerId: "1",
    licenseKey: "SOFT-2024-ACME-001",
    status: "active",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    autoRenew: true,
    maxUsers: 50,
    currentUsers: 35,
    cost: 500.0,
  },
  {
    id: "2",
    serviceId: "2",
    customerId: "2",
    licenseKey: "SOFT-2024-TECH-001",
    status: "active",
    startDate: "2024-02-15",
    endDate: "2025-02-14",
    autoRenew: false,
    maxUsers: 25,
    currentUsers: 18,
    cost: 500.0,
  },
]

export const mockServiceAssignments: ServiceAssignment[] = [
  {
    id: "1",
    serviceId: "1",
    customerId: "1",
    status: "active",
    assignedDate: "2024-02-01",
    notes: "Website redesign project",
    customPrice: 2200.0,
  },
  {
    id: "2",
    serviceId: "2",
    customerId: "1",
    status: "active",
    assignedDate: "2024-01-01",
    notes: "Annual software license",
  },
]

export const getLicenseStatusColor = (status: License["status"]) => {
  switch (status) {
    case "active":
      return "bg-secondary text-secondary-foreground"
    case "expired":
      return "bg-destructive text-destructive-foreground"
    case "suspended":
      return "bg-orange-500 text-white"
    case "pending":
      return "bg-yellow-500 text-white"
    default:
      return "bg-muted text-muted-foreground"
  }
}

export const getDaysUntilExpiry = (endDate: string): number => {
  const today = new Date()
  const expiry = new Date(endDate)
  const diffTime = expiry.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export const mockChatMessages = [
  { id: 1, sender: "support", message: "Hello! How can I help you today?", timestamp: new Date("2024-01-15T10:00:00") },
  {
    id: 2,
    sender: "customer",
    message: "I have a question about my project status",
    timestamp: new Date("2024-01-15T10:05:00"),
  },
  {
    id: 3,
    sender: "support",
    message: "I'd be happy to help! Which project are you referring to?",
    timestamp: new Date("2024-01-15T10:06:00"),
  },
]
