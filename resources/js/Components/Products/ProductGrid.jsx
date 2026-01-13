import ProductCard from './ProductCard';
import ProductSkeleton from './ProductSkeleton';

export default function ProductGrid({ 
    products, 
    onAddToCart, 
    addingToCart,
    cartItems = {},
    onUpdateQuantity,
    onRemove,
    updating = {},
    loading = false,
    skeletonCount = 8
}) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: skeletonCount }).map((_, index) => (
                    <ProductSkeleton key={`skeleton-${index}`} />
                ))}
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="text-center py-12">
                <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No products found</h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">Check back later for new products.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
                const cartItem = cartItems[product.id];
                const cartQuantity = cartItem ? cartItem.quantity : null;
                return (
                    <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={onAddToCart}
                        addingToCart={addingToCart[product.id]}
                        cartQuantity={cartQuantity}
                        onUpdateQuantity={onUpdateQuantity}
                        onRemove={onRemove}
                        updating={updating[cartItem?.id]}
                    />
                );
            })}
        </div>
    );
}

