"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Plus, Clock, CheckCircle, XCircle, AlertCircle, Users } from "lucide-react"

export interface LeaveRequest {
  id: string
  employeeId: string
  employeeName: string
  department: string
  leaveType: "vacation" | "sick" | "personal" | "emergency"
  startDate: Date
  endDate: Date
  days: number
  reason: string
  status: "pending" | "approved" | "rejected"
  appliedDate: Date
  approvedBy?: string
  approvedDate?: Date
  comments?: string
}

export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "manager" | "employee"
  department: string
  status: "active" | "inactive"
  createdAt: Date
}

interface LeaveManagementProps {
  currentUser: User
  users: User[]
  onSubmitLeave: (
    request: Omit<LeaveRequest, "id" | "appliedDate" | "employeeId" | "employeeName" | "department">,
  ) => void
  onApproveLeave: (id: string, comments?: string) => void
  onRejectLeave: (id: string, comments?: string) => void
}

function LeaveRequestDialog({
  currentUser,
  onSubmitLeave,
}: {
  currentUser: User
  onSubmitLeave: (
    request: Omit<LeaveRequest, "id" | "appliedDate" | "employeeId" | "employeeName" | "department">,
  ) => void
}) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    leaveType: "vacation" as const,
    startDate: "",
    endDate: "",
    reason: "",
  })

  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.startDate && formData.endDate && formData.reason) {
      const days = calculateDays(formData.startDate, formData.endDate)
      onSubmitLeave({
        leaveType: formData.leaveType,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        days,
        reason: formData.reason,
        status: "pending",
      })
      setFormData({
        leaveType: "vacation",
        startDate: "",
        endDate: "",
        reason: "",
      })
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Request Leave
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Leave</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="leave-type">Leave Type</Label>
            <Select
              value={formData.leaveType}
              onValueChange={(value: any) => setFormData({ ...formData, leaveType: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vacation">Vacation</SelectItem>
                <SelectItem value="sick">Sick Leave</SelectItem>
                <SelectItem value="personal">Personal Leave</SelectItem>
                <SelectItem value="emergency">Emergency Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
          </div>
          {formData.startDate && formData.endDate && (
            <div className="text-sm text-gray-600">
              Duration: {calculateDays(formData.startDate, formData.endDate)} day(s)
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Please provide a reason for your leave request"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Submit Request</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function LeaveApprovalDialog({
  request,
  onApprove,
  onReject,
}: {
  request: LeaveRequest
  onApprove: (id: string, comments?: string) => void
  onReject: (id: string, comments?: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [comments, setComments] = useState("")
  const [action, setAction] = useState<"approve" | "reject" | null>(null)

  const handleSubmit = () => {
    if (action === "approve") {
      onApprove(request.id, comments)
    } else if (action === "reject") {
      onReject(request.id, comments)
    }
    setOpen(false)
    setComments("")
    setAction(null)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Review
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Review Leave Request</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Employee:</strong> {request.employeeName}
            </div>
            <div>
              <strong>Department:</strong> {request.department}
            </div>
            <div>
              <strong>Leave Type:</strong> {request.leaveType}
            </div>
            <div>
              <strong>Duration:</strong> {request.days} day(s)
            </div>
            <div>
              <strong>Start Date:</strong> {request.startDate.toLocaleDateString()}
            </div>
            <div>
              <strong>End Date:</strong> {request.endDate.toLocaleDateString()}
            </div>
          </div>
          <div>
            <strong>Reason:</strong>
            <p className="text-sm text-gray-600 mt-1">{request.reason}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="comments">Comments (Optional)</Label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add any comments for the employee"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setAction("reject")
                handleSubmit()
              }}
            >
              Reject
            </Button>
            <Button
              onClick={() => {
                setAction("approve")
                handleSubmit()
              }}
            >
              Approve
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function LeaveManagement({
  currentUser,
  users,
  onSubmitLeave,
  onApproveLeave,
  onRejectLeave,
}: LeaveManagementProps) {
  const [leaveRequests] = useState<LeaveRequest[]>([
    {
      id: "1",
      employeeId: "3",
      employeeName: "Bob Employee",
      department: "Sales",
      leaveType: "vacation",
      startDate: new Date("2024-02-15"),
      endDate: new Date("2024-02-19"),
      days: 5,
      reason: "Family vacation to Hawaii",
      status: "pending",
      appliedDate: new Date("2024-01-20"),
    },
    {
      id: "2",
      employeeId: "2",
      employeeName: "Jane Manager",
      department: "HR",
      leaveType: "sick",
      startDate: new Date("2024-01-25"),
      endDate: new Date("2024-01-26"),
      days: 2,
      reason: "Medical appointment and recovery",
      status: "approved",
      appliedDate: new Date("2024-01-22"),
      approvedBy: "John Admin",
      approvedDate: new Date("2024-01-23"),
    },
    {
      id: "3",
      employeeId: "3",
      employeeName: "Bob Employee",
      department: "Sales",
      leaveType: "personal",
      startDate: new Date("2024-01-10"),
      endDate: new Date("2024-01-10"),
      days: 1,
      reason: "Personal matters",
      status: "rejected",
      appliedDate: new Date("2024-01-08"),
      approvedBy: "John Admin",
      approvedDate: new Date("2024-01-09"),
      comments: "Insufficient notice provided",
    },
  ])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
  }

  const myRequests = leaveRequests.filter((req) => req.employeeId === currentUser.id)
  const teamRequests =
    currentUser.role === "admin"
      ? leaveRequests
      : leaveRequests.filter((req) => {
          const employee = users.find((u) => u.id === req.employeeId)
          return employee?.department === currentUser.department
        })

  const leaveBalance = {
    vacation: 15,
    sick: 10,
    personal: 5,
    used: {
      vacation: 3,
      sick: 1,
      personal: 0,
    },
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Leave Management</h2>
          <p className="text-gray-600">Manage your leave requests and time off</p>
        </div>
        <LeaveRequestDialog currentUser={currentUser} onSubmitLeave={onSubmitLeave} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vacation Days</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leaveBalance.vacation - leaveBalance.used.vacation}</div>
            <p className="text-xs text-muted-foreground">
              {leaveBalance.used.vacation} used of {leaveBalance.vacation} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sick Days</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leaveBalance.sick - leaveBalance.used.sick}</div>
            <p className="text-xs text-muted-foreground">
              {leaveBalance.used.sick} used of {leaveBalance.sick} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Personal Days</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leaveBalance.personal - leaveBalance.used.personal}</div>
            <p className="text-xs text-muted-foreground">
              {leaveBalance.used.personal} used of {leaveBalance.personal} total
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="my-requests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="my-requests">My Requests</TabsTrigger>
          {(currentUser.role === "admin" || currentUser.role === "manager") && (
            <TabsTrigger value="team-requests">Team Requests</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="my-requests">
          <Card>
            <CardHeader>
              <CardTitle>My Leave Requests</CardTitle>
              <CardDescription>View and track your leave request history</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="capitalize">{request.leaveType}</TableCell>
                      <TableCell>
                        {request.startDate.toLocaleDateString()} - {request.endDate.toLocaleDateString()}
                      </TableCell>
                      <TableCell>{request.days}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(request.status)}
                          {getStatusBadge(request.status)}
                        </div>
                      </TableCell>
                      <TableCell>{request.appliedDate.toLocaleDateString()}</TableCell>
                      <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {(currentUser.role === "admin" || currentUser.role === "manager") && (
          <TabsContent value="team-requests">
            <Card>
              <CardHeader>
                <CardTitle>Team Leave Requests</CardTitle>
                <CardDescription>Review and approve leave requests from your team</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.employeeName}</TableCell>
                        <TableCell>{request.department}</TableCell>
                        <TableCell className="capitalize">{request.leaveType}</TableCell>
                        <TableCell>
                          {request.startDate.toLocaleDateString()} - {request.endDate.toLocaleDateString()}
                        </TableCell>
                        <TableCell>{request.days}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(request.status)}
                            {getStatusBadge(request.status)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {request.status === "pending" && (
                            <LeaveApprovalDialog
                              request={request}
                              onApprove={onApproveLeave}
                              onReject={onRejectLeave}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
