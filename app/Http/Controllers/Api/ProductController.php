<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\IndexProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(IndexProductRequest $request)
    {
        $perPage = $request->get('per_page', config('products.per_page'));
        $page = $request->get('page', 1);
        $search = $request->get('search', '');

        $query = Product::query();

        // Apply search filter if provided (no minimum character limit)
        if (!empty($search)) {
            $query->searchByName($search);
        }

        $products = $query->paginate($perPage, ['*'], 'page', $page);

        // Laravel automatically includes pagination metadata (links, meta) with paginated resource collections
        return ProductResource::collection($products);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $product = Product::findOrFail($id);
        return response()->json([
            'data' => new ProductResource($product),
        ]);
    }
}
