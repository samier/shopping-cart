import { useState, useEffect } from 'react';

export default function ProductQuantityControls({
    product,
    currentQuantity,
    onUpdateQuantity,
    onRemove,
    updating = false
}) {
    const [localQuantity, setLocalQuantity] = useState(currentQuantity);

    // Sync local quantity with currentQuantity when it changes
    useEffect(() => {
        setLocalQuantity(currentQuantity);
    }, [currentQuantity]);

    const handleDecrease = () => {
        if (currentQuantity > 1) {
            const newQuantity = currentQuantity - 1;
            setLocalQuantity(newQuantity);
            onUpdateQuantity(product.id, newQuantity);
        } else {
            onRemove(product.id);
        }
    };

    const handleIncrease = () => {
        // Compare with total stock quantity, not available stock
        // availableStock = total stock - items in cart
        // We want to allow adding until currentQuantity reaches total stock
        const totalStock = product.stock_quantity;

        // Check stock before increasing - compare with total stock
        if (currentQuantity >= totalStock) {
            return; // Will be handled by parent with toast
        }
        const newQuantity = currentQuantity + 1;
        setLocalQuantity(newQuantity);
        onUpdateQuantity(product.id, newQuantity);
    };

    // Use total stock for button disable check, not available stock
    const totalStock = product.stock_quantity;

    return (
        <div className="flex items-center space-x-3">
            <button
                onClick={handleDecrease}
                disabled={updating || localQuantity <= 1}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Decrease quantity"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
            </button>
            <span className="w-12 text-center text-lg font-semibold text-gray-900 dark:text-white">
                {updating ? (
                    <span className="inline-block animate-pulse">{localQuantity}</span>
                ) : (
                    localQuantity
                )}
            </span>
            <button
                onClick={handleIncrease}
                disabled={updating || localQuantity >= totalStock}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Increase quantity"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            </button>
        </div>
    );
}

