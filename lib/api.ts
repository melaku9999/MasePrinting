// Centralized API service layer for all backend endpoints

// Base API configuration — configurable via env for Docker
// export const BACKEND_URL = 'https://api.maseprinting.com'
export const BACKEND_URL = 'http://localhost:9001'
const API_BASE_URL = `${BACKEND_URL}/api`

/**
 * Gets the full URL for a media file.
 */
export function getMediaUrl(path: string): string {
  if (!path) return ''
  if (path.startsWith('http')) return path
  // Prepend BACKEND_URL if it's a relative path start with /media
  return `${BACKEND_URL}${path.startsWith('/') ? '' : '/'}${path}`
}

// Helper function for API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Use the endpoint directly if it's a full URL, otherwise prepend API_BASE_URL
  let url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`

  // Ensure url ends with a slash if it doesn't have query params
  if (!url.includes('?') && !url.endsWith('/')) {
    url += '/'
  }

  // Get token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null

  const isFormData = options.body instanceof FormData
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...((options.headers as Record<string, string>) || {}),
  }

  // Inject Authorization header if token exists and not already provided
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const config: RequestInit = {
    ...options,
    headers,
  }

  try {
    const response = await fetch(url, config)

    if (response.status === 204) {
      return {} as T
    }

    if (!response.ok) {
      if (response.status === 401 && typeof window !== 'undefined' && !url.includes('/users/token')) {
        // Token expired or invalid - clear context and force re-authentication
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('cm_user')

        // Terminate the session and redirect to the login portal
        if (!window.location.pathname.includes('/login')) {
          window.location.replace('/login')
        }
      }

      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || errorData.error || `API request failed: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('API request error:', error)
    throw error
  }
}

// Authentication API
export const authApi = {
  login: (username: string, password: string) =>
    apiRequest<{ access: string; refresh: string; user: any }>('/users/token', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  logout: (refresh: string) =>
    apiRequest<{ message: string }>('/users/token/logout', {
      method: 'POST',
      body: JSON.stringify({ refresh }),
    }),

  getMe: () =>
    apiRequest<any>('/users/me'),

  refresh: (refresh: string) =>
    apiRequest<{ access: string; refresh: string }>('/users/token/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh }),
    }),
}

// Users API
export const usersApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string; role?: string }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    return apiRequest<{ results: any[]; count: number; next: string | null; previous: string | null }>(`/users/users/?${searchParams}`)
  },

  getById: (id: string) =>
    apiRequest<any>(`/users/users/${id}/`),

  create: (userData: { username: string; email: string; name: string; role: string; password: string }) =>
    apiRequest<any>('/users/', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  update: (id: string, userData: any) =>
    apiRequest<any>(`/users/users/${id}/update/`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    }),

  delete: (id: string) =>
    apiRequest<{ success: boolean; message: string }>(`/users/users/${id}/delete/`, {
      method: 'DELETE',
    }),

  getProfile: () =>
    apiRequest<any>('/users/me/'),

  changePassword: (data: any) =>
    apiRequest<any>('/users/change-password/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

// Customers API
export const customersApi = {
  getAll: (params?: { page?: number; page_size?: number; search?: string; status?: string; business_type?: string }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    return apiRequest<{ results: any[]; count: number; next: string | null; previous: string | null }>(`/customers/list/?${searchParams}`)
  },

  getListMin: (params?: { business_type?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.business_type) searchParams.append('business_type', params.business_type)
    const query = searchParams.toString()
    return apiRequest<Array<{ customer_id: number, name: string, email: string }>>(`/customers/list-min/${query ? `?${query}` : ''}`)
  },

  getById: (id: string) =>
    apiRequest<any>(`/customers/${id}/`),

  create: (customerData: any) =>
    apiRequest<any>(`/customers/`, {
      method: 'POST',
      body: JSON.stringify(customerData),
    }),

  update: (id: string, customerData: any) =>
    apiRequest<any>(`/customers/${id}/update/`, {
      method: 'PATCH',
      body: JSON.stringify(customerData),
    }),

  delete: (id: string) =>
    apiRequest<{ success: boolean; message: string }>(`/customers/${id}/delete/`, {
      method: 'DELETE',
    }),

  getPayments: (id: string) =>
    apiRequest<any[]>(`/customers/${id}/payments/`),

  addPayment: (id: string, paymentData: any) =>
    apiRequest<any>(`/customers/${id}/payments/add/`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    }),
}

