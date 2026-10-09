export interface CustomerItem {
  id?: number | string;
  name?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface CustomerFilterPayload {
  [key: string]: any;
}
