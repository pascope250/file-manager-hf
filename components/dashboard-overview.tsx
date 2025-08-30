"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { FileText, Folder, Users, Calendar, Clock, Activity, Upload, Plus } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "manager" | "employee"
  department: string
  status: "active" | "inactive"
  createdAt: Date
}

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

interface DashboardOverviewProps {
  currentUser: User
  files: FileItem[]
  users: User[]
  onNavigate: (view: string) => void
  onUploadClick: () => void
}

export function DashboardOverview({ currentUser, files, users, onNavigate, onUploadClick }: DashboardOverviewProps) {
  const totalFiles = files.filter((f) => f.type === "file").length
  const totalFolders = files.filter((f) => f.type === "folder").length
  const totalStorage = files.reduce((acc, file) => acc + (file.size || 0), 0)
  const storageLimit = 5 * 1024 * 1024 * 1024 // 5GB in bytes
  const storageUsedPercent = (totalStorage / storageLimit) * 100

  const formatFileSize = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
  }

  const recentFiles = files
    .filter((f) => f.type === "file")
    .sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime())
    .slice(0, 5)

  const quickActions = [
    {
      title: "Upload Files",
      description: "Add new documents",
      icon: Upload,
      action: onUploadClick,
      color: "blue",
    },
    {
      title: "Create Folder",
      description: "Organize your files",
      icon: Plus,
      action: () => onNavigate("files"),
      color: "green",
    },
    {
      title: "Request Leave",
      description: "Submit time off request",
      icon: Calendar,
      action: () => onNavigate("leave"),
      color: "purple",
    },
    ...(currentUser.role === "admin"
      ? [
          {
            title: "Manage Users",
            description: "Add or edit users",
            icon: Users,
            action: () => onNavigate("admin"),
            color: "orange",
          },
        ]
      : []),
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600">Welcome back, {currentUser.name}! Here's what's happening.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFiles}</div>
            <p className="text-xs text-muted-foreground">+2 from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Folders</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFolders}</div>
            <p className="text-xs text-muted-foreground">Well organized</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatFileSize(totalStorage)}</div>
            <Progress value={storageUsedPercent} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">{storageUsedPercent.toFixed(1)}% of 5GB used</p>
          </CardContent>
        </Card>

        {currentUser.role === "admin" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.filter((u) => u.status === "active").length}</div>
              <p className="text-xs text-muted-foreground">{users.length} total users</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks to get you started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow bg-transparent"
                onClick={action.action}
              >
                <action.icon className={`h-8 w-8 text-${action.color}-500`} />
                <div className="text-center">
                  <div className="font-medium">{action.title}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Files</CardTitle>
            <CardDescription>Your latest uploads and modifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentFiles.length > 0 ? (
                recentFiles.map((file) => (
                  <div key={file.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">Modified {file.lastModified.toLocaleDateString()}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {file.mimeType?.includes("pdf")
                        ? "PDF"
                        : file.mimeType?.includes("image")
                          ? "Image"
                          : file.mimeType?.includes("document")
                            ? "Doc"
                            : "File"}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No files uploaded yet</p>
                  <Button size="sm" className="mt-2" onClick={onUploadClick}>
                    Upload your first file
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current system health and activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">File System</span>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Healthy
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">User Authentication</span>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Active
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Leave Management</span>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Running
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">Last Backup</span>
                </div>
                <span className="text-xs text-gray-500">2 hours ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
