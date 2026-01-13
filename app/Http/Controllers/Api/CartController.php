<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCartItemRequest;
use App\Http\Requests\UpdateCartItemRequest;
use App\Http\Resources\CartItemResource;
use App\Http\Resources\CartResource;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    protected $cartService;

    public function __construct(CartService $cartService)
    {
        $this->cartService = $cartService;
    }

    /**
     * Display the user's cart.
     */
    public function index(Request $request)
    {
        $cart = $this->cartService->getOrCreateCart($request->user()->id);
        $cart->load('items.product');
        return response()->json([
            'data' => new CartResource($cart),
        ]);
    }

    /**
     * Add item to cart.
     */
    public function store(StoreCartItemRequest $request)
    {
        try {
            $cartItem = $this->cartService->addItem(
                $request->user()->id,
                $request->product_id,
                $request->quantity
            );
            $cartItem->load('product');

            return response()->json([
                'message' => 'Item added to cart successfully',
                'data' => new CartItemResource($cartItem),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Update cart item quantity.
     */
    public function update(UpdateCartItemRequest $request, string $id)
    {
        try {
            $cartItem = $this->cartService->updateItem(
                $request->user()->id,
                $id,
                $request->quantity
            );
            $cartItem->load('product');

            return response()->json([
                'message' => 'Cart item updated successfully',
                'data' => new CartItemResource($cartItem),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Remove item from cart.
     */
    public function destroy(Request $request, string $id)
    {
        try {
            $this->cartService->removeItem($request->user()->id, $id);
            return response()->json([
                'message' => 'Item removed from cart successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 404);
        }
    }
}
