"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  MessageSquare, 
  Send, 
  Phone, 
  Video, 
  MoreVertical, 
  Search,
  Users,
  Filter,
  Target,
  Bell
} from "lucide-react"
import { mockCustomers } from "@/lib/auth"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  sender: "customer" | "support"
  message: string
  timestamp: string
  read: boolean
  customerId: string
}

export function AdminChatTelegram() {
  const [selectedCustomerId, setSelectedCustomerId] = useState("1")
  const [newMessage, setNewMessage] = useState("")
  const [isMobile, setIsMobile] = useState(false)
  const [showCustomerList, setShowCustomerList] = useState(true)
  
  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      // On mobile, hide customer list when chat is active
      if (mobile && selectedCustomerId) {
        setShowCustomerList(false)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [selectedCustomerId])
  // Simulate chat messages per customer
  const [messages, setMessages] = useState<Record<string, Message[]>>({
    "1": [
      { id: "1", sender: "customer", message: "Hi, I have a question about my service.", timestamp: "10:32 AM", read: true, customerId: "1" },
      { id: "2", sender: "support", message: "Hello! How can I help you?", timestamp: "10:33 AM", read: true, customerId: "1" },
    ],
    "2": [
      { id: "1", sender: "customer", message: "Can I get an update on my project?", timestamp: "11:00 AM", read: true, customerId: "2" },
      { id: "2", sender: "support", message: "Sure! Let me check for you.", timestamp: "11:01 AM", read: true, customerId: "2" },
    ],
  })
  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomerId(customerId)
    if (isMobile) {
      setShowCustomerList(false)
    }
  }

  const handleBackToList = () => {
    if (isMobile) {
      setShowCustomerList(true)
    }
  }
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, selectedCustomerId])

  const sendMessage = () => {
    if (!newMessage.trim()) return
    const message: Message = {
      id: Date.now().toString(),
      sender: "support",
      message: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      read: false,
      customerId: selectedCustomerId,
    }
    setMessages((prev) => ({
      ...prev,
      [selectedCustomerId]: [...(prev[selectedCustomerId] || []), message],
    }))
    setNewMessage("")
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Visual Hierarchy */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl" />
        <div className="relative lg:p-6 p-4 bg-card/80 backdrop-blur-sm border rounded-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 gap-4">
            <div className="flex items-center gap-4">
              <div className="lg:w-16 lg:h-16 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <MessageSquare className="lg:h-8 lg:w-8 h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="lg:text-3xl text-2xl font-bold text-card-foreground mb-2">
                  Customer Chat
                </h1>
                <p className="text-muted-foreground lg:text-lg text-base hidden sm:block">Real-time customer support and communication</p>
              </div>
            </div>
            <div className="flex items-center gap-3 lg:flex-row flex-col lg:w-auto w-full">
              <Badge variant="outline" className="bg-card/80 lg:text-lg text-base lg:px-4 px-3 lg:py-2 py-1.5">
                Live Support
              </Badge>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 lg:gap-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Customer Management</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Real-time Chat</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Support Analytics</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Customer Selection */}
      {isMobile && !showCustomerList && (
        <div className="lg:hidden">
          <Button
            variant="outline"
            onClick={handleBackToList}
            className="w-full justify-start gap-2 mb-4"
          >
            <Users className="h-4 w-4" />
            Back to Customer List
          </Button>
        </div>
      )}

      {/* Chat Interface */}
      <div className={cn(
        "flex bg-background rounded-lg shadow-lg overflow-hidden",
        isMobile ? "h-[500px] flex-col" : "h-[600px] flex-row"
      )}>
        {/* Sidebar: Customer List */}
        <div className={cn(
          "bg-card border-r flex flex-col transition-all duration-300",
          isMobile 
            ? showCustomerList 
              ? "w-full h-full" 
              : "hidden"
            : "w-80 h-full"
        )}>
          <CardHeader className="border-b bg-white lg:p-4 p-3">
            <div className="flex items-center justify-between">
              <CardTitle className="lg:text-lg text-base">Customers ({mockCustomers.length})</CardTitle>
              {isMobile && (
                <Badge variant="secondary" className="text-xs">
                  {selectedCustomerId ? 'Selected' : 'Choose Customer'}
                </Badge>
              )}
            </div>
            {!isMobile && (
              <div className="relative mt-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers..."
                  className="pl-9 h-9"
                />
              </div>
            )}
          </CardHeader>
          <div className="flex-1 overflow-y-auto">
            {mockCustomers.map((customer) => (
              <button
                key={customer.id}
                className={cn(
                  "w-full flex items-center gap-3 border-b hover:bg-muted transition text-left",
                  "lg:px-4 lg:py-3 px-3 py-4",
                  selectedCustomerId === customer.id ? "bg-muted border-l-4 border-l-primary" : ""
                )}
                onClick={() => handleCustomerSelect(customer.id)}
              >
                <Avatar className={cn("flex-shrink-0", isMobile ? "h-10 w-10" : "h-8 w-8")}>
                  <AvatarImage src="/placeholder-user.jpg" />
                  <AvatarFallback className="font-semibold">{customer.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className={cn(
                    "font-medium truncate", 
                    isMobile ? "text-base" : "text-sm"
                  )}>
                    {customer.name}
                  </div>
                  <div className={cn(
                    "text-muted-foreground truncate",
                    isMobile ? "text-sm" : "text-xs"
                  )}>
                    {customer.email}
                  </div>
                  {selectedCustomerId === customer.id && (
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <span className="text-xs text-primary font-medium">Active</span>
                    </div>
                  )}
                </div>
                {isMobile && selectedCustomerId === customer.id && (
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <MessageSquare className="h-3 w-3 text-white" />
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
        {/* Chat Area */}
        <div className={cn(
          "flex flex-col transition-all duration-300",
          isMobile 
            ? showCustomerList 
              ? "hidden" 
              : "flex-1 h-full"
            : "flex-1 h-full"
        )}>
          <CardHeader className="border-b bg-white lg:p-4 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isMobile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToList}
                    className="p-1 h-8 w-8"
                  >
                    <Users className="h-4 w-4" />
                  </Button>
                )}
                <div className="flex items-center gap-3">
                  <Avatar className={isMobile ? "h-8 w-8" : "h-6 w-6"}>
                    <AvatarFallback className="text-xs font-semibold">
                      {mockCustomers.find(c => c.id === selectedCustomerId)?.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className={cn(
                      "truncate",
                      isMobile ? "text-base" : "text-lg"
                    )}>
                      {mockCustomers.find(c => c.id === selectedCustomerId)?.name || 'Select Customer'}
                    </CardTitle>
                    {!isMobile && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {mockCustomers.find(c => c.id === selectedCustomerId)?.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className={cn(
            "flex-1 overflow-y-auto",
            isMobile ? "p-3" : "p-4"
          )}>
            <div className="space-y-4">
              {(messages[selectedCustomerId] || []).map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "support" ? "justify-end" : "justify-start"}`}>
                  <div className={cn(
                    "p-3 rounded-lg shadow-sm",
                    isMobile ? "max-w-[85%]" : "max-w-xs",
                    msg.sender === "support" 
                      ? "bg-primary text-primary-foreground ml-auto" 
                      : "bg-muted"
                  )}>
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={msg.sender === "support" ? "/support-avatar.png" : "/placeholder-user.jpg"} />
                        <AvatarFallback className="text-xs">
                          {msg.sender === "support" ? "AD" : "CU"}
                        </AvatarFallback>
                      </Avatar>
                      <span className={cn(
                        "text-xs font-medium",
                        msg.sender === "support" ? "text-primary-foreground/90" : "text-muted-foreground"
                      )}>
                        {msg.sender === "support" ? "Admin" : "Customer"}
                      </span>
                    </div>
                    <div className={cn(
                      "leading-relaxed",
                      isMobile ? "text-sm" : "text-sm"
                    )}>
                      {msg.message}
                    </div>
                    <div className={cn(
                      "text-xs text-right mt-2",
                      msg.sender === "support" ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}>
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              ))}
              
              {messages[selectedCustomerId]?.length === 0 && (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No messages yet</p>
                  <p className="text-sm text-muted-foreground">Start a conversation with {mockCustomers.find(c => c.id === selectedCustomerId)?.name}</p>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </CardContent>
          <div className={cn(
            "border-t bg-white flex gap-2",
            isMobile ? "p-3" : "p-4"
          )}>
            <div className="flex-1 relative">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
                className={cn(
                  "pr-12",
                  isMobile ? "h-11" : "h-10"
                )}
              />
              {isMobile && (
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              )}
            </div>
            {!isMobile && (
              <Button 
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="px-6"
              >
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
