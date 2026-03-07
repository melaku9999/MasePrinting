"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Plus, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import type { SubTask } from "@/lib/auth"

interface SubtaskEditorProps {
  subtasks: SubTask[]
  onChange: (subtasks: SubTask[]) => void
}

export function SubtaskEditor({ subtasks, onChange }: SubtaskEditorProps) {
  const [showDialog, setShowDialog] = useState(false)
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [newTitle, setNewTitle] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [requiresProof, setRequiresProof] = useState(false)
  const [costAmount, setCostAmount] = useState("0")
  const [costComment, setCostComment] = useState("")

  const addSubtask = () => {
    setEditIndex(null)
    setNewTitle("")
    setNewDescription("")
    setRequiresProof(false)
    setCostAmount("0")
    setCostComment("")
    setShowDialog(true)
  }

  const handleAddOrEdit = () => {
    if (newTitle.trim()) {
      if (editIndex !== null) {
        // Edit existing subtask
        const updatedSubtasks = subtasks.map((subtask, i) =>
          i === editIndex
            ? { 
                ...subtask, 
                title: newTitle.trim(), 
                description: newDescription.trim(), 
                requiresProof,
                additionalCost: {
                  amount: parseFloat(costAmount) || 0,
                  comment: costComment.trim()
                }
              }
            : subtask
        )
        onChange(updatedSubtasks)
      } else {
        // Add new subtask
        const newSubtask: SubTask = {
          // Use a temp id so we never confuse with backend id
          id: `temp-${Date.now()}`,
          title: newTitle.trim(),
          description: newDescription.trim(),
          completed: false,
          requiresProof,
          additionalCost: {
            amount: parseFloat(costAmount) || 0,
            comment: costComment.trim()
          },
          assignedTo: "",
        }
        // Mark as new so save logic omits id
        onChange([...(subtasks as any), { ...(newSubtask as any), isNew: true }])
      }
      setShowDialog(false)
      setEditIndex(null)
      setNewTitle("")
      setNewDescription("")
      setRequiresProof(false)
    }
  }

  const removeSubtask = (index: number) => {
    onChange(subtasks.filter((_, i) => i !== index))
  }

  const startEditSubtask = (index: number) => {
    const subtask = subtasks[index]
    setEditIndex(index)
    setNewTitle(subtask.title)
    setNewDescription(subtask.description || "")
    setRequiresProof(!!subtask.requiresProof)
    setCostAmount(subtask.additionalCost?.amount?.toString() || "0")
    setCostComment(subtask.additionalCost?.comment || "")
    setShowDialog(true)
  }

  const updateSubtask = (index: number, field: keyof SubTask, value: any) => {
    const updatedSubtasks = subtasks.map((subtask, i) =>
      i === index ? { ...subtask, [field]: value } : subtask
    )
    onChange(updatedSubtasks)
  }

  return (
    <div className="space-y-4 w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <span className="text-base font-medium">Subtasks</span>
        <Button type="button" onClick={addSubtask} variant="outline" size="sm" className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Subtask
        </Button>
      </div>

      {/* Dialog for adding/editing subtask */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="w-full max-w-md">
          <DialogHeader>
            <DialogTitle>{editIndex !== null ? "Edit Subtask" : "Add Subtask"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Input
              placeholder="Subtask title"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
            />
            <Textarea
              placeholder="Subtask description"
              value={newDescription}
              onChange={e => setNewDescription(e.target.value)}
              rows={2}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={requiresProof}
                onChange={e => setRequiresProof(e.target.checked)}
                className="rounded"
              />
              Requires Proof of Work
            </label>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button type="button" onClick={handleAddOrEdit} className="w-full sm:w-auto">
              {editIndex !== null ? "Save" : "Add"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowDialog(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subtask list */}
      {subtasks.length > 0 && (
        <div className="space-y-3 w-full">
          {subtasks.map((subtask, index) => (
            <Card key={subtask.id} className="p-4 w-full">
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="Subtask title"
                      value={subtask.title}
                      onChange={e => updateSubtask(index, "title", e.target.value)}
                    />
                    <Textarea
                      placeholder="Subtask description"
                      value={subtask.description}
                      onChange={e => updateSubtask(index, "description", e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className="flex sm:flex-col gap-2 sm:gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeSubtask(index)}
                      className="text-red-600 hover:text-red-700 w-full sm:w-auto"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => startEditSubtask(index)}
                      className="ml-0 sm:ml-0 w-full sm:w-auto"
                    >
                      Edit
                    </Button>
                  </div>
                </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={subtask.requiresProof}
                        onChange={e => updateSubtask(index, "requiresProof", e.target.checked)}
                        className="rounded"
                      />
                      Requires Proof
                    </label>
                  </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}