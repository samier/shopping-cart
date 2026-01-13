<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    protected $cartService;

    public function __construct(CartService $cartService)
    {
        $this->cartService = $cartService;
    }

    /**
     * Checkout - Create order from cart.
     */
    public function store(Request $request)
    {
        try {
            $result = $this->cartService->checkout($request->user()->id);

            return response()->json([
                'message' => 'Order placed successfully',
                'order_id' => $result['order']->id,
                'total_amount' => $result['order']->total_amount,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage() ?: 'An unexpected error occurred while placing your order. Please try again.',
            ], 400);
        }
    }
}
