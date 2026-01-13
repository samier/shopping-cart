import PrimaryButton from '@/Components/PrimaryButton';
import ProductQuantityControls from './ProductQuantityControls';

export default function ProductCard({ 
    product, 
    onAddToCart, 
    addingToCart,
    cartQuantity = null,
    onUpdateQuantity,
    onRemove,
    updating = false
}) {
    // Use availableStock if provided, otherwise use stock_quantity
    const availableStock = product.availableStock !== undefined 
        ? product.availableStock 
        : product.stock_quantity;
    const isOutOfStock = availableStock === 0;
    const isAdding = addingToCart || false;
    const isInCart = cartQuantity !== null && cartQuantity > 0;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            {/* Product Image */}
            <div className="relative h-64 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                {product.image_url ? (
                    <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/500x500?text=' + encodeURIComponent(product.name);
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}
                
                {/* Stock Badge */}
                {isOutOfStock ? (
                    <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                        Out of Stock
                    </span>
                ) : availableStock <= (product.low_stock_threshold ?? 5) ? (
                    <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                        Low Stock
                    </span>
                ) : (
                    <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                        In Stock
                    </span>
                )}
            </div>

            {/* Product Info */}
            <div className="p-5">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {product.name}
                </h3>
                
                <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        ${product.price}
                    </span>
                    <span className={`text-sm font-medium ${
                        availableStock === 0 
                            ? 'text-red-500 dark:text-red-400' 
                            : availableStock <= (product.low_stock_threshold ?? 5)
                            ? 'text-orange-500 dark:text-orange-400'
                            : 'text-gray-500 dark:text-gray-400'
                    }`}>
                        {availableStock} {availableStock === 1 ? 'left' : 'left'}
                        {isInCart && cartQuantity > 0 && (
                            <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">
                                ({cartQuantity} in cart)
                            </span>
                        )}
                    </span>
                </div>

                {/* Add to Cart Button or Quantity Controls */}
                {isInCart ? (
                    <div className="flex items-center justify-center">
                        <ProductQuantityControls
                            product={product}
                            currentQuantity={cartQuantity}
                            onUpdateQuantity={onUpdateQuantity}
                            onRemove={onRemove}
                            updating={updating}
                        />
                    </div>
                ) : (
                    <PrimaryButton
                        onClick={() => onAddToCart(product.id)}
                        disabled={isAdding || isOutOfStock}
                        className="w-full py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isAdding ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Adding...
                            </span>
                        ) : isOutOfStock ? (
                            'Out of Stock'
                        ) : (
                            <span className="flex items-center justify-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                Add to Cart
                            </span>
                        )}
                    </PrimaryButton>
                )}
            </div>
        </div>
    );
}

