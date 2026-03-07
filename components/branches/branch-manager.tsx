"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Building, Warehouse, Search, Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { branchesApi } from "@/lib/api"
import { toast } from "sonner"

export function BranchManager() {
  const [branches, setBranches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    is_warehouse: false,
    contact_info: "",
  })
  const [searchTerm, setSearchTerm] = useState("")

  const filteredBranches = branches.filter(b => 
    b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.location && b.location.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  useEffect(() => {
    fetchBranches()
  }, [])

  const fetchBranches = async () => {
    try {
      setLoading(true)
      const data = await branchesApi.getAll()
      setBranches(data)
    } catch (error) {
      console.error("Error fetching branches:", error)
      toast.error("Failed to load branches")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (branch: any = null) => {
    if (branch) {
      setEditingBranch(branch)
      setFormData({
        name: branch.name,
        location: branch.location || "",
        is_warehouse: branch.is_warehouse,
        contact_info: branch.contact_info || "",
      })
    } else {
      setEditingBranch(null)
      setFormData({
        name: "",
        location: "",
        is_warehouse: false,
        contact_info: "",
      })
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    try {
      if (editingBranch) {
        await branchesApi.update(editingBranch.id, formData)
        toast.success("Branch updated successfully")
      } else {
        await branchesApi.create(formData)
        toast.success("Branch created successfully")
      }
      setIsDialogOpen(false)
      fetchBranches()
    } catch (error) {
      console.error("Error saving branch:", error)
      toast.error("Failed to save branch")
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this branch?")) {
      try {
        await branchesApi.delete(id)
        toast.success("Branch deleted successfully")
        fetchBranches()
      } catch (error) {
        console.error("Error deleting branch:", error)
        toast.error("Failed to delete branch")
      }
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">Branch Management</h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Physical Location & Central Warehouse Governance</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-3 w-full bg-slate-50/50 p-2 rounded-xl border border-slate-100">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
          <Input
            placeholder="Search branches by name or physical location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-11 border-0 bg-white shadow-sm ring-1 ring-slate-200 focus-visible:ring-2 focus-visible:ring-slate-900 rounded-lg placeholder:text-slate-400 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-11 w-11 border-0 bg-white shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 rounded-lg shrink-0">
            <Filter className="h-4 w-4 text-slate-400" />
          </Button>
          <Button 
            onClick={() => handleOpenDialog()} 
            className="h-11 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg transition-all active:scale-95 text-xs uppercase tracking-widest gap-2"
          >
            <Plus className="h-3.5 w-3.5" /> Establish Branch
          </Button>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-slate-900 text-sm uppercase tracking-widest">Location Manifest</h2>
            <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none text-[10px] font-black font-mono">
              {filteredBranches.length} ENTITIES
            </Badge>
          </div>
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-10 px-6">Type</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-10 px-6">Identification Name</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-10 px-6">Physical Location</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-10 px-6">Communication Bridge</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-10 px-6 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-slate-400 text-sm font-medium">Scanning network infrastructure...</TableCell>
                </TableRow>
              ) : filteredBranches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-slate-400 text-sm font-medium">No strategic branches identified.</TableCell>
                </TableRow>
              ) : (
                filteredBranches.map((branch) => (
                  <TableRow key={branch.id} className="border-slate-50 group hover:bg-slate-50/50 transition-colors">
                    <TableCell className="px-6">
                      {branch.is_warehouse ? (
                        <div className="flex items-center gap-2 text-slate-900 bg-slate-100 w-fit px-2 py-1 rounded-md border border-slate-200/50 shadow-sm">
                          <Warehouse className="h-3 w-3" />
                          <span className="text-[9px] font-black uppercase tracking-tighter">Central Hub</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-slate-400 px-2 py-1 group-hover:text-slate-600 transition-colors">
                          <Building className="h-3 w-3" />
                          <span className="text-[9px] font-black uppercase tracking-tighter">Strategic Branch</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="px-6 font-bold text-slate-900">{branch.name}</TableCell>
                    <TableCell className="px-6 text-slate-500 font-medium text-sm">{branch.location || "Undisclosed"}</TableCell>
                    <TableCell className="px-6 max-w-[200px] truncate text-slate-400 text-xs font-medium italic">{branch.contact_info || "No bridge defined"}</TableCell>
                    <TableCell className="px-6 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-white rounded-lg border border-transparent hover:border-slate-100 shadow-none hover:shadow-sm" onClick={() => handleOpenDialog(branch)}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-100 shadow-none hover:shadow-sm" onClick={() => handleDelete(branch.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight">
              {editingBranch ? "Modify Location Profile" : "Establish New Strategic Branch"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Branch Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Downtown Office"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Physical Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. 123 Main St"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_warehouse"
                checked={formData.is_warehouse}
                onCheckedChange={(checked) => setFormData({ ...formData, is_warehouse: !!checked })}
              />
              <Label htmlFor="is_warehouse">Mark as Central Warehouse</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact">Contact Information</Label>
              <Textarea
                id="contact"
                value={formData.contact_info}
                onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
                placeholder="Phone, email, or other contact details..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!formData.name}>
              {editingBranch ? "Save Changes" : "Create Branch"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
