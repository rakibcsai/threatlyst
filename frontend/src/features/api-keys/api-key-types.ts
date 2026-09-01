export interface APIKeyCreate {
  name: string
}

export interface APIKeyResponse {
  id: number
  name: string
  key_prefix: string
  is_active: boolean
  created_by_user_id: number
}

export interface APIKeyCreateResponse extends APIKeyResponse {
  api_key: string
}
