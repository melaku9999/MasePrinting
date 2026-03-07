// API routes for Task Management
// These are placeholder implementations that would connect to a backend

import { NextResponse } from 'next/server'
import { mockTasks } from '@/lib/auth'

// GET /api/tasks
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const assignedTo = searchParams.get('assignedTo') || ''
  const customerId = searchParams.get('customerId') || ''
  const serviceId = searchParams.get('serviceId') || ''
  const status = searchParams.get('status') || ''
  const priority = searchParams.get('priority') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  
  // In a real implementation, this would fetch from backend
  let tasks = [...mockTasks]
  
  // Apply filters
  if (assignedTo) {
    tasks = tasks.filter(t => t.assignedTo === assignedTo)
  }
  
  if (customerId) {
    tasks = tasks.filter(t => t.customerId === customerId)
  }
  
  if (serviceId) {
    tasks = tasks.filter(t => t.serviceId === serviceId)
  }
  
  if (status) {
    tasks = tasks.filter(t => t.status === status)
  }
  
  if (priority) {
    tasks = tasks.filter(t => t.priority === priority)
  }
  
  // Apply pagination
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedTasks = tasks.slice(startIndex, endIndex)
  
  return NextResponse.json({ 
    success: true, 
    tasks: paginatedTasks,
    pagination: {
      page,
      limit,
      total: tasks.length,
      pages: Math.ceil(tasks.length / limit)
    }
  })
}

// GET /api/tasks/{id}
export async function GET_byId(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  
  // In a real implementation, this would fetch from backend
  const task = mockTasks.find(t => t.id === id)
  
  if (task) {
    return NextResponse.json({ 
      success: true, 
      task 
    })
  }
  
  return NextResponse.json({ 
    success: false, 
    message: "Task not found" 
  }, { status: 404 })
}

// POST /api/tasks
export async function POST(request: Request) {
  const { title, description, customerId, serviceId, assignedTo, priority, dueDate } = await request.json()
  
  // In a real implementation, this would create task in backend
  const newTask = {
    id: `${Date.now()}`,
    title,
    description,
    customerId,
    serviceId,
    assignedTo,
    status: "pending",
    priority,
    dueDate,
    createdAt: new Date().toISOString(),
    progress: 0,
    subtasks: []
  }
  
  console.log('Creating task:', newTask)
  
  return NextResponse.json({ 
    success: true, 
    task: newTask 
  })
}

// PUT /api/tasks/{id}
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  const { title, description, customerId, serviceId, assignedTo, status, priority, dueDate } = await request.json()
  
  // In a real implementation, this would update task in backend
  const taskIndex = mockTasks.findIndex(t => t.id === id)
  
  if (taskIndex !== -1) {
    const updatedTask = {
      ...mockTasks[taskIndex],
      title,
      description,
      customerId,
      serviceId,
      assignedTo,
      status,
      priority,
      dueDate,
      updatedAt: new Date().toISOString()
    }
    
    console.log('Updating task:', updatedTask)
    
    return NextResponse.json({ 
      success: true, 
      task: updatedTask 
    })
  }
  
  return NextResponse.json({ 
    success: false, 
    message: "Task not found" 
  }, { status: 404 })
}

// DELETE /api/tasks/{id}
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  
  // In a real implementation, this would delete task from backend
  const taskIndex = mockTasks.findIndex(t => t.id === id)
  
  if (taskIndex !== -1) {
    const deletedTask = mockTasks[taskIndex]
    console.log('Deleting task:', deletedTask)
    
    return NextResponse.json({ 
      success: true, 
      message: "Task deleted successfully"
    })
  }
  
  return NextResponse.json({ 
    success: false, 
    message: "Task not found" 
  }, { status: 404 })
}

// PATCH /api/tasks/{id}/status
export async function PATCH_status(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  const { status } = await request.json()
  
  // In a real implementation, this would update task status in backend
  const taskIndex = mockTasks.findIndex(t => t.id === id)
  
  if (taskIndex !== -1) {
    const updatedTask = {
      ...mockTasks[taskIndex],
      status,
      completedAt: status === "completed" ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString()
    }
    
    console.log('Updating task status:', updatedTask)
    
    return NextResponse.json({ 
      success: true, 
      task: updatedTask 
    })
  }
  
  return NextResponse.json({ 
    success: false, 
    message: "Task not found" 
  }, { status: 404 })
}

// PATCH /api/tasks/{id}/assign
export async function PATCH_assign(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  const { assignedTo } = await request.json()
  
  // In a real implementation, this would assign task in backend
  const taskIndex = mockTasks.findIndex(t => t.id === id)
  
  if (taskIndex !== -1) {
    const updatedTask = {
      ...mockTasks[taskIndex],
      assignedTo,
      updatedAt: new Date().toISOString()
    }
    
    console.log('Assigning task:', updatedTask)
    
    return NextResponse.json({ 
      success: true, 
      task: updatedTask 
    })
  }
  
  return NextResponse.json({ 
    success: false, 
    message: "Task not found" 
  }, { status: 404 })
}

// GET /api/tasks/{id}/subtasks
export async function GET_subtasks(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  
  // In a real implementation, this would fetch subtasks from backend
  const task = mockTasks.find(t => t.id === id)
  
  if (task) {
    return NextResponse.json({ 
      success: true, 
      subtasks: task.subtasks 
    })
  }
  
  return NextResponse.json({ 
    success: false, 
    message: "Task not found" 
  }, { status: 404 })
}

