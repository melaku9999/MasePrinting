import { BACKEND_URL } from "./api"

export type TaskUpdateMessage = {
  message: string
  data: {
    id: number
    title: string
    status: string
    assigned_to: number | null
    customer: number | null
  }
}

type OnUpdate = (data: TaskUpdateMessage) => void

export function connectTaskSocket(onUpdate: OnUpdate) {
  // Derive WebSocket URL from BACKEND_URL
  const wsBase = BACKEND_URL.replace(/^http/, 'ws')
  const wsUrl = `${wsBase}/ws/tasks/`
  
  console.log(`Attempting WebSocket connection to: ${wsUrl}`)
  const socket = new WebSocket(wsUrl)

  socket.onopen = () => {
    console.log('Connected to Task WebSocket')
  }

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      onUpdate(data)
    } catch (e) {
      console.error('Failed to parse WebSocket message', e)
    }
  }

  socket.onclose = (event) => {
    console.log('Task WebSocket disconnected, retrying in 3 seconds...', event.reason)
    setTimeout(() => connectTaskSocket(onUpdate), 3000)
  }

  socket.onerror = (error) => {
    console.error('Task WebSocket error', error)
    socket.close()
  }

  return () => socket.close()
}