// Services API
export const servicesApi = {
  getAll: (params?: { page?: number; page_size?: number; search?: string; status?: string; category?: string }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    return apiRequest<{ results: any[]; count: number; next: string | null; previous: string | null }>(`/services/list/?${searchParams}`)
  },

  getById: (id: string) =>
    apiRequest<any>(`/services/${id}/`),

  create: (serviceData: any) =>
    apiRequest<any>(`/services/`, {
      method: 'POST',
      body: JSON.stringify(serviceData),
    }),

  update: (id: string, serviceData: any) =>
    apiRequest<any>(`/services/${id}/update/`, {
      method: 'PATCH',
      body: JSON.stringify(serviceData),
    }),

  delete: (id: string) =>
    apiRequest<{ success: boolean; message: string }>(`/services/${id}/delete/`, {
      method: 'DELETE',
    }),

  addToPending: (serviceId: string, customerId: string) =>
    apiRequest<any>(`/services/${serviceId}/pending/`, {
      method: 'POST',
      body: JSON.stringify({ customerId }),
    }),

  removeFromPending: (serviceId: string, customerId: string) =>
    apiRequest<any>(`/services/${serviceId}/remove-pending/`, {
      method: 'POST',
      body: JSON.stringify({ customerId }),
    }),

  subscribeCustomer: (serviceId: string, customerId: string, dueDate?: string) =>
    apiRequest<any>(`/services/${serviceId}/subscribe/`, {
      method: 'POST',
      body: JSON.stringify({ customerId, dueDate }),
    }),

  unsubscribeCustomer: (serviceId: string, customerId: string) =>
    apiRequest<any>(`/services/${serviceId}/unsubscribe/`, {
      method: 'POST',
      body: JSON.stringify({ customerId }),
    }),
}

// Employees API
export const employeesApi = {
  getAll: (params?: { page?: number; page_size?: number; search?: string; status?: string }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    return apiRequest<{ results: any[]; count: number; next: string | null; previous: string | null }>(`/employees/?${searchParams}`)
  },

  getById: (id: string) =>
    apiRequest<any>(`/employees/${id}/`),

  getTasks: (employeeId: string, params?: { page?: number; page_size?: number }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    return apiRequest<{ results: any[]; count: number; next: string | null; previous: string | null }>(`/tasks/employee/${employeeId}/?${searchParams}`)
  },

  create: (employeeData: any) =>
    apiRequest<any>(`/employees/create/`, {
      method: "POST",
      body: JSON.stringify(employeeData),
    }),

  update: (id: string, employeeData: any) =>
    apiRequest<any>(`/employees/${id}/update/`, {
      method: "PATCH",
      body: JSON.stringify(employeeData),
    }),
}

