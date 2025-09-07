"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { FileViewer } from "@/components/files/file-viewer"
import {
  Search,
  FolderOpen,
  FileText,
  ImageIcon,
  Archive,
  MoreVertical,
  Upload,
  Eye,
  Download,
  Trash2,
  Plus,
} from "lucide-react"
import { mockCustomers, mockFiles } from "@/lib/auth"

export function BoxFileManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null)
  const [viewingFile, setViewingFile] = useState<any>(null)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [uploadMode, setUploadMode] = useState<'existing' | 'new'>('existing')
  const [uploadCustomerId, setUploadCustomerId] = useState("")
  const [newBoxFileName, setNewBoxFileName] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [deleteFileId, setDeleteFileId] = useState<string | null>(null)
  const [deleteRemark, setDeleteRemark] = useState("")

  // Group files by customer (Box Files)
  const boxFiles = mockCustomers.map((customer) => ({
    customer,
    files: mockFiles.filter((file) => file.customerId === customer.id),
    totalSize: mockFiles.filter((file) => file.customerId === customer.id).reduce((sum, file) => sum + file.size, 0),
  }))

  const filteredBoxFiles = boxFiles.filter(
    (boxFile) =>
      boxFile.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      boxFile.files.some((file) => file.name.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.includes("image")) return <ImageIcon className="h-4 w-4" />
    if (type.includes("pdf")) return <FileText className="h-4 w-4" />
    if (type.includes("zip") || type.includes("archive")) return <Archive className="h-4 w-4" />
    return <FileText className="h-4 w-4" />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-card-foreground">Box Files</h2>
          <p className="text-muted-foreground">Access customer documents from your assigned tasks</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90" onClick={() => setShowUploadDialog(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Files
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers or files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="outline" className="text-sm">
          {filteredBoxFiles.length} Box Files
        </Badge>
      </div>

      {/* Box Files Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBoxFiles.map((boxFile) => (
          <Card key={boxFile.customer.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FolderOpen className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg">{boxFile.customer.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{boxFile.customer.email}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setSelectedCustomer(boxFile.customer.id)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View All Files
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Files: {boxFile.files.length}</span>
                <span className="text-muted-foreground">Size: {formatFileSize(boxFile.totalSize)}</span>
              </div>

              {/* Recent Files Preview */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Recent Files</h4>
                {boxFile.files.slice(0, 3).map((file) => (
                  <div key={file.id} className="flex items-center gap-3 p-2 bg-muted rounded-lg">
                    {getFileIcon(file.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setViewingFile(file)}>
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                {boxFile.files.length > 3 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-transparent"
                    onClick={() => setSelectedCustomer(boxFile.customer.id)}
                  >
                    View All {boxFile.files.length} Files
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Customer Files Dialog */}
      {selectedCustomer && (
        <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>{mockCustomers.find((c) => c.id === selectedCustomer)?.name} - Box File</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {mockFiles
                .filter((file) => file.customerId === selectedCustomer)
                .map((file) => (
                  <div key={file.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    {getFileIcon(file.type)}
                    <div className="flex-1">
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setViewingFile(file)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* File Viewer Dialog */}
      {viewingFile && (
        <Dialog open={!!viewingFile} onOpenChange={() => setViewingFile(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <FileViewer
              file={viewingFile}
              onBack={() => setViewingFile(null)}
              onDelete={() => {
                // Optionally implement delete logic here
                setViewingFile(null)
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Upload Dialog */}
      {showUploadDialog && (
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload Files to Box File</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="flex gap-4">
                <Button variant={uploadMode === 'existing' ? 'default' : 'outline'} onClick={() => setUploadMode('existing')}>Existing Box File</Button>
                <Button variant={uploadMode === 'new' ? 'default' : 'outline'} onClick={() => setUploadMode('new')}>Create New Box File</Button>
              </div>
              {uploadMode === 'existing' ? (
                <div className="space-y-2">
                  <Label>Select Box File (Customer)</Label>
                  <Select value={uploadCustomerId} onValueChange={setUploadCustomerId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a customer's box file" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCustomers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>{customer.name} - {customer.email}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Box File Name</Label>
                  <Input placeholder="Enter new box file name" value={newBoxFileName} onChange={e => setNewBoxFileName(e.target.value)} />
                  <Label>Select Customer</Label>
                  <Select value={uploadCustomerId} onValueChange={setUploadCustomerId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCustomers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>{customer.name} - {customer.email}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label>Select Files</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">Drag and drop files here, or click to select</p>
                    <input
                      type="file"
                      multiple
                      onChange={e => setSelectedFiles(e.target.files)}
                      className="hidden"
                      id="file-input"
                    />
                    <Button variant="outline" onClick={() => document.getElementById("file-input")?.click()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Choose Files
                    </Button>
                  </div>
                  {selectedFiles && selectedFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium">Selected Files:</p>
                      {Array.from(selectedFiles).map((file, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <FileText className="h-4 w-4" />
                          <span>{file.name}</span>
                          <span className="text-muted-foreground">({formatFileSize(file.size)})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowUploadDialog(false)}>Cancel</Button>
                <Button onClick={() => {/* handle upload logic here */ setShowUploadDialog(false)}} disabled={uploadMode === 'existing' ? !uploadCustomerId || !selectedFiles : !uploadCustomerId || !newBoxFileName || !selectedFiles}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Files
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* File Deletion Dialog */}
      {deleteFileId && (
        <Dialog open={!!deleteFileId} onOpenChange={() => setDeleteFileId(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Remove File from Box File</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Label htmlFor="delete-remark">Please provide a remark for removing this file:</Label>
              <Input id="delete-remark" placeholder="Enter remark..." value={deleteRemark} onChange={e => setDeleteRemark(e.target.value)} />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDeleteFileId(null)}>Cancel</Button>
                <Button onClick={() => {/* handle delete logic here */ setDeleteFileId(null); setDeleteRemark("")}} disabled={!deleteRemark}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove File
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
