"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Download, ExternalLink, FileText, ImageIcon, FileSpreadsheet, Presentation } from "lucide-react"
import Image from "next/image"

interface FileItem {
  id: string
  name: string
  type: "file" | "folder"
  size?: number
  lastModified: Date
  thumbnail?: string
  mimeType?: string
  content?: File
}

interface FilePreviewProps {
  file: FileItem | null
  isOpen: boolean
  onClose: () => void
}

export function FilePreview({ file, isOpen, onClose }: FilePreviewProps) {
  const [imageError, setImageError] = useState(false)

  if (!file) return null

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size"
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
  }

  const getFileTypeInfo = (mimeType?: string) => {
    if (!mimeType) return { type: "Unknown", color: "gray", icon: FileText }

    if (mimeType.includes("pdf")) return { type: "PDF Document", color: "red", icon: FileText }
    if (mimeType.includes("word") || mimeType.includes("document"))
      return { type: "Word Document", color: "blue", icon: FileText }
    if (mimeType.includes("excel") || mimeType.includes("spreadsheet"))
      return { type: "Excel Spreadsheet", color: "green", icon: FileSpreadsheet }
    if (mimeType.includes("powerpoint") || mimeType.includes("presentation"))
      return { type: "PowerPoint Presentation", color: "orange", icon: Presentation }
    if (mimeType.includes("image")) return { type: "Image", color: "purple", icon: ImageIcon }

    return { type: "Document", color: "gray", icon: FileText }
  }

  const canPreviewInBrowser = (mimeType?: string) => {
    if (!mimeType) return false
    return mimeType.includes("image") || mimeType.includes("pdf") || mimeType.includes("text")
  }

  const getPreviewUrl = (file: FileItem) => {
    if (file.content) {
      return URL.createObjectURL(file.content)
    }
    return null
  }

  const fileTypeInfo = getFileTypeInfo(file.mimeType)
  const previewUrl = getPreviewUrl(file)
  const canPreview = canPreviewInBrowser(file.mimeType)

  const renderPreviewContent = () => {
    if (!canPreview || !previewUrl) {
      return (
        <div className="flex flex-col items-center justify-center h-96 bg-gray-50 rounded-lg">
          <fileTypeInfo.icon className={`w-16 h-16 text-${fileTypeInfo.color}-500 mb-4`} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{file.name}</h3>
          <p className="text-gray-500 mb-4">Preview not available for this file type</p>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 bg-transparent">
              <Download className="w-4 h-4" />
              Download to view
            </Button>
            <Button variant="outline" className="gap-2 bg-transparent">
              <ExternalLink className="w-4 h-4" />
              Open externally
            </Button>
          </div>
        </div>
      )
    }

    if (file.mimeType?.includes("image")) {
      return (
        <div className="flex items-center justify-center bg-gray-50 rounded-lg min-h-96">
          {!imageError ? (
            <Image
              src={previewUrl || "/placeholder.svg"}
              alt={file.name}
              width={800}
              height={600}
              className="max-w-full max-h-96 object-contain rounded-lg"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-96">
              <ImageIcon className="w-16 h-16 text-gray-400 mb-4" />
              <p className="text-gray-500">Failed to load image</p>
            </div>
          )}
        </div>
      )
    }

    if (file.mimeType?.includes("pdf")) {
      return (
        <div className="bg-gray-50 rounded-lg min-h-96">
          <iframe src={previewUrl} className="w-full h-96 rounded-lg" title={`Preview of ${file.name}`} />
        </div>
      )
    }

    if (file.mimeType?.includes("text")) {
      return (
        <div className="bg-gray-50 rounded-lg p-4 min-h-96">
          <iframe src={previewUrl} className="w-full h-80 border-0" title={`Preview of ${file.name}`} />
        </div>
      )
    }

    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-3">
            <fileTypeInfo.icon className={`w-6 h-6 text-${fileTypeInfo.color}-500`} />
            <div>
              <DialogTitle className="text-lg font-semibold truncate max-w-md">{file.name}</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {fileTypeInfo.type}
                </Badge>
                <span className="text-sm text-gray-500">{formatFileSize(file.size)}</span>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-500">{file.lastModified.toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Download className="w-4 h-4" />
              Download
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="overflow-auto max-h-[calc(90vh-120px)]">{renderPreviewContent()}</div>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-500">
            {canPreview ? "Preview available" : "Download required to view content"}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Share
            </Button>
            <Button size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
