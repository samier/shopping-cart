<?php

namespace App\Services;

use App\Jobs\LowStockNotification;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class CartService
{
    public function getOrCreateCart($userId): Cart
    {
        return Cart::firstOrCreate(['user_id' => $userId]);
    }

    public function addItem($userId, $productId, $quantity): CartItem
    {
        DB::beginTransaction();
        try {
            // Lock the product row to prevent concurrent modifications
            $product = Product::where('id', $productId)
                ->lockForUpdate()
                ->firstOrFail();

            if ($product->stock_quantity < $quantity) {
                DB::rollBack();
                throw new \Exception('Insufficient stock available.');
            }

            $cart = $this->getOrCreateCart($userId);

            $cartItem = CartItem::where('cart_id', $cart->id)
                ->where('product_id', $productId)
                ->first();

            if ($cartItem) {
                $newQuantity = $cartItem->quantity + $quantity;
                // Re-check stock after calculating new quantity
                if ($product->stock_quantity < $newQuantity) {
                    DB::rollBack();
                    throw new \Exception('Insufficient stock available.');
                }
                $cartItem->quantity = $newQuantity;
                $cartItem->save();
            } else {
                $cartItem = CartItem::create([
                    'cart_id' => $cart->id,
                    'product_id' => $productId,
                    'quantity' => $quantity,
                ]);
            }

            DB::commit();
            return $cartItem;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function updateItem($userId, $itemId, $quantity): CartItem
    {
        DB::beginTransaction();
        try {
            $cart = $this->getOrCreateCart($userId);
            $cartItem = CartItem::where('cart_id', $cart->id)
                ->where('id', $itemId)
                ->firstOrFail();

            // Lock the product row to prevent concurrent modifications
            $product = Product::where('id', $cartItem->product_id)
                ->lockForUpdate()
                ->firstOrFail();

            // Re-check stock after acquiring lock
            if ($product->stock_quantity < $quantity) {
                DB::rollBack();
                throw new \Exception('Insufficient stock available.');
            }

            $cartItem->quantity = $quantity;
            $cartItem->save();

            DB::commit();
            return $cartItem;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function removeItem($userId, $itemId): bool
    {
        $cart = $this->getOrCreateCart($userId);
        $cartItem = CartItem::where('cart_id', $cart->id)
            ->where('id', $itemId)
            ->firstOrFail();

        return $cartItem->delete();
    }

    public function checkout($userId): array
    {
        $cart = $this->getOrCreateCart($userId);
        $items = $cart->items()->with('product')->get();

        if ($items->isEmpty()) {
            throw new \Exception('Cart is empty.');
        }

        DB::beginTransaction();
        try {
            $totalAmount = 0;
            $orderItems = [];
            $productsToNotify = [];

            foreach ($items as $item) {
                // Lock the product row for update to prevent concurrent modifications
                // This ensures atomic stock check and decrement
                $product = Product::where('id', $item->product_id)
                    ->lockForUpdate()
                    ->firstOrFail();

                // Re-check stock after acquiring lock (stock might have changed)
                if ($product->stock_quantity < $item->quantity) {
                    DB::rollBack();
                    throw new \Exception("Insufficient stock for {$product->name}. Only {$product->stock_quantity} available.");
                }

                $subtotal = $item->quantity * $product->price;
                $totalAmount += $subtotal;

                // Decrement stock atomically using database-level decrement
                // This ensures the decrement happens at the database level with the WHERE condition
                // If stock is insufficient, no rows will be affected
                $affectedRows = Product::where('id', $product->id)
                    ->where('stock_quantity', '>=', $item->quantity)
                    ->decrement('stock_quantity', $item->quantity);

                // If no rows were affected, stock was insufficient (another transaction took it)
                if ($affectedRows === 0) {
                    DB::rollBack();
                    throw new \Exception("Insufficient stock for {$product->name}. The item is no longer available in the requested quantity.");
                }

                // Refresh product to get updated stock_quantity for low stock check
                $product->refresh();

                // Check for low stock using product-specific threshold
                $threshold = $product->low_stock_threshold ?? 5; // Default to 5 if not set
                if ($product->stock_quantity <= $threshold) {
                    $productsToNotify[] = $product;
                }

                $orderItems[] = [
                    'product_id' => $product->id,
                    'quantity' => $item->quantity,
                    'price' => $product->price,
                ];
            }

            $order = Order::create([
                'user_id' => $userId,
                'total_amount' => $totalAmount,
            ]);

            foreach ($orderItems as $orderItem) {
                $order->items()->create($orderItem);
            }

            $cart->items()->delete();

            DB::commit();

            // Dispatch single low stock notification with all products after transaction commits
            // Deduplicate products by ID to avoid sending duplicate notifications for the same product
            if (!empty($productsToNotify)) {
                $uniqueProducts = collect($productsToNotify)->unique('id')->values()->all();
                LowStockNotification::dispatch($uniqueProducts);
            }

            return [
                'order' => $order,
                'items' => $orderItems,
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
}

