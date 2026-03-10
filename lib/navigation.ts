import {
  Home,
  Boxes,
  DollarSign,
  TrendingUp,
  Users,
  Building,
  CheckCircle2,
  CalendarDays,
  FolderOpen,
  UserCheck,
  LineChart,
  Layout,
  MessageSquare,
  ShoppingCart,
  Briefcase,
  Folder,
  Settings,
} from "lucide-react"

export interface NavItem {
  id: string
  label: string
  icon: any
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const ADMIN_NAVIGATION: NavGroup[] = [
  {
    label: "Main",
    items: [
      { id: "overview", label: "Overview", icon: Home },
    ],
  },
  {
    label: "Inventory & Financials",
    items: [
      { id: "inventory", label: "Inventory", icon: Boxes },
      { id: "financial", label: "Finances", icon: DollarSign },
      { id: "expenses", label: "Expenses", icon: TrendingUp },
    ],
  },
  {
    label: "Management",
    items: [
      { id: "customers", label: "Customers", icon: Users },
      { id: "services", label: "Services", icon: Building },
      { id: "tasks", label: "Pending Tasks", icon: CheckCircle2 },
      { id: "mytasks", label: "My Tasks", icon: CheckCircle2 },
      { id: "calendar", label: "Calendar", icon: CalendarDays },
      { id: "boxfiles", label: "Box Files", icon: FolderOpen },
      { id: "employees", label: "Employees", icon: UserCheck },
      { id: "branches", label: "Branches", icon: Building },
    ],
  },
  {
    label: "Reports",
    items: [
      { id: "sales", label: "Sales Log", icon: DollarSign },
      { id: "revenue_hub", label: "Revenue Hub", icon: LineChart },
    ],
  },
  {
    label: "Communications",
    items: [
      { id: "content", label: "Content Editor", icon: Layout },
      { id: "inquiries", label: "Contact Inquiries", icon: MessageSquare },
    ],
  },
]

export const EMPLOYEE_NAVIGATION: NavGroup[] = [
  {
    label: "Main",
    items: [
      { id: "overview", label: "Overview", icon: Home },
      { id: "tasks", label: "My Tasks", icon: CheckCircle2 },
    ],
  },
  {
    label: "Operations",
    items: [
      { id: "services", label: "Services", icon: Briefcase },
    ],
  },
  {
    label: "Inventory & Financials",
    items: [
      { id: "sales", label: "Sales", icon: ShoppingCart },
      { id: "inventory", label: "Inventory", icon: Boxes },
      { id: "financial", label: "Finances", icon: DollarSign },
      { id: "revenue_hub", label: "Revenue Insights", icon: LineChart },
    ],
  },
  {
    label: "Management",
    items: [
      { id: "customers", label: "Customers", icon: Users },
      { id: "files", label: "Box Files", icon: Folder },
      { id: "chat", label: "Support Chat", icon: MessageSquare },
    ],
  },
]

export const CUSTOMER_NAVIGATION: NavGroup[] = [
  {
    label: "Main",
    items: [
      { id: "overview", label: "Overview", icon: Home },
      { id: "services", label: "My Services", icon: Building },
      { id: "tasks", label: "Project Status", icon: CheckCircle2 },
      { id: "files", label: "Box Files", icon: Folder },
      { id: "chat", label: "Chat Support", icon: MessageSquare },
      { id: "notifications", label: "Notifications", icon: LineChart }, // Using LineChart as placeholder if Bell not available, but Bell is common
      { id: "profile", label: "Profile Settings", icon: Settings },
    ],
  },
]

export function getNavigationForRole(role: string): NavGroup[] {
  switch (role) {
    case "admin":
      return ADMIN_NAVIGATION
    case "employee":
      return EMPLOYEE_NAVIGATION
    case "customer":
      return CUSTOMER_NAVIGATION
    default:
      return []
  }
}
