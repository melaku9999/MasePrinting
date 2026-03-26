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
  
  // Log attempt with formatted message
  console.log(`[WebSocket] Connecting to: ${wsUrl}`)
  
  let socket: WebSocket;
  try {
    socket = new WebSocket(wsUrl)
  } catch (e) {
    console.error('[WebSocket] Failed to create WebSocket:', e)
    return () => {}
  }

  socket.onopen = () => {
    console.log('[WebSocket] Connection established')
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
    console.error('[WebSocket] Error occurred:', error)
    // If the error object is empty, it's often a connection failure
    if (Object.keys(error).length === 0) {
      console.error('[WebSocket] Error info unavailable. Check if the server is running and the URL is correct.')
    }
    socket.close()
  }

  return () => socket.close()
}
