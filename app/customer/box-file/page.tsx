"use client"

import { useState } from "react"
import { Search, Download, Eye, FileText, ImageIcon, Archive, Calendar, User } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { mockFiles } from "@/lib/auth"

export default function BoxFilePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  // Filter files for current customer (assuming customer ID 1)
  const customerFiles = mockFiles.filter((file) => file.customerId === "1")

  const filteredFiles = customerFiles.filter((file) => {
    const matchesSearch =
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || file.type.toLowerCase().includes(selectedCategory)
    return matchesSearch && matchesCategory
  })

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return <FileText className="h-8 w-8 text-red-500" />
    if (type.includes("image")) return <ImageIcon className="h-8 w-8 text-green-500" />
    if (type.includes("zip")) return <Archive className="h-8 w-8 text-purple-500" />
    return <FileText className="h-8 w-8 text-gray-500" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const categories = [
    { value: "all", label: "All Files", count: customerFiles.length },
    { value: "pdf", label: "Documents", count: customerFiles.filter((f) => f.type.includes("pdf")).length },
    { value: "image", label: "Images", count: customerFiles.filter((f) => f.type.includes("image")).length },
    { value: "zip", label: "Archives", count: customerFiles.filter((f) => f.type.includes("zip")).length },
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div className="flex items-center gap-3">
            <Archive className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Box File</h1>
              <p className="text-gray-600 text-sm sm:text-base">Access all your documents and files</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-sm">
            {customerFiles.length} files total
          </Badge>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category.value}
                    variant={selectedCategory === category.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.value)}
                    className="whitespace-nowrap"
                  >
                    {category.label} ({category.count})
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Files Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredFiles.map((file) => (
            <Card key={file.id} className="hover:shadow-lg transition-shadow h-full">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  {getFileIcon(file.type)}
                  <Badge variant="outline" className="text-xs">
                    {file.type.split("/")[1]?.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col h-full">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{file.name}</h3>
                <div className="space-y-2 text-sm text-gray-600 mb-4 flex-grow">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 flex-shrink-0" />
                    <span>Size: {formatFileSize(file.size)}</span>
                  </div>
                  {file.taskId && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 flex-shrink-0" />
                      <span>Task: {file.taskId}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-auto">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredFiles.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Archive className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No files found</h3>
              <p className="text-gray-600">
                {searchTerm ? "Try adjusting your search terms" : "No files have been uploaded yet"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}