export interface Place {
  id: string;
  name: string;
  vicinity: string;
  distance: number; // In meters
  rating?: number;
  open_now?: boolean;
  phone?: string;
  lat: number;
  lng: number;
}
