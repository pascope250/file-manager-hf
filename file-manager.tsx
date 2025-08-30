"use client"

import React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { cn } from "@/lib/utils"
import {
  Bell,
  Grid,
  LayoutGrid,
  Plus,
  Search,
  Upload,
  FolderPlus,
  File,
  Folder,
  MoreVertical,
  Download,
  Trash2,
  Users,
  Calendar,
  LogOut,
  Home,
  ChevronRight,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Image from "next/image"
import Link from "next/link"
import { useState, useRef } from "react"
import { LoginForm } from "./components/login-form"
import { AdminPanel, type User } from "./components/admin-panel"
import { FilePreview } from "./components/file-preview"
import { LeaveManagement, type LeaveRequest } from "./components/leave-management"
import { DashboardOverview } from "./components/dashboard-overview"

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

interface NavItemProps {
  href: string
  icon: React.ReactNode
  children: React.ReactNode
  active?: boolean
  onClick?: () => void
  badge?: number
}

function NavItem({ href, icon, children, active, onClick, badge }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 text-left transition-colors",
        active && "bg-blue-50 text-blue-700 border border-blue-200",
      )}
    >
      <div className="flex items-center gap-2">
        {icon}
        <span>{children}</span>
      </div>
      {badge && badge > 0 && (
        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">{badge}</span>
      )}
    </button>
  )
}

function FolderItem({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
      onClick={onClick}
    >
      <Folder className="w-4 h-4 text-blue-500" />
      <span>{children}</span>
    </Link>
  )
}

