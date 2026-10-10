export interface PartnerItem {
  id?: number | string;
  name?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface PartnerFilterPayload {
  [key: string]: any;
}
