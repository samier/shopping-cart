import { useState, useEffect } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import ConfirmModal from '@/Components/ConfirmModal';

export default function CartItem({ item, onUpdateQuantity, onRemove, updating, onStockError }) {
    const [localQuantity, setLocalQuantity] = useState(item.quantity);
    const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

    // Sync local quantity with item quantity when it changes
    useEffect(() => {
        setLocalQuantity(item.quantity);
    }, [item.quantity]);

    const handleDecrease = () => {
        const newQuantity = Math.max(1, localQuantity - 1);
        setLocalQuantity(newQuantity);
        onUpdateQuantity(item.id, newQuantity);
    };

    const handleIncrease = () => {
        // Check stock before increasing
        if (item.product.stock_quantity <= item.quantity) {
            if (onStockError) {
                onStockError(`Only ${item.product.stock_quantity} ${item.product.name} available in stock.`);
            }
            return;
        }
        const newQuantity = localQuantity + 1;
        setLocalQuantity(newQuantity);
        onUpdateQuantity(item.id, newQuantity);
    };

    const handleRemove = () => {
        setShowRemoveConfirm(true);
    };

    const confirmRemove = () => {
        setShowRemoveConfirm(false);
        onRemove(item.id);
    };

    return (
        <div className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            {/* Product Image and Info */}
            <div className="flex items-center space-x-4 flex-1">
                {item.product.image_url ? (
                    <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="h-24 w-24 object-cover rounded-lg"
                        onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/200x200?text=' + encodeURIComponent(item.product.name);
                        }}
                    />
                ) : (
                    <div className="h-24 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}

                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {item.product.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        ${item.product.price} each
                    </p>
                </div>
            </div>

            {/* Quantity Controls and Price */}
            <div className="flex items-center justify-between sm:justify-end gap-4">
                {/* Quantity Controls */}
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
                        disabled={updating}
                        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Increase quantity"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                </div>

                {/* Subtotal */}
                <div className="text-right min-w-[100px]">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {updating ? (
                            <span className="inline-block animate-pulse">
                                ${(localQuantity * item.product.price).toFixed(2)}
                            </span>
                        ) : (
                            `$${(localQuantity * item.product.price).toFixed(2)}`
                        )}
                    </p>
                </div>

                {/* Remove Button */}
                <button
                    onClick={handleRemove}
                    disabled={updating}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Remove item"
                    aria-label="Remove item from cart"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>

            {/* Remove Confirmation Modal */}
            <ConfirmModal
                show={showRemoveConfirm}
                title="Remove Item"
                message={`Are you sure you want to remove "${item.product.name}" from your cart?`}
                confirmText="Remove"
                cancelText="Cancel"
                variant="danger"
                onConfirm={confirmRemove}
                onCancel={() => setShowRemoveConfirm(false)}
            />
        </div>
    );
}

