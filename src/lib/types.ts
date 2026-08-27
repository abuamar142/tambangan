export type KapalStatus = "titik_a" | "proses" | "titik_b";

export interface Titik {
  nama: string;
  lat: number | null;
  lng: number | null;
}

export interface TambanganDto {
  id: number;
  slug: string;
  nama: string;
  titikA: Titik;
  titikB: Titik;
  jumlahKapal?: number;
}

export interface KapalLiveDto {
  slug: string;
  nama: string;
  status: KapalStatus;
  departingFrom: KapalStatus | null;
  timerEndAt: string | null;
  lastDepartureAt: string | null;
  lastUpdated: string;
}

export interface KapalMineDto extends KapalLiveDto {
  tambanganSlug: string;
  tambanganNama: string;
  titikA: Titik;
  titikB: Titik;
  departingFrom: KapalStatus | null;
}

export interface UserInfo {
  id: number;
  username: string;
  role: string;
}
