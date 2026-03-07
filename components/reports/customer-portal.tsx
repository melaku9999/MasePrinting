"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Plus, Clock, CheckCircle2, AlertTriangle, Send } from "lucide-react"

// Mock support ticket data
const supportTickets = [
  {
    id: "1",
    title: "Website loading slowly",
    description: "The website has been loading very slowly for the past few days",
    status: "open",
    priority: "medium",
    createdAt: "2024-02-20",
    updatedAt: "2024-02-21",
    responses: 2,
  },
  {
    id: "2",
    title: "Email integration not working",
    description: "Unable to receive emails through the contact form",
    status: "in-progress",
    priority: "high",
    createdAt: "2024-02-18",
    updatedAt: "2024-02-22",
    responses: 5,
  },
]

export function CustomerPortal() {
  const [activeTab, setActiveTab] = useState("tickets")
  const [newTicket, setNewTicket] = useState({
    title: "",
    description: "",
    priority: "medium",
  })

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Submitting support ticket:", newTicket)
    setNewTicket({ title: "", description: "", priority: "medium" })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-yellow-500 text-white"
      case "in-progress":
        return "bg-primary text-primary-foreground"
      case "resolved":
        return "bg-secondary text-secondary-foreground"
      case "closed":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 border-red-600"
      case "medium":
        return "text-orange-600 border-orange-600"
      case "low":
        return "text-green-600 border-green-600"
      default:
        return "text-muted-foreground border-muted-foreground"
    }
  }

  return (
    <div className="space-y-6 w-full overflow-hidden">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-card-foreground break-words">Customer Support Portal</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 w-full overflow-hidden">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
          <TabsTrigger value="new-ticket">Create Ticket</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-6 w-full overflow-hidden">
          {/* Ticket Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            <Card className="w-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {supportTickets.filter((t) => t.status === "open").length}
                </div>
                <p className="text-xs text-muted-foreground">Awaiting response</p>
              </CardContent>
            </Card>

            <Card className="w-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {supportTickets.filter((t) => t.status === "in-progress").length}
                </div>
                <p className="text-xs text-muted-foreground">Being worked on</p>
              </CardContent>
            </Card>

            <Card className="w-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-secondary">8</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card className="w-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-secondary">2.5h</div>
                <p className="text-xs text-muted-foreground">Response time</p>
              </CardContent>
            </Card>
          </div>

          {/* Tickets List */}
          <div className="space-y-4 w-full">
            {supportTickets.map((ticket) => (
              <Card key={ticket.id} className="hover:shadow-md transition-shadow w-full">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-card-foreground break-words">{ticket.title}</h3>
                        <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                        <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 break-words">{ticket.description}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                      <span>Updated: {new Date(ticket.updatedAt).toLocaleDateString()}</span>
                      <span>{ticket.responses} responses</span>
                    </div>
                    <Button variant="outline" size="sm" className="bg-transparent w-full sm:w-auto">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {supportTickets.length === 0 && (
            <Card className="w-full">
              <CardContent className="p-8 text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No support tickets yet.</p>
                <Button className="mt-4" onClick={() => setActiveTab("new-ticket")}>
                  Create Your First Ticket
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="new-ticket" className="w-full">
          <Card className="max-w-2xl mx-auto w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create Support Ticket
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitTicket} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Subject *</Label>
                  <Input
                    id="title"
                    value={newTicket.title}
                    onChange={(e) => setNewTicket((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Brief description of the issue"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={newTicket.priority}
                    onValueChange={(value) => setNewTicket((prev) => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - General inquiry</SelectItem>
                      <SelectItem value="medium">Medium - Issue affecting work</SelectItem>
                      <SelectItem value="high">High - Critical issue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={newTicket.description}
                    onChange={(e) => setNewTicket((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Please provide detailed information about the issue, including steps to reproduce if applicable"
                    rows={6}
                    required
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                  <Button type="submit" className="w-full sm:w-1/2">
                    <Send className="h-4 w-4 mr-2" />
                    Submit Ticket
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab("tickets")}
                    className="w-full sm:w-1/2 bg-transparent"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}