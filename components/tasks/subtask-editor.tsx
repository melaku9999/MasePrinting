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

  const addSubtask = () => {
    setEditIndex(null)
    setNewTitle("")
    setNewDescription("")
    setRequiresProof(false)
    setShowDialog(true)
  }

  const handleAddOrEdit = () => {
    if (newTitle.trim()) {
      if (editIndex !== null) {
        // Edit existing subtask
        const updatedSubtasks = subtasks.map((subtask, i) =>
          i === editIndex
            ? { ...subtask, title: newTitle.trim(), description: newDescription.trim(), requiresProof }
            : subtask
        )
        onChange(updatedSubtasks)
      } else {
        // Add new subtask
        const newSubtask: SubTask = {
          id: Date.now().toString(),
          title: newTitle.trim(),
          description: newDescription.trim(),
          completed: false,
          requiresProof,
          additionalCost: 0,
          costComment: "",
          assignedTo: "",
        }
        onChange([...subtasks, newSubtask])
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
    setShowDialog(true)
  }

  const updateSubtask = (index: number, field: keyof SubTask, value: any) => {
    const updatedSubtasks = subtasks.map((subtask, i) =>
      i === index ? { ...subtask, [field]: value } : subtask
    )
    onChange(updatedSubtasks)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-base font-medium">Subtasks</span>
        <Button type="button" onClick={addSubtask} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Subtask
        </Button>
      </div>

      {/* Dialog for adding/editing subtask */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
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
          <DialogFooter>
            <Button type="button" onClick={handleAddOrEdit}>
              {editIndex !== null ? "Save" : "Add"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subtask list */}
      {subtasks.length > 0 && (
        <div className="space-y-3">
          {subtasks.map((subtask, index) => (
            <Card key={subtask.id} className="p-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
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
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeSubtask(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => startEditSubtask(index)}
                    className="ml-2"
                  >
                    Edit
                  </Button>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={subtask.requiresProof}
                      onChange={e => updateSubtask(index, "requiresProof", e.target.checked)}
                      className="rounded"
                    />
                    Requires Proof of Work
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
