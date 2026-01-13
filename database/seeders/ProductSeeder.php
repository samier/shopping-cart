<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = [
            [
                'name' => 'Laptop',
                'image_url' => 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=500&fit=crop',
                'price' => 999.99,
                'stock_quantity' => 10,
                'low_stock_threshold' => 5
            ],
            [
                'name' => 'Wireless Mouse',
                'image_url' => 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500&h=500&fit=crop',
                'price' => 29.99,
                'stock_quantity' => 50,
                'low_stock_threshold' => 5
            ],
            [
                'name' => 'Mechanical Keyboard',
                'image_url' => 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&h=500&fit=crop',
                'price' => 79.99,
                'stock_quantity' => 30,
                'low_stock_threshold' => 5
            ],
            [
                'name' => '4K Monitor',
                'image_url' => 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&h=500&fit=crop',
                'price' => 299.99,
                'stock_quantity' => 15,
                'low_stock_threshold' => 5
            ],
            [
                'name' => 'Desktop PC 48 inch',
                'image_url' => 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=500&h=500&fit=crop',
                'price' => 49.99,
                'stock_quantity' => 25,
                'low_stock_threshold' => 5
            ],
            [
                'name' => 'Wireless Headphones',
                'image_url' => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
                'price' => 129.99,
                'stock_quantity' => 20,
                'low_stock_threshold' => 5
            ],
            [
                'name' => 'Graphics Card 64GB',
                'image_url' => 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500&h=500&fit=crop',
                'price' => 19.99,
                'stock_quantity' => 100,
                'low_stock_threshold' => 5
            ],
            [
                'name' => 'Desktop PC 32 inch',
                'image_url' => 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=500&h=500&fit=crop',
                'price' => 89.99,
                'stock_quantity' => 12,
                'low_stock_threshold' => 5
            ],
            [
                'name' => 'Tablet 10 inch',
                'image_url' => 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&h=500&fit=crop',
                'price' => 399.99,
                'stock_quantity' => 8,
                'low_stock_threshold' => 5
            ],
            [
                'name' => 'Smartphone Pro',
                'image_url' => 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&h=500&fit=crop',
                'price' => 699.99,
                'stock_quantity' => 5,
                'low_stock_threshold' => 5
            ],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}