function FileCard({
  item,
  onDelete,
  onPreview,
}: {
  item: FileItem
  onDelete: (id: string) => void
  onPreview: (item: FileItem) => void
}) {
  const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return <File className="w-8 h-8 text-gray-400" />

    if (mimeType.includes("pdf")) return <File className="w-8 h-8 text-red-500" />
    if (mimeType.includes("word") || mimeType.includes("document")) return <File className="w-8 h-8 text-blue-500" />
    if (mimeType.includes("excel") || mimeType.includes("spreadsheet"))
      return <File className="w-8 h-8 text-green-500" />
    if (mimeType.includes("powerpoint") || mimeType.includes("presentation"))
      return <File className="w-8 h-8 text-orange-500" />
    if (mimeType.includes("image")) return <File className="w-8 h-8 text-purple-500" />

    return <File className="w-8 h-8 text-gray-400" />
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size"
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
  }

  return (
    <div className="group relative overflow-hidden rounded-lg border bg-white hover:shadow-lg transition-all duration-200 hover:border-blue-200">
      <div
        className="aspect-[4/3] overflow-hidden bg-gray-50 flex items-center justify-center cursor-pointer"
        onClick={() => item.type === "file" && onPreview(item)}
      >
        {item.type === "folder" ? (
          <Folder className="w-16 h-16 text-blue-500" />
        ) : item.thumbnail ? (
          <Image
            src={item.thumbnail || "/placeholder.svg"}
            alt={item.name}
            width={400}
            height={300}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          getFileIcon(item.mimeType)
        )}
        {item.type === "file" && (
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button size="sm" variant="secondary" className="gap-2 shadow-lg">
                <Search className="w-4 h-4" />
                Preview
              </Button>
            </div>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
            <p className="text-sm text-gray-500">
              {item.type === "folder" ? "Folder" : formatFileSize(item.size)} • {item.lastModified.toLocaleDateString()}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {item.type === "file" && (
                <DropdownMenuItem onClick={() => onPreview(item)}>
                  <Search className="w-4 h-4 mr-2" />
                  Preview
                </DropdownMenuItem>
              )}
              <DropdownMenuItem>
                <Download className="w-4 h-4 mr-2" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600" onClick={() => onDelete(item.id)}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}

function CreateFolderDialog({ onCreateFolder }: { onCreateFolder: (name: string) => void }) {
  const [folderName, setFolderName] = useState("")
  const [open, setOpen] = useState(false)

  const handleCreate = () => {
    if (folderName.trim()) {
      onCreateFolder(folderName.trim())
      setFolderName("")
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 bg-transparent">
          <FolderPlus className="h-4 w-4" />
          Create folder
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="folder-name">Folder Name</Label>
            <Input
              id="folder-name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Enter folder name"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!folderName.trim()}>
              Create
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function FileManager() {
  const [files, setFiles] = useState<FileItem[]>([
    {
      id: "1",
      name: "Q4 Sales Deck",
      type: "folder",
      lastModified: new Date("2024-01-15"),
    },
    {
      id: "2",
      name: "Product Videos",
      type: "folder",
      lastModified: new Date("2024-01-10"),
    },
    {
      id: "3",
      name: "ROI Calculator.xlsx",
      type: "file",
      size: 2048000,
      lastModified: new Date("2024-01-08"),
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  ])

  const [currentPath, setCurrentPath] = useState("/")
  const [searchQuery, setSearchQuery] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [activeView, setActiveView] = useState<"dashboard" | "files" | "admin" | "leave">("dashboard")
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      name: "John Admin",
      email: "admin@company.com",
      role: "admin",
      department: "IT",
      status: "active",
      createdAt: new Date("2024-01-01"),
    },
    {
      id: "2",
      name: "Jane Manager",
      email: "jane@company.com",
      role: "manager",
      department: "HR",
      status: "active",
      createdAt: new Date("2024-01-05"),
    },
    {
      id: "3",
      name: "Bob Employee",
      email: "bob@company.com",
      role: "employee",
      department: "Sales",
      status: "active",
      createdAt: new Date("2024-01-10"),
    },
  ])

  const [previewFile, setPreviewFile] = useState<FileItem | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const pendingLeaveRequests = 2 // This would come from actual data

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(event.target.files || [])

    const newFiles: FileItem[] = uploadedFiles.map((file) => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: "file" as const,
      size: file.size,
      lastModified: new Date(file.lastModified),
      mimeType: file.type,
      content: file,
    }))

    setFiles((prev) => [...prev, ...newFiles])

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleCreateFolder = (name: string) => {
    const newFolder: FileItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name,
      type: "folder",
      lastModified: new Date(),
    }

    setFiles((prev) => [...prev, newFolder])
  }

  const handleDeleteFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id))
  }

  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    // Simulate authentication
    const user = users.find((u) => u.email === email)
    if (user && password === "password") {
      setCurrentUser(user)
      setIsAuthenticated(true)
      return true
    }
    return false
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setIsAuthenticated(false)
    setActiveView("dashboard")
  }

  const handleAddUser = (userData: Omit<User, "id" | "createdAt">) => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date(),
    }
    setUsers((prev) => [...prev, newUser])
  }

  const handleUpdateUser = (id: string, updates: Partial<User>) => {
    setUsers((prev) => prev.map((user) => (user.id === id ? { ...user, ...updates } : user)))
  }

  const handleDeleteUser = (id: string) => {
    setUsers((prev) => prev.filter((user) => user.id !== id))
  }

  const handlePreviewFile = (file: FileItem) => {
    setPreviewFile(file)
    setIsPreviewOpen(true)
  }

  const handleClosePreview = () => {
    setIsPreviewOpen(false)
    setPreviewFile(null)
  }

  const handleSubmitLeave = (
    request: Omit<LeaveRequest, "id" | "appliedDate" | "employeeId" | "employeeName" | "department">,
  ) => {
    console.log("[v0] Leave request submitted:", request)
    // In a real app, this would send to backend
  }

  const handleApproveLeave = (id: string, comments?: string) => {
    console.log("[v0] Leave approved:", id, comments)
    // In a real app, this would update the backend
  }

  const handleRejectLeave = (id: string, comments?: string) => {
    console.log("[v0] Leave rejected:", id, comments)
    // In a real app, this would update the backend
  }

  const getBreadcrumbs = () => {
    switch (activeView) {
      case "dashboard":
        return [{ label: "Dashboard", href: "#" }]
      case "files":
        return [
          { label: "Dashboard", href: "#", onClick: () => setActiveView("dashboard") },
          { label: "Files", href: "#" },
        ]
      case "admin":
        return [
          { label: "Dashboard", href: "#", onClick: () => setActiveView("dashboard") },
          { label: "User Management", href: "#" },
        ]
      case "leave":
        return [
          { label: "Dashboard", href: "#", onClick: () => setActiveView("dashboard") },
          { label: "Leave Management", href: "#" },
        ]
      default:
        return [{ label: "Dashboard", href: "#" }]
    }
  }

  const filteredFiles = files.filter((file) => file.name.toLowerCase().includes(searchQuery.toLowerCase()))

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Enhanced Sidebar */}
      <div className="w-64 border-r bg-white shadow-sm">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-gray-900">File Manager</h1>
          <p className="text-sm text-gray-600">Welcome, {currentUser?.name}</p>
        </div>
        <nav className="space-y-1 p-2">
          <NavItem
            href="#"
            icon={<Home className="h-4 w-4" />}
            active={activeView === "dashboard"}
            onClick={() => setActiveView("dashboard")}
          >
            Dashboard
          </NavItem>
          <NavItem
            href="#"
            icon={<LayoutGrid className="h-4 w-4" />}
            active={activeView === "files"}
            onClick={() => setActiveView("files")}
          >
            All content
          </NavItem>
          <NavItem href="#" icon={<File className="h-4 w-4" />}>
            Documents
          </NavItem>
          <NavItem href="#" icon={<Upload className="h-4 w-4" />}>
            Recent uploads
          </NavItem>

          {currentUser?.role === "admin" && (
            <>
              <div className="py-2">
                <div className="px-3 text-xs font-medium uppercase text-gray-500 mb-2">Administration</div>
                <NavItem
                  href="#"
                  icon={<Users className="h-4 w-4" />}
                  active={activeView === "admin"}
                  onClick={() => setActiveView("admin")}
                >
                  User Management
                </NavItem>
              </div>
            </>
          )}

          <div className="py-2">
            <div className="px-3 text-xs font-medium uppercase text-gray-500 mb-2">Leave Management</div>
            <NavItem
              href="#"
              icon={<Calendar className="h-4 w-4" />}
              active={activeView === "leave"}
              onClick={() => setActiveView("leave")}
              badge={
                currentUser?.role === "admin" || currentUser?.role === "manager" ? pendingLeaveRequests : undefined
              }
            >
              My Leaves
            </NavItem>
          </div>

          <div className="py-3">
            <div className="px-3 text-xs font-medium uppercase text-gray-500 mb-2">Folders</div>
            <div className="space-y-1">
              <FolderItem href="#">Product Demos</FolderItem>
              <FolderItem href="#">Case Studies</FolderItem>
              <FolderItem href="#">Sales Collateral</FolderItem>
              <FolderItem href="#">Training Materials</FolderItem>
            </div>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Enhanced Header with Breadcrumbs */}
        <header className="border-b bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <Breadcrumb>
                <BreadcrumbList>
                  {getBreadcrumbs().map((crumb, index) => (
                    <React.Fragment key={index}>
                      {index > 0 && (
                        <BreadcrumbSeparator>
                          <ChevronRight className="h-4 w-4" />
                        </BreadcrumbSeparator>
                      )}
                      <BreadcrumbItem>
                        {index === getBreadcrumbs().length - 1 ? (
                          <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink
                            href={crumb.href}
                            onClick={crumb.onClick}
                            className="cursor-pointer hover:text-blue-600"
                          >
                            {crumb.label}
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="flex items-center gap-4">
              {activeView === "files" && (
                <div className="w-96">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="search"
                      placeholder="Search files..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              )}
              <Button variant="ghost" size="icon">
                <Grid className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                {pendingLeaveRequests > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {pendingLeaveRequests}
                  </span>
                )}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <div className="h-8 w-8 overflow-hidden rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {currentUser?.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm">{currentUser?.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 overflow-auto">
          {activeView === "dashboard" && (
            <DashboardOverview
              currentUser={currentUser}
              files={files}
              users={users}
              onNavigate={setActiveView}
              onUploadClick={() => fileInputRef.current?.click()}
            />
          )}

          {activeView === "files" && (
            <>
              <div className="mb-6 flex items-center gap-4">
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4" />
                  Create
                </Button>
                <Button
                  variant="outline"
                  className="gap-2 bg-transparent"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                  Upload
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
                />
                <CreateFolderDialog onCreateFolder={handleCreateFolder} />
              </div>

              <div className="mb-6">
                <Tabs defaultValue="recent">
                  <TabsList>
                    <TabsTrigger value="recent">Recent</TabsTrigger>
                    <TabsTrigger value="starred">Starred</TabsTrigger>
                    <TabsTrigger value="shared">Shared</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredFiles.map((item) => (
                  <FileCard key={item.id} item={item} onDelete={handleDeleteFile} onPreview={handlePreviewFile} />
                ))}
              </div>

              {filteredFiles.length === 0 && (
                <div className="text-center py-12">
                  <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchQuery ? "Try adjusting your search terms" : "Upload your first file to get started"}
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => fileInputRef.current?.click()} className="gap-2">
                      <Upload className="h-4 w-4" />
                      Upload Files
                    </Button>
                  )}
                </div>
              )}
            </>
          )}

          {activeView === "admin" && currentUser?.role === "admin" && (
            <AdminPanel
              users={users}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {activeView === "leave" && (
            <LeaveManagement
              currentUser={currentUser}
              users={users}
              onSubmitLeave={handleSubmitLeave}
              onApproveLeave={handleApproveLeave}
              onRejectLeave={handleRejectLeave}
            />
          )}
        </div>
      </div>

      <FilePreview file={previewFile} isOpen={isPreviewOpen} onClose={handleClosePreview} />
    </div>
  )
}
