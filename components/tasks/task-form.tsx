"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { type Task } from "@/lib/auth"
import { customersApi, employeesApi, tasksApi } from "@/lib/api"
import {
  Plus,
  Save,
  ArrowLeft,
  FileText,
  User,
  Building2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Check
} from "lucide-react"
import { SubtaskEditor } from "@/components/tasks/subtask-editor"
import { cn } from "@/lib/utils"

interface Customer {
  id?: number | string
  customer_id?: number
  name: string
  email: string
}

interface Employee {
  id?: number | string
  employee_id?: number
  employee_name: string
}

interface TaskFormProps {
  task?: Task
  onSave: (task: Partial<Task>) => void
  onCancel: () => void
}

interface FormData {
  title: string
  description: string
  customerId: string
  serviceId: string
  assignedTo: string
  status: "pending" | "in-progress" | "completed" | "cancelled"
  priority: "low" | "medium" | "high"
  dueDate: string
  price: string
}

export function TaskForm({ task, onSave, onCancel }: TaskFormProps) {
  const [formData, setFormData] = useState<FormData>({
    title: task?.title || "",
    description: task?.description || "",
    customerId: task?.customerId || (task?.customer?.id?.toString()) || "",
    serviceId: task?.serviceId || (task?.service?.id?.toString()) || "",
    assignedTo: task?.assignedTo || task?.assigned_to?.id?.toString() || "unassigned",
    status: task?.status || "pending",
    priority: task?.priority === 3 || task?.priority === "high" ? "high" : (task?.priority === 2 || task?.priority === "medium" ? "medium" : "low"),
    dueDate: task?.dueDate ? (task.dueDate.includes('T') ? task.dueDate.split('T')[0] : task.dueDate) : "",
    price: task?.price?.toString() ?? task?.base_price?.toString() ?? "",
  })

  const [subtasks, setSubtasks] = useState(task?.subtasks || [])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loadingCustomers, setLoadingCustomers] = useState(true)
  const [loadingEmployees, setLoadingEmployees] = useState(true)
  const [loadingTaskDetails, setLoadingTaskDetails] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingCustomers(true)
        const cRes = await customersApi.getAll()
        setCustomers(cRes.results || cRes || [])

        const eRes = await employeesApi.getAll()
        const rawEmployees = eRes.results || eRes || []
        setEmployees(rawEmployees.map((e: any) => ({
          employee_id: e.id,
          employee_name: e.name || e.employee_name
        })))
      } catch (error) {
        console.error("Error fetching form data:", error)
      } finally {
        setLoadingCustomers(false)
        setLoadingEmployees(false)
      }
    }
    fetchData()

    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    const priorityValue = formData.priority === "high" ? 3 : (formData.priority === "medium" ? 2 : 1)

    const updatedTask: Partial<Task> = {
      ...task,
      title: formData.title,
      description: formData.description,
      customerId: formData.customerId,
      serviceId: formData.serviceId,
      assignedTo: formData.assignedTo === "unassigned" ? "unassigned" : formData.assignedTo,
      status: formData.status,
      priority: priorityValue as any,
      dueDate: formData.dueDate,
      price: parseFloat(formData.price) || 0,
      subtasks: subtasks
    }

    onSave(updatedTask)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20 animate-in fade-in duration-700">
      {/* Notion-style Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-slate-100">
        <div className="space-y-2">
          <Button variant="ghost" onClick={onCancel} className="text-slate-500 hover:text-slate-900 -ml-2 rounded-lg h-8 px-2 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to workspace
          </Button>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            {task ? "Edit Task" : "New Task"}
          </h1>
          <p className="text-slate-500 text-lg max-w-xl">
            {task ? "Update the workflow parameters and team assignments." : "Define a new operational workflow and set its objectives."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onCancel} className="h-11 border-slate-200 hover:bg-slate-50 text-slate-600 px-6 rounded-lg transition-colors">
            Discard
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loadingTaskDetails || !formData.title || !formData.customerId || !formData.dueDate}
            className="h-11 bg-slate-900 hover:bg-slate-800 text-white shadow-md px-8 rounded-lg font-bold transition-all active:scale-95"
          >
            <Save className="h-4 w-4 mr-2" />
            {task ? "Update Workflow" : "Launch Workflow"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* Main Form Fields */}
          <div className="space-y-10">
            <section className="space-y-6">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 border-l-2 border-slate-900 pl-4">Core Definition</h3>
              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-xs font-black uppercase text-slate-500">Task Title <span className="text-rose-500">*</span></Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={e => handleInputChange("title", e.target.value)}
                    placeholder="e.g., Q1 Financial Audit"
                    className="h-12 border-slate-200 focus:ring-slate-900 rounded-xl bg-white shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-xs font-black uppercase text-slate-500">Detailed Context</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={e => handleInputChange("description", e.target.value)}
                    placeholder="Describe the objectives and requirements..."
                    className="min-h-[120px] border-slate-200 focus:ring-slate-900 rounded-xl bg-white shadow-sm resize-none"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 border-l-2 border-slate-900 pl-4">Logistics & Assignment</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase text-slate-500">Customer Entity <span className="text-rose-500">*</span></Label>
                  <Select value={formData.customerId} onValueChange={v => handleInputChange("customerId", v)}>
                    <SelectTrigger className="h-12 border-slate-200 rounded-xl bg-white shadow-sm">
                      <SelectValue placeholder="Select entity" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(c => {
                        const cid = c.customer_id || c.id
                        if (!cid) return null
                        return (
                          <SelectItem key={cid} value={cid.toString()}>{c.name}</SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase text-slate-500">Assign To Employee</Label>
                  <Select value={formData.assignedTo} onValueChange={v => handleInputChange("assignedTo", v)}>
                    <SelectTrigger className="h-12 border-slate-200 rounded-xl bg-white shadow-sm">
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {employees.map(e => {
                        const eid = e.employee_id || e.id
                        if (!eid) return null
                        return (
                          <SelectItem key={eid} value={eid.toString()}>{e.employee_name}</SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase text-slate-500">Deadline <span className="text-rose-500">*</span></Label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={e => handleInputChange("dueDate", e.target.value)}
                    className="h-12 border-slate-200 rounded-xl bg-white shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase text-slate-500">Priority Level</Label>
                  <Select value={formData.priority} onValueChange={(v: any) => handleInputChange("priority", v)}>
                    <SelectTrigger className="h-12 border-slate-200 rounded-xl bg-white shadow-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase text-slate-500">Task Base Price ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={e => handleInputChange("price", e.target.value)}
                    placeholder="0.00"
                    className="h-12 border-slate-200 rounded-xl bg-white shadow-sm"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 border-l-2 border-slate-900 pl-4">Quality Steps</h3>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <SubtaskEditor subtasks={subtasks} onChange={setSubtasks} />
              </div>
            </section>
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-8">
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Guidelines</h4>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                  <Check className="h-3 w-3" />
                </div>
                <p className="text-sm text-slate-600 leading-snug">Required fields marked with an asterisk must be finalized for launch.</p>
              </li>
              <li className="flex gap-3">
                <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                  <Check className="h-3 w-3" />
                </div>
                <p className="text-sm text-slate-600 leading-snug">Checklist items help the assignee track granular milestones.</p>
              </li>
              <li className="flex gap-3">
                <div className="h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 shrink-0 mt-0.5">
                  <AlertCircle className="h-3 w-3" />
                </div>
                <p className="text-sm text-slate-500 leading-snug italic">Launch without assignment to keep as a general pending task.</p>
              </li>
            </ul>
          </div>

          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                <FileText className="h-4 w-4" />
              </div>
              <h4 className="font-bold text-sm">Validation Overview</h4>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Required Detail</span>
                <span className={cn("font-bold text-[10px] px-2 py-0.5 rounded", formData.title && formData.customerId && formData.dueDate ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400")}>
                  {formData.title && formData.customerId && formData.dueDate ? "READY" : "INCOMPLETE"}
                </span>
              </div>
              <Separator className="bg-slate-800" />
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Milestone Count</span>
                <span className="font-bold">{subtasks.length} items</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}