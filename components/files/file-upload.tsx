"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Upload, X, File } from "lucide-react"
import { formatFileSize } from "@/lib/file-utils"

interface FileUploadProps {
  customerId?: string
  taskId?: string
  onUploadComplete: (files: File[]) => void
  maxFiles?: number
  acceptedTypes?: string[]
}

export function FileUpload({
  customerId,
  taskId,
  onUploadComplete,
  maxFiles = 10,
  acceptedTypes = ["*/*"],
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    handleFiles(selectedFiles)
  }

  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles.slice(0, maxFiles - files.length)
    setFiles((prev) => [...prev, ...validFiles])
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setUploading(true)
    setUploadProgress(0)

    // Simulation for UI feedback
    let progress = 0
    const interval = setInterval(() => {
      progress += 20
      if (progress >= 100) {
        clearInterval(interval)
        setUploadProgress(100)
        setUploading(false)
        onUploadComplete(files)
        setFiles([])
      } else {
        setUploadProgress(progress)
      }
    }, 150)
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Upload Files</h3>
          <p className="text-muted-foreground mb-4">Drag and drop files here, or click to select files</p>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="bg-transparent">
            Select Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileInput}
            accept={acceptedTypes.join(",")}
          />
        </div>

        {files.length > 0 && (
          <div className="mt-6 space-y-3">
            <h4 className="font-medium">Selected Files ({files.length})</h4>
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <File className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeFile(index)} className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleUpload} disabled={uploading} className="flex-1">
                {uploading ? "Uploading..." : "Upload Files"}
              </Button>
              <Button variant="outline" onClick={() => setFiles([])} disabled={uploading} className="bg-transparent">
                Clear All
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
