export interface ProductColor {
  name: string;
  hex: string;
  bgClass: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: 'foulard_cotton' | 'hijab_jersey' | 'essentiels';
  categoryLabel: string;
  image: string;
  images: string[]; // for alternate views or zooms
  description: string;
  longDescription: string;
  sizes: string[]; // lengths like "1m60", "1m80", "2m00", "2m10"
  colors: ProductColor[];
  fabric: string; // e.g. "100% Coton Premium"
  isNew?: boolean;
  isPopular?: boolean;
}

export interface CartItem {
  id: string; // combination of productId + size + color
  product: Product;
  selectedSize: string;
  selectedColor: ProductColor;
  quantity: number;
}

export interface FilterState {
  category: string | null;
  color: string | null;
  priceRange: number;
  sortBy: 'price-asc' | 'price-desc' | 'popular' | 'newest';
}
