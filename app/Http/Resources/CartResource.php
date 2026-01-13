<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $items = CartItemResource::collection($this->items);
        $total = $this->items->sum(function ($item) {
            return $item->quantity * $item->product->price;
        });

        return [
            'id' => $this->id,
            'items' => $items,
            'total' => round($total, 2),
        ];
    }
}
