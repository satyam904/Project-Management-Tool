export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  is_verified: boolean
  created_at: string
  email_notifications: boolean
  push_notifications: boolean
  marketing_emails: boolean
}


export interface AuthTokens {
  access: string
  refresh: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
  first_name: string
  last_name: string
}