// Service Assignments API
export const serviceAssignmentsApi = {
  getAll: (params?: { customerId?: string; serviceId?: string; status?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    return apiRequest<{ success: boolean; assignments: any[]; pagination: any }>(`/service-assignments?${searchParams}`)
  },

  getById: (id: string) =>
    apiRequest<{ success: boolean; assignment: any }>(`/service-assignments/${id}`),

  create: (assignmentData: { customerId: string; serviceId: string; customPrice?: number; notes?: string; assignedTo?: string }) =>
    apiRequest<{ success: boolean; assignment: any }>('/service-assignments', {
      method: 'POST',
      body: JSON.stringify({
        ...assignmentData,
        assigned_to: assignmentData.assignedTo
      }),
    }),

  update: (id: string, assignmentData: { status?: string; customPrice?: number; notes?: string; assignedTo?: string }) =>
    apiRequest<{ success: boolean; assignment: any }>(`/service-assignments/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...assignmentData,
        assigned_to: assignmentData.assignedTo
      }),
    }),

  delete: (id: string) =>
    apiRequest<{ success: boolean; message: string }>(`/service-assignments/${id}`, {
      method: 'DELETE',
    }),

  getLastPaid: (customerId: string, serviceId: string) =>
    apiRequest<{ success: boolean; lastPaid: { amount: string; date: string } | null }>(
      `/service-assignments/get-last-paid/?customerId=${customerId}&serviceId=${serviceId}`
    ),
}

// Tasks API
export const tasksApi = {
  getAll: (params?: { page?: number; page_size?: number; assigned_to?: string; customer?: string; service?: string; status?: string; priority?: string; due_date_start?: string; due_date_end?: string }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    return apiRequest<{ results: any[]; count: number; next: string | null; previous: string | null }>(`/tasks/list/?${searchParams}`)
  },

  getAssigned: (params?: { page?: number; page_size?: number }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    return apiRequest<{ results: any[]; count: number; next: string | null; previous: string | null }>(`/tasks/assigned/?${searchParams}`)
  },

  getUnassigned: (params?: { page?: number; page_size?: number }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    return apiRequest<{ results: any[]; count: number; next: string | null; previous: string | null }>(`/tasks/unassigned/?${searchParams}`)
  },

  getById: (id: string) =>
    apiRequest<any>(`/tasks/${id}/`),

  create: (taskData: any) =>
    apiRequest<any>(`/tasks/`, {
      method: 'POST',
      body: JSON.stringify(taskData),
    }),

  update: (id: string, taskData: any) =>
    apiRequest<any>(`/tasks/${id}/update/`, {
      method: 'PATCH',
      body: JSON.stringify(taskData),
    }),

  assign: (id: string, assignedToId: number, subtasks_data?: any[]) =>
    apiRequest<any>(`/tasks/${id}/update/assign/`, {
      method: 'PATCH',
      body: JSON.stringify({ assigned_to_id: assignedToId, subtasks_data }),
    }),

  markSubtaskDone: (subtaskId: string) =>
    apiRequest<any>(`/tasks/subtasks/done/${subtaskId}/`, {
      method: 'PATCH',
    }),

  markSubtaskUndone: (subtaskId: string) =>
    apiRequest<any>(`/tasks/subtasks/undone/${subtaskId}/`, {
      method: 'PATCH',
    }),

  completeTask: (taskId: string) =>
    apiRequest<any>(`/tasks/${taskId}/complete-task/`, {
      method: 'POST',
    }),

  submitProof: (subtaskId: string, formData: FormData) =>
    apiRequest<any>(`/tasks/subtasks/done/${subtaskId}/`, {
      method: 'PATCH',
      body: formData, // FormData will handle Content-Type and boundary automatically
    }),

  uploadProofs: (subtaskId: string, formData: FormData) =>
    apiRequest<any>(`/tasks/subtasks/${subtaskId}/proofs/`, {
      method: 'POST',
      body: formData,
    }),

  downloadProof: (proofId: number) =>
    apiRequest<any>(`/tasks/proofs/${proofId}/download/`, {
      method: 'GET',
    }),

  deleteProof: (proofId: number) =>
    apiRequest<any>(`/tasks/proofs/${proofId}/delete/`, {
      method: 'DELETE',
    }),
}

// Files API
export const filesApi = {
  getAll: (params?: { customerId?: string; taskId?: string; search?: string; type?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    return apiRequest<{ success: boolean; files: any[]; pagination: any }>(`/files?${searchParams}`)
  },

  getById: (id: string) =>
    apiRequest<{ success: boolean; file: any }>(`/files/${id}`),

  create: (formData: FormData) =>
    apiRequest<{ success: boolean; file: any }>('/files', {
      method: 'POST',
      body: formData,
    }),

  update: (id: string, fileData: { name?: string; customerId?: string; taskId?: string }) =>
    apiRequest<{ success: boolean; file: any }>(`/files/${id}`, {
      method: 'PUT',
      body: JSON.stringify(fileData),
    }),

  delete: (id: string) =>
    apiRequest<{ success: boolean; message: string }>(`/files/${id}`, {
      method: 'DELETE',
    }),

  download: (id: string) =>
    apiRequest<{ success: boolean; file: any; downloadUrl: string }>(`/files/${id}/download`),

  addDeleteRemark: (id: string, remark: string) =>
    apiRequest<{ success: boolean; message: string }>(`/files/${id}/delete-remark`, {
      method: 'POST',
      body: JSON.stringify({ remark }),
    }),
}

// Box Files API
export const boxFilesApi = {
  list: () => apiRequest<any[]>('/boxfiles/'),
  getById: (id: number | string) => apiRequest<any>(`/boxfiles/${id}/`),
  checkout: (id: number | string, body: { notes: string; user_id: number }) =>
    apiRequest<any>(`/boxfiles/${id}/checkout/`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  checkin: (id: number | string, body: { notes: string; user_id: number }) =>
    apiRequest<any>(`/boxfiles/${id}/checkin/`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  createWithUpload: (formData: FormData) =>
    apiRequest<any>('/boxfile/upload/', {
      method: 'POST',
      body: formData,
    }),
}

// Documents API
export const documentsApi = {
  list: () => apiRequest<any[]>('/documents/'),
  getById: (id: number | string) => apiRequest<any>(`/documents/${id}/`),
  checkout: (id: number | string, body: { notes?: string; user_id: number }) =>
    apiRequest<any>(`/documents/${id}/checkout/`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  checkin: (id: number | string, body: { notes?: string; user_id: number }) =>
    apiRequest<any>(`/documents/${id}/checkin/`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  upload: (formData: FormData) =>
    apiRequest<any>('/documents/upload/', {
      method: 'POST',
      body: formData,
    }),
  download: async (id: number | string): Promise<Blob> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
    const url = `${API_BASE_URL}/document/download/${id}/`
    const res = await fetch(url, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
    if (!res.ok) {
      throw new Error(`Download failed: ${res.status} ${res.statusText}`)
    }
    return await res.blob()
  },
}

// Users API for selecting checkout/checkin user
export const usersDirectoryApi = {
  listUsers: () => apiRequest<any[]>('/users/users/'),
}

// Financial API
export const financialApi = {
  getPayments: (params?: { customerId?: string; type?: string; startDate?: string; endDate?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    return apiRequest<{ success: boolean; payments: any[]; pagination: any }>(`/financial/payments?${searchParams}`)
  },

  getPaymentById: (id: string) =>
    apiRequest<{ success: boolean; payment: any }>(`/financial/payments/${id}`),

  createPayment: (paymentData: { customerId: string; amount: number; notes: string; type: string; paymentMethod?: string }) =>
    apiRequest<{ success: boolean; payment: any }>('/financial/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    }),

  updatePayment: (id: string, paymentData: { amount?: number; notes?: string; type?: string; paymentMethod?: string }) =>
    apiRequest<{ success: boolean; payment: any }>(`/financial/payments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(paymentData),
    }),

  deletePayment: (id: string) =>
    apiRequest<{ success: boolean; message: string }>(`/financial/payments/${id}`, {
      method: 'DELETE',
    }),

  adjustBalance: (adjustmentData: { customerId: string; amount: number; notes: string }) =>
    apiRequest<{ success: boolean; adjustment: any }>('/balances/adjust', {
      method: 'POST',
      body: JSON.stringify(adjustmentData),
    }),

  getBalanceHistory: (params?: { customerId?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    return apiRequest<{ success: boolean; adjustments: any[]; pagination: any }>(`/balances/history?${searchParams}`)
  },
  getGlobalView: (params?: { branch?: string; start_date?: string; end_date?: string }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, String(value))
      })
    }
    const query = searchParams.toString()
    return apiRequest<{ sales: any[], payments: any[], expenses: any[] }>(`/financial/global-view/${query ? `?${query}` : ''}`)
  },
}

