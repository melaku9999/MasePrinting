"use client"

import { useState } from "react"
import { CustomerList } from "./customer-list"
import { CustomerForm } from "./customer-form"
import { CustomerDetails } from "./customer-details"
import type { Customer } from "@/lib/auth"
import { customersApi } from "@/lib/api"
import { toast } from "sonner"

type ViewMode = "list" | "add" | "edit" | "view"

interface CustomerManagementProps {
  user: {
    id: string
    name: string
    role: "admin" | "employee" | "customer"
  }
}

export function CustomerManagement({ user }: CustomerManagementProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setViewMode("view")
  }

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setViewMode("edit")
  }

  const handleAddCustomer = () => {
    setSelectedCustomer(null)
    setViewMode("add")
  }

  const handleSaveCustomer = async (customerData: Partial<Customer>) => {
    try {
      console.log("Saving customer data:", customerData)
      
      if (selectedCustomer) {
        // Use the data structure from CustomerForm
        const response = await customersApi.update(selectedCustomer.id, customerData)
        if (response) {
          toast.success("Identity profile updated successfully.")
        } else {
          toast.error("Anomalous result: Registry update failure.")
        }
      } else {
        // Use the data structure from CustomerForm
        const response = await customersApi.create(customerData)
        if (response) {
          toast.success("New entity registered successfully.")
        } else {
          toast.error("Anomalous result: Creation protocol error.")
        }
      }
      setViewMode("list")
    } catch (error) {
      console.error("Error saving customer:", error)
      toast.error(`System error: ${error}`)
    }
  }

  const handleCancel = () => {
    setSelectedCustomer(null)
    setViewMode("list")
  }

  const handleBackToList = () => {
    setSelectedCustomer(null)
    setViewMode("list")
  }

  const handleDeleteCustomer = async (customerId: string) => {
    // Standardizing confirmation dialog with cleaner text
    if (!confirm("Confirm immediate de-registration of this entity? This action is irrevocable.")) {
      return
    }

    try {
      console.log("Deleting customer:", customerId)
      
      const response = await customersApi.delete(customerId)
      if (response) {
        toast.success("Entity removed from registry.")
        setViewMode("list")
      } else {
        toast.error("De-registration protocol failure.")
      }
    } catch (error) {
      console.error("Error deleting customer:", error)
      toast.error(`System error: ${error}`)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-black tracking-tighter text-slate-900">Customer Management</h1>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Global Identity Registry & Relationship Management</p>
      </div>

      <div className="space-y-8">
        {viewMode === "add" && <CustomerForm onSave={handleSaveCustomer} onCancel={handleCancel} />}
        {viewMode === "edit" && <CustomerForm customer={selectedCustomer!} onSave={handleSaveCustomer} onCancel={handleCancel} />}
        {viewMode === "view" && (
          <CustomerDetails
            customer={selectedCustomer!}
            onEdit={() => handleEditCustomer(selectedCustomer!)}
            onBack={handleBackToList}
            user={user}
          />
        )}
        {viewMode === "list" && (
          <CustomerList
            onViewCustomer={handleViewCustomer}
            onEditCustomer={handleEditCustomer}
            onAddCustomer={handleAddCustomer}
            onDeleteCustomer={handleDeleteCustomer}
          />
        )}
      </div>
    </div>
  )
}