// POST /api/tasks/{id}/subtasks
export async function POST_subtasks(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  const { title, assignedTo, requiresProof } = await request.json()
  
  // In a real implementation, this would create subtask in backend
  const taskIndex = mockTasks.findIndex(t => t.id === id)
  
  if (taskIndex !== -1) {
    const newSubTask = {
      id: `st_${Date.now()}`,
      title,
      completed: false,
      assignedTo,
      requiresProof,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    const updatedTask = {
      ...mockTasks[taskIndex],
      subtasks: [...mockTasks[taskIndex].subtasks, newSubTask],
      updatedAt: new Date().toISOString()
    }
    
    console.log('Creating subtask:', newSubTask)
    
    return NextResponse.json({ 
      success: true, 
      subtask: newSubTask,
      task: updatedTask
    })
  }
  
  return NextResponse.json({ 
    success: false, 
    message: "Task not found" 
  }, { status: 404 })
}

// PUT /api/tasks/{taskId}/subtasks/{subtaskId}
export async function PUT_subtasks(request: Request, { params }: { params: { taskId: string, subtaskId: string } }) {
  const { taskId, subtaskId } = params
  const { title, assignedTo, requiresProof, completed } = await request.json()
  
  // In a real implementation, this would update subtask in backend
  const taskIndex = mockTasks.findIndex(t => t.id === taskId)
  
  if (taskIndex !== -1) {
    const task = mockTasks[taskIndex]
    const subTaskIndex = task.subtasks.findIndex(st => st.id === subtaskId)
    
    if (subTaskIndex !== -1) {
      const updatedSubTask = {
        ...task.subtasks[subTaskIndex],
        title,
        assignedTo,
        requiresProof,
        completed,
        updatedAt: new Date().toISOString()
      }
      
      const updatedTask = {
        ...task,
        subtasks: task.subtasks.map((st, index) => 
          index === subTaskIndex ? updatedSubTask : st
        ),
        updatedAt: new Date().toISOString()
      }
      
      console.log('Updating subtask:', updatedSubTask)
      
      return NextResponse.json({ 
        success: true, 
        subtask: updatedSubTask,
        task: updatedTask
      })
    }
  }
  
  return NextResponse.json({ 
    success: false, 
    message: "Task or subtask not found" 
  }, { status: 404 })
}

// DELETE /api/tasks/{taskId}/subtasks/{subtaskId}
export async function DELETE_subtasks(request: Request, { params }: { params: { taskId: string, subtaskId: string } }) {
  const { taskId, subtaskId } = params
  
  // In a real implementation, this would delete subtask from backend
  const taskIndex = mockTasks.findIndex(t => t.id === taskId)
  
  if (taskIndex !== -1) {
    const task = mockTasks[taskIndex]
    const subTaskIndex = task.subtasks.findIndex(st => st.id === subtaskId)
    
    if (subTaskIndex !== -1) {
      const updatedTask = {
        ...task,
        subtasks: task.subtasks.filter((_, index) => index !== subTaskIndex),
        updatedAt: new Date().toISOString()
      }
      
      console.log('Deleting subtask:', subtaskId)
      
      return NextResponse.json({ 
        success: true, 
        message: "Subtask deleted successfully",
        task: updatedTask
      })
    }
  }
  
  return NextResponse.json({ 
    success: false, 
    message: "Task or subtask not found" 
  }, { status: 404 })
}

// PATCH /api/tasks/{taskId}/subtasks/{subtaskId}/complete
export async function PATCH_completeSubtask(request: Request, { params }: { params: { taskId: string, subtaskId: string } }) {
  const { taskId, subtaskId } = params
  const { completed } = await request.json()
  
  // In a real implementation, this would update subtask completion in backend
  const taskIndex = mockTasks.findIndex(t => t.id === taskId)
  
  if (taskIndex !== -1) {
    const task = mockTasks[taskIndex]
    const subTaskIndex = task.subtasks.findIndex(st => st.id === subtaskId)
    
    if (subTaskIndex !== -1) {
      const updatedSubTask = {
        ...task.subtasks[subTaskIndex],
        completed,
        updatedAt: new Date().toISOString()
      }
      
      // Recalculate task progress
      const totalSubtasks = task.subtasks.length
      const completedSubtasks = task.subtasks.filter((st, index) => 
        index === subTaskIndex ? completed : st.completed
      ).length
      const progress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0
      
      const updatedTask = {
        ...task,
        subtasks: task.subtasks.map((st, index) => 
          index === subTaskIndex ? updatedSubTask : st
        ),
        progress,
        updatedAt: new Date().toISOString()
      }
      
      console.log('Completing subtask:', updatedSubTask)
      
      return NextResponse.json({ 
        success: true, 
        subtask: updatedSubTask,
        task: updatedTask
      })
    }
  }
  
  return NextResponse.json({ 
    success: false, 
    message: "Task or subtask not found" 
  }, { status: 404 })
}

// POST /api/tasks/{taskId}/subtasks/{subtaskId}/proof
export async function POST_proof(request: Request, { params }: { params: { taskId: string, subtaskId: string } }) {
  const { taskId, subtaskId } = params
  // In a real implementation, this would handle file upload
  
  // For now, we'll just simulate proof submission
  console.log(`Submitting proof for subtask ${subtaskId} in task ${taskId}`)
  
  return NextResponse.json({ 
    success: true, 
    message: "Proof submitted successfully"
  })
}