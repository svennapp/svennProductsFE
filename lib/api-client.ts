// lib/api-client.ts

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function handleResponse(response: Response) {
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: 'An error occurred' }))
    throw new ApiError(response.status, error.detail || 'An error occurred')
  }

  // Check if the response is empty
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    return response.json()
  }

  return response.text()
}

export const apiClient = {
  get: async (url: string) => {
    const response = await fetch(url)
    return handleResponse(response)
  },

  post: async (url: string, data?: any) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    })
    return handleResponse(response)
  },

  put: async (url: string, data: any) => {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    return handleResponse(response)
  },

  patch: async (url: string, data: any) => {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    return handleResponse(response)
  },

  delete: async (url: string) => {
    const response = await fetch(url, {
      method: 'DELETE',
    })
    return handleResponse(response)
  },
}
