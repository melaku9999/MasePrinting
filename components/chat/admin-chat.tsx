import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Message {
  id: string
  sender: "customer" | "support"
  message: string
  timestamp: string
  read: boolean
}

interface AdminChatProps {
  initialMessages?: Message[]
}

export function AdminChat({ initialMessages = [] }: AdminChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = () => {
    if (!newMessage.trim()) return
    const message: Message = {
      id: Date.now().toString(),
      sender: "support",
      message: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      read: false,
    }
    setMessages((prev) => [...prev, message])
    setNewMessage("")
  }

  return (
    <Card className="h-[500px] flex flex-col">
      <CardHeader className="border-b bg-white">
        <CardTitle>Customer Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4">
        {messages.map((msg) => (
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
    </Card>
  )
}
