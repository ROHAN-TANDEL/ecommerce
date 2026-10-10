export interface ClientItem {
  id?: number | string;
  name?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface ClientFilterPayload {
  [key: string]: any;
}
