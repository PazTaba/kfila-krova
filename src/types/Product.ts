// types/Product.ts

export interface Product {
    _id: string;
    name: string;
    description: string;
    condition: string;
    address: string;
    price: number;
    distance: number;
    image: string;
    category: string;
    latitude: number;
    longitude: number;
    createdAt: string;
    userId?: string;
}
