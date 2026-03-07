"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Download, Share, Trash2, Calendar, User, FileText, Eye, X } from "lucide-react"
import { formatFileSize, getFileIcon, isImageFile } from "@/lib/file-utils"
import type { BoxFile } from "@/lib/auth"

interface FileViewerProps {
  file: BoxFile
  onBack: () => void
  onDelete: () => void
}

export function FileViewer({ file, onBack, onDelete }: FileViewerProps) {
  const [isMobile, setIsMobile] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleDownload = () => {
    console.log("[v0] Downloading file:", file.name)
  }

  const handleShare = () => {
    console.log("[v0] Sharing file:", file.name)
  }

  return (
    <div 
      ref={contentRef}
      className="flex flex-col h-full w-full"
      role="dialog"
      aria-labelledby="file-viewer-title"
      aria-describedby="file-viewer-description"
    >
      {/* Modal Header with Close Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full p-4 sm:p-6 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full">
          <Button 
            variant="outline" 
            size={isMobile ? "sm" : "default"} 
            onClick={onBack} 
            className="flex items-center gap-2 bg-transparent w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Files
          </Button>
          <h2 
            id="file-viewer-title"
            className="text-xl sm:text-2xl font-bold text-card-foreground break-words w-full"
          >
            File Details
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={handleShare} 
            size={isMobile ? "sm" : "default"}
            className="bg-transparent flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Share className="h-4 w-4" />
            <span className={isMobile ? "text-sm" : ""}>Share</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={handleDownload} 
            size={isMobile ? "sm" : "default"}
            className="bg-transparent flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Download className="h-4 w-4" />
            <span className={isMobile ? "text-sm" : ""}>Download</span>
          </Button>
          <Button
            variant="outline"
            onClick={onDelete}
            size={isMobile ? "sm" : "default"}
            className="bg-transparent text-destructive hover:text-destructive flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Trash2 className="h-4 w-4" />
            <span className={isMobile ? "text-sm" : ""}>Delete</span>
          </Button>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
          {/* Enhanced File Preview */}
          <div className="lg:col-span-2 w-full">
            <Card className="border-2 border-muted/50 shadow-lg w-full h-full flex flex-col">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-3 text-lg sm:text-xl">
                  <span className="text-xl sm:text-2xl flex-shrink-0">{getFileIcon(file.type)}</span>
                  <span className="break-all text-base sm:text-lg">{file.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 w-full flex-1">
                {isImageFile(file.type) ? (
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden w-full h-full">
                    <img
                      src={file.url || "/placeholder.svg"}
                      alt={file.name}
                      className="max-w-full max-h-full object-contain rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-muted rounded-lg flex flex-col items-center justify-center p-4 w-full h-full">
                    <div className="text-4xl sm:text-5xl mb-4">{getFileIcon(file.type)}</div>
                    <p className="text-muted-foreground text-center text-sm sm:text-base px-4 break-words">Preview not available for this file type</p>
                    <Button 
                      variant="outline" 
                      onClick={handleDownload} 
                      size={isMobile ? "sm" : "default"}
                      className="mt-4 bg-transparent w-full sm:w-auto"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      <span className={isMobile ? "text-sm" : ""}>Open File</span>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Enhanced File Information */}
          <div className="w-full">
            <Card className="border-2 border-muted/50 shadow-lg w-full h-full flex flex-col">
              <CardHeader className="bg-gradient-to-r from-secondary/5 to-transparent">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <FileText className="h-4 w-4 text-secondary" />
                  </div>
                  File Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 flex-1">
                {/* Enhanced Info Grid */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 bg-muted/20 rounded-xl">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">File Size</p>
                      <p className="text-sm sm:text-base font-bold truncate">{formatFileSize(file.size)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-3 bg-muted/20 rounded-xl">
                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">Upload Date</p>
                      <p className="text-sm sm:text-base font-bold truncate">{new Date(file.uploadedAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-3 bg-muted/20 rounded-xl">
                    <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">Uploaded By</p>
                      <p className="text-sm sm:text-base font-bold truncate">User {file.uploadedBy}</p>
                    </div>
                  </div>
                </div>

                <Separator className="my-4 sm:my-6" />

                <div className="space-y-3">
                  <p className="text-sm sm:text-base font-semibold">Associated With</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs sm:text-sm px-3 py-1 justify-center">
                      Customer {file.customerId}
                    </Badge>
                    {file.taskId && (
                      <Badge variant="outline" className="text-xs sm:text-sm px-3 py-1 justify-center">
                        Task {file.taskId}
                      </Badge>
                    )}
                  </div>
                </div>

                <Separator className="my-4 sm:my-6" />

                <div className="space-y-3">
                  <p className="text-sm sm:text-base font-semibold">File Type</p>
                  <Badge variant="secondary" className="text-xs sm:text-sm px-3 py-1 w-full sm:w-auto justify-center">
                    {file.type}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}