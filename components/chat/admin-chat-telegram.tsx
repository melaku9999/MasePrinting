import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { mockCustomers } from "@/lib/auth"

interface Message {
  id: string
  sender: "customer" | "support"
  message: string
  timestamp: string
  read: boolean
  customerId: string
}

export function AdminChatTelegram() {
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
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(mockCustomers[0]?.id || "")
  const [newMessage, setNewMessage] = useState("")
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
    <div className="flex h-[600px] bg-background rounded-lg shadow-lg overflow-hidden">
      {/* Sidebar: Customer List */}
      <div className="w-80 bg-card border-r flex flex-col">
        <CardHeader className="border-b bg-white">
          <CardTitle>Customers</CardTitle>
        </CardHeader>
        <div className="flex-1 overflow-y-auto">
          {mockCustomers.map((customer) => (
            <button
              key={customer.id}
              className={`w-full flex items-center gap-3 px-4 py-3 border-b hover:bg-muted transition text-left ${selectedCustomerId === customer.id ? "bg-muted" : ""}`}
              onClick={() => setSelectedCustomerId(customer.id)}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{customer.name}</div>
                <div className="text-xs text-muted-foreground truncate">{customer.email}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <CardHeader className="border-b bg-white">
          <CardTitle>Chat with {mockCustomers.find(c => c.id === selectedCustomerId)?.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4">
          {(messages[selectedCustomerId] || []).map((msg) => (
            <div key={msg.id} className={`flex mb-4 ${msg.sender === "support" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-xs p-3 rounded-lg ${msg.sender === "support" ? "bg-blue-100" : "bg-gray-100"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={msg.sender === "support" ? "/support-avatar.png" : "/placeholder-user.jpg"} />
                    <AvatarFallback>{msg.sender === "support" ? "AD" : "CU"}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">{msg.sender === "support" ? "Admin" : "Customer"}</span>
                </div>
                <div className="text-sm">{msg.message}</div>
                <div className="text-xs text-muted-foreground text-right mt-1">{msg.timestamp}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </CardContent>
        <div className="border-t p-4 bg-white flex gap-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) sendMessage()
            }}
          />
          <Button onClick={sendMessage}>Send</Button>
        </div>
      </div>
    </div>
  )
}
