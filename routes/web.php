<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Default route - redirect to products
Route::get('/', function () {
    return redirect()->route('products');
});

// Public route - Products page accessible without login (default page)
Route::get('/products', function () {
    return Inertia::render('Products');
})->name('products');

Route::middleware('auth')->group(function () {
    Route::get('/cart', function () {
        return Inertia::render('Cart');
    })->name('cart');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
