export interface UserRow {
  id: number;
  username: string;
  role: string;
  tambanganId: number | null;
  createdAt: string;
}

export interface TambanganRow {
  id: number;
  slug: string;
  nama: string;
  titik_a_nama: string;
  titik_a_lat: number | null;
  titik_a_lng: number | null;
  titik_b_nama: string;
  titik_b_lat: number | null;
  titik_b_lng: number | null;
}

export interface KapalRow {
  slug: string;
  nama: string;
  status: string;
  tambanganNama: string;
  ownerUsername: string;
  lastUpdatedAt: string;
}

export type Tab = "users" | "tambangan" | "kapal";
