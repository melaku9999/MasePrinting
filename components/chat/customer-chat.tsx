"use client"

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

interface CustomerChatProps {
  initialMessages?: Message[]
}

export function CustomerChat({ initialMessages = [] }: CustomerChatProps) {
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
      sender: "customer",
      message: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      read: false,
    }
    setMessages((prev) => [...prev, message])
    setNewMessage("")

    // Mock response from support
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        sender: "support",
        message: "Thank you for your message. An agent will be with you shortly.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        read: false,
      }
      setMessages((prev) => [...prev, response])
    }, 1000)
  }

  return (
    <Card className="h-[500px] flex flex-col border-none shadow-none">
      <CardHeader className="border-b bg-card">
        <CardTitle className="text-lg font-bold">Support Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/20 text-primary font-bold">SC</AvatarFallback>
              </Avatar>
            </div>
            <h3 className="font-bold text-lg mb-1">How can we help?</h3>
            <p className="text-sm text-muted-foreground">Start a conversation with our support team.</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === "customer" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl ${msg.sender === "customer" ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-muted text-foreground rounded-tl-none"}`}>
              <div className="flex items-center gap-2 mb-1">
                <Avatar className="h-5 w-5 border">
                  <AvatarFallback className="text-[10px] font-bold">
                    {msg.sender === "customer" ? "ME" : "SP"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-[10px] font-bold opacity-70 uppercase tracking-widest">
                  {msg.sender === "customer" ? "You" : "Support"}
                </span>
              </div>
              <div className="text-sm leading-relaxed">{msg.message}</div>
              <div className="text-[9px] opacity-70 text-right mt-1">{msg.timestamp}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </CardContent>
      <div className="p-4 bg-card border-t flex gap-2">
        <Input
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) sendMessage()
          }}
          className="rounded-xl border-none bg-muted/50 focus-visible:ring-primary/20"
        />
        <Button onClick={sendMessage} className="rounded-xl px-6 font-bold">Send</Button>
      </div>
    </Card>
  )
}
