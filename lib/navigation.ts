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
      { id: "recipe_manager", label: "Recipe Manager", icon: Layout },
      { id: "tasks", label: "My Tasks", icon: CheckCircle2 },
      { id: "mytasks", label: "All Tasks", icon: CheckCircle2 },
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
      { id: "tasks", label: "Tasks", icon: CheckCircle2 },
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
      // { id: "chat", label: "Support Chat", icon: MessageSquare },
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

export const LOUNGE_NAVIGATION: NavGroup[] = [
  {
    label: "Diva Lounge",
    items: [
      { id: "overview", label: "Diva Overview", icon: Home },
    ],
  },
  {
    label: "Service Desk",
    items: [
      { id: "pos", label: "Service Desk", icon: ShoppingCart },
    ],
  },
  {
    label: "Inventory & Assets",
    items: [
      { id: "bar_inventory", label: "Diva Assets", icon: Boxes },
    ],
  },
  {
    label: "Financials",
    items: [
      { id: "bar_expenses", label: "Diva Expenses", icon: TrendingUp },
      { id: "bar_logs", label: "Diva Sales Logs", icon: DollarSign },
      { id: "revenue_hub", label: "Diva Insights", icon: LineChart },
    ],
  },
  {
    label: "Management",
    items: [
      { id: "lounge_customers", label: "Bar Customers", icon: Users },
      // { id: "chat", label: "Support Chat", icon: MessageSquare },
    ],
  },
]

export function getNavigationForRole(role: string): NavGroup[] {
  const isFnb = typeof window !== 'undefined' && localStorage.getItem('business_context') === 'fnb'

  if (role === 'admin') return ADMIN_NAVIGATION
  if (isFnb) return LOUNGE_NAVIGATION

  switch (role) {
    case "employee":
      return EMPLOYEE_NAVIGATION
    case "customer":
      return CUSTOMER_NAVIGATION
    default:
      return []
  }
}