// Reminders API
export const remindersApi = {
  getAll: (params?: { status?: string; startDate?: string; endDate?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    return apiRequest<{ success: boolean; reminders: any[]; pagination: any }>(`/reminders?${searchParams}`)
  },

  getById: (id: string) =>
    apiRequest<{ success: boolean; reminder: any }>(`/reminders/${id}`),

  create: (reminderData: { title: string; description: string; scheduledTime: string; repeat?: string }) =>
    apiRequest<{ success: boolean; reminder: any }>('/reminders', {
      method: 'POST',
      body: JSON.stringify(reminderData),
    }),

  update: (id: string, reminderData: { title?: string; description?: string; scheduledTime?: string; repeat?: string; status?: string }) =>
    apiRequest<{ success: boolean; reminder: any }>(`/reminders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reminderData),
    }),

  delete: (id: string) =>
    apiRequest<{ success: boolean; message: string }>(`/reminders/${id}`, {
      method: 'DELETE',
    }),

  updateStatus: (id: string, status: string) =>
    apiRequest<{ success: boolean; reminder: any }>(`/reminders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
}

// Branches API
export const branchesApi = {
  getAll: () => apiRequest<any[]>('/branches/'),
  getOne: (id: number) => apiRequest<any>(`/branches/${id}/`),
  create: (data: any) => apiRequest<any>('/branches/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => apiRequest<any>(`/branches/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => apiRequest<any>(`/branches/${id}/`, { method: 'DELETE' }),
}

// Inventory API
export const inventoryApi = {
  getProducts: (params?: any) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    return apiRequest<any[]>(`/inventory/products/?${searchParams}`)
  },
  createProduct: (data: any) => apiRequest<any>('/inventory/products/', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: number, data: any) => apiRequest<any>(`/inventory/products/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteProduct: (id: number) => apiRequest<any>(`/inventory/products/${id}/`, { method: 'DELETE' }),
  getBatches: (params?: any) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    return apiRequest<any[]>(`/inventory/batches/?${searchParams}`)
  },
  createBatch: (data: any) => apiRequest<any>('/inventory/batches/', { method: 'POST', body: JSON.stringify(data) }),
  getTransfers: () => apiRequest<any[]>('/inventory/transfers/'),
  getStockRequests: (params?: any) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    return apiRequest<any[]>(`/inventory/stock-requests/?${searchParams}`)
  },
  createStockRequest: (data: any) => apiRequest<any>('/inventory/stock-requests/', { method: 'POST', body: JSON.stringify(data) }),
  updateStockRequest: (id: number, data: any) => apiRequest<any>(`/inventory/stock-requests/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteStockRequest: (id: number) => apiRequest<any>(`/inventory/stock-requests/${id}/`, { method: 'DELETE' }),
  processStockRequest: (id: number, action: 'approve' | 'reject', notes?: string) =>
    apiRequest<any>(`/inventory/stock-requests/${id}/process/`, {
      method: 'POST',
      body: JSON.stringify({ action, notes })
    }),
  createTransfer: (data: any) => apiRequest<any>('/inventory/transfers/', { method: 'POST', body: JSON.stringify(data) }),
  updateTransfer: (id: number, data: any) => apiRequest<any>(`/inventory/transfers/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTransfer: (id: number) => apiRequest<any>(`/inventory/transfers/${id}/`, { method: 'DELETE' }),
  getLowStockReport: (params?: any) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    return apiRequest<any[]>(`/inventory/low-stock/?${searchParams}`)
  },
  completeTransfer: (id: number) => apiRequest<any>(`/inventory/transfers/${id}/complete/`, { method: 'POST' }),
}

// Expenses API
export const expensesApi = {
  getAll: () => apiRequest<any[]>('/financial/expenses/'),
  create: (data: any) =>
    apiRequest<any>('/financial/expenses/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

// Sales API
export const salesApi = {
  getAll: (params?: any) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    return apiRequest<any[]>(`/sales/?${searchParams}`)
  },
  getOne: (id: number) => apiRequest<any>(`/sales/${id}/`),
  create: (data: any) => apiRequest<any>('/sales/', { method: 'POST', body: JSON.stringify(data) }),
}

// CMS API for website content and inquiries
export const cmsApi = {
  getConfig: () =>
    apiRequest<any>('/cms/config/current/'),

  updateConfig: (configData: any) =>
    apiRequest<any>('/cms/config/1/', {
      method: 'PATCH',
      body: JSON.stringify(configData),
    }),

  getInquiries: () =>
    apiRequest<any[]>('/cms/inquiries/'),

  updateInquiryStatus: (id: string | number, status: string) =>
    apiRequest<any>(`/cms/inquiries/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  deleteInquiry: (id: string | number) =>
    apiRequest<any>(`/cms/inquiries/${id}/`, {
      method: 'DELETE',
    }),

  submitInquiry: (inquiryData: any) =>
    apiRequest<any>('/cms/inquiries/', {
      method: 'POST',
      body: JSON.stringify(inquiryData),
    }),
}

// F&B (Diva Lounge) API
export const fnbApi = {
  getProducts: (params?: any) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    return apiRequest<any[]>(`/fnb/products/?${searchParams}`)
  },
  getCategories: () => apiRequest<any[]>('/fnb/categories/'),
  createSale: (data: any) => 
    apiRequest<any>('/fnb/sales/create/', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),
  getEmployeeSales: () => apiRequest<any[]>('/fnb/employee/sales/'),
  getInventoryStatus: (branchId?: string, includeEmpty: boolean = false) => 
    apiRequest<any[]>(`/fnb/inventory/status/?${branchId ? `branch=${branchId}&` : ''}${includeEmpty ? 'include_empty=true' : ''}`),
  getExpenses: () => apiRequest<any[]>('/fnb/expenses/'),
  createExpense: (data: any) => 
    apiRequest<any>('/fnb/expenses/', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),
  createProduct: (data: any) => 
    apiRequest<any>('/fnb/products/', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),
  updateProduct: (id: number, data: any) => 
    apiRequest<any>(`/fnb/products/${id}/`, { 
      method: 'PUT', 
      body: JSON.stringify(data) 
    }),
  deleteProduct: (id: number) => 
    apiRequest<any>(`/fnb/products/${id}/`, { 
      method: 'DELETE' 
    }),
  createCategory: (data: any) => 
    apiRequest<any>('/fnb/categories/', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),
  adjustInventory: (data: { product_id: number; branch_id?: number; new_quantity: number }) =>
    apiRequest<any>('/inventory/stock-adjust/', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateExpense: (id: number, data: any) =>
    apiRequest<any>(`/fnb/expenses/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteExpense: (id: number) =>
    apiRequest<any>(`/fnb/expenses/${id}/`, {
      method: "DELETE"
    }),
  markInventoryEmpty: (data: { product_id: number; notes?: string }) =>
    apiRequest<any>('/fnb/inventory/mark-empty/', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),
  getConsumptionPreview: (productId: number) =>
    apiRequest<any>(`/fnb/inventory/consumption-preview/${productId}/`),
  getClearanceHistory: (branchId?: string) =>
    apiRequest<any[]>(`/fnb/inventory/clearance-history/?${branchId ? `branch=${branchId}` : ''}`),
}

export const getFnbProducts = fnbApi.getProducts
export const createFnbSale = fnbApi.createSale
export const getEmployeeFnbSales = fnbApi.getEmployeeSales
export const getFnbInventoryStatus = fnbApi.getInventoryStatus
export const getFnbExpenses = fnbApi.getExpenses
export const createFnbExpense = fnbApi.createExpense
export const getFnbCategories = fnbApi.getCategories
export const createFnbProduct = fnbApi.createProduct
export const updateFnbProduct = fnbApi.updateProduct
export const deleteFnbProduct = fnbApi.deleteProduct
export const createFnbCategory = fnbApi.createCategory
export const adjustFnbInventory = fnbApi.adjustInventory
export const updateFnbExpense = fnbApi.updateExpense
export const deleteFnbExpense = fnbApi.deleteExpense
export const markFnbInventoryEmpty = fnbApi.markInventoryEmpty
export const getFnbConsumptionPreview = fnbApi.getConsumptionPreview
export const getFnbClearanceHistory = fnbApi.getClearanceHistory
