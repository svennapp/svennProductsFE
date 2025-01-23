// lib/api-client.ts

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: 'An error occurred' }))
    throw new ApiError(response.status, error.detail || 'An error occurred')
  }

  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    return response.json()
  }

  return response.text() as T
}

export const apiClient = {
  get: async <T>(url: string): Promise<T> => {
    const response = await fetch(url)
    return handleResponse<T>(response)
  },

  post: async <T>(url: string, data?: any): Promise<T> => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    })
    return handleResponse<T>(response)
  },

  put: async <T>(url: string, data: any): Promise<T> => {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    return handleResponse<T>(response)
  },

  patch: async <T>(url: string, data: any): Promise<T> => {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    return handleResponse<T>(response)
  },

  delete: async <T>(url: string): Promise<T> => {
    const response = await fetch(url, {
      method: 'DELETE',
    })
    return handleResponse<T>(response)
  },
}
