"use client"

import { useState, useEffect } from "react"
import { FileUpload } from "./file-upload"
import { FileList } from "./file-list"
import { FileViewer } from "./file-viewer"
import { Button } from "@/components/ui/button"
import { Upload, ArrowLeft } from "lucide-react"
import type { BoxFile } from "@/lib/auth"
import { getAuthToken } from "@/lib/auth"
import { filesApi } from "@/lib/api"

type ViewMode = "list" | "upload" | "view"

interface FileManagementProps {
  customerId?: string
  taskId?: string
  showCustomerInfo?: boolean
}

export function FileManagement({ customerId, taskId, showCustomerInfo = true }: FileManagementProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [selectedFile, setSelectedFile] = useState<BoxFile | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleViewFile = (file: BoxFile) => {
    setSelectedFile(file)
    setViewMode("view")
  }

  const handleDeleteFile = async (fileId: string) => {
    try {
      const response = await filesApi.delete(fileId)
      if (response.success) {
        console.log("[v0] File deleted:", fileId)
      } else {
        console.error("Failed to delete file")
      }
    } catch (error) {
      console.error("Error deleting file:", error)
    }
  }

  const handleUploadComplete = (files: File[]) => {
    console.log("[v0] Upload completed:", files)
    setViewMode("list")
  }

  const handleBackToList = () => {
    setSelectedFile(null)
    setViewMode("list")
  }

  return (
    <div className="w-full min-h-full">
      <div className={`${isMobile ? 'px-2' : 'px-0'} space-y-4 sm:space-y-6`}>
        {(() => {
          switch (viewMode) {
            case "upload":
              return (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-card-foreground">Upload Files</h2>
                    <Button variant="outline" onClick={() => setViewMode("list")} size={isMobile ? "sm" : "default"} className="bg-transparent w-full sm:w-auto">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      <span className={isMobile ? "text-sm" : ""}>Back to Files</span>
                    </Button>
                  </div>
                  <FileUpload customerId={customerId} taskId={taskId} onUploadComplete={handleUploadComplete} />
                </div>
              )
            case "view":
              return (
                <FileViewer
                  file={selectedFile!}
                  onBack={handleBackToList}
                  onDelete={() => {
                    handleDeleteFile(selectedFile!.id)
                    handleBackToList()
                  }}
                />
              )
            default:
              return (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-card-foreground">File Management</h2>
                    <Button onClick={() => setViewMode("upload")} size={isMobile ? "sm" : "default"} className="flex items-center justify-center gap-2 w-full sm:w-auto">
                      <Upload className="h-4 w-4" />
                      <span className={isMobile ? "text-sm" : ""}>Upload Files</span>
                    </Button>
                  </div>
                  <FileList
                    customerId={customerId}
                    taskId={taskId}
                    showCustomerInfo={showCustomerInfo}
                    onViewFile={handleViewFile}
                    onDeleteFile={handleDeleteFile}
                  />
                </div>
              )
          }
        })()} 
      </div>
    </div>
  )
}