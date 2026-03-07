"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Download, Eye, Trash2, Filter, Calendar, User, FileText } from "lucide-react"
import { formatFileSize, getFileIcon } from "@/lib/file-utils"
import type { BoxFile } from "@/lib/auth"
import { getAuthToken } from "@/lib/auth"
import { filesApi } from "@/lib/api"

interface FileListProps {
  customerId?: string
  taskId?: string
  showCustomerInfo?: boolean
  onViewFile: (file: BoxFile) => void
  onDeleteFile: (fileId: string) => void
}

export function FileList({ customerId, taskId, showCustomerInfo = true, onViewFile, onDeleteFile }: FileListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [files, setFiles] = useState<BoxFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  // Fetch files from API
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setLoading(true)
        const response = await filesApi.getAll({ customerId, taskId })
        if (response.success) {
          setFiles(response.files)
          setError(null)
        } else {
          setError("Failed to fetch files")
        }
      } catch (err) {
        setError("Error fetching files")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchFiles()
  }, [customerId, taskId])

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const filteredFiles = files.filter((file) => {
    const fileName = file.name || file.label || "Untitled"
    const matchesSearch = fileName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCustomer = !customerId || file.customerId === customerId
    const matchesTask = !taskId || file.taskId === taskId
    return matchesSearch && matchesCustomer && matchesTask
  })

  const handleDownload = (file: BoxFile) => {
    // In a real app, this would trigger file download
    console.log("[v0] Downloading file:", file.name || file.label || "file")
  }

  return (
    <div className="space-y-4 lg:space-y-6 px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-lg sm:text-xl font-semibold text-card-foreground">Document Storage</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size={isMobile ? "sm" : "default"} className="bg-transparent w-full sm:w-auto">
            <Filter className="h-4 w-4 mr-2" />
            <span className={isMobile ? "text-sm" : ""}>Filter</span>
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`pl-10 ${isMobile ? 'h-10 text-sm' : 'h-11'}`}
          />
        </div>
      </div>

      <div className="grid gap-3 lg:gap-4">
        {filteredFiles.map((file) => (
          <Card key={file.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-3 lg:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className="text-xl sm:text-2xl flex-shrink-0">{getFileIcon(file.type || "file")}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-card-foreground truncate text-sm sm:text-base">{file.name || file.label || "Untitled"}</h4>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1 text-xs sm:text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3 flex-shrink-0" />
                        {formatFileSize(file.size || 0)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 flex-shrink-0" />
                        {new Date(file.uploadedAt || file.created_at || new Date()).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">Uploaded by User {file.uploadedBy}</span>
                      </span>
                    </div>
                    {showCustomerInfo && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">
                          Customer {file.customerId}
                        </Badge>
                        {file.taskId && (
                          <Badge variant="outline" className="text-xs">
                            Task {file.taskId}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button variant="outline" size="sm" onClick={() => onViewFile(file)} className="bg-transparent flex-1 sm:flex-none">
                    <Eye className="h-4 w-4" />
                    <span className={`${isMobile ? 'ml-2 text-xs' : 'sr-only'}`}>View</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDownload(file)} className="bg-transparent flex-1 sm:flex-none">
                    <Download className="h-4 w-4" />
                    <span className={`${isMobile ? 'ml-2 text-xs' : 'sr-only'}`}>Download</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteFile(file.id)}
                    className="bg-transparent text-destructive hover:text-destructive flex-1 sm:flex-none"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className={`${isMobile ? 'ml-2 text-xs' : 'sr-only'}`}>Delete</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFiles.length === 0 && (
        <Card>
          <CardContent className="p-6 lg:p-8 text-center">
            <FileText className="mx-auto h-10 w-10 lg:h-12 lg:w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-sm lg:text-base">
              {searchTerm ? "No files found matching your search." : "No files uploaded yet."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
