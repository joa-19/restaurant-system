export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: string;
  image: string | null;
  available: boolean;
}

export interface Category {
  id: string;
  name: string;
  menuItems: MenuItem[];
}

export interface PublicMenuResponse {
  restaurant: { name: string };
  table: { id: string; tableNumber: number };
  categories: Category[];
}