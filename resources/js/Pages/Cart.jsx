import { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CartItem from '@/Components/Cart/CartItem';
import OrderSummary from '@/Components/Cart/OrderSummary';
import EmptyCart from '@/Components/Cart/EmptyCart';
import ConfirmModal from '@/Components/ConfirmModal';
import { useCartContext } from '@/Contexts/CartContext';
import { showNotification } from '@/utils/notifications';

export default function Cart() {
    const {
        cart,
        loading,
        error,
        updating,
        fetchCart,
        updateItem,
        removeItem,
        checkout,
    } = useCartContext();

    const [checkingOut, setCheckingOut] = useState(false);
    const [showCheckoutConfirm, setShowCheckoutConfirm] = useState(false);

    useEffect(() => {
        fetchCart(true); // Show loading on cart page
    }, [fetchCart]);

    const handleUpdateQuantity = async (itemId, quantity) => {
        const result = await updateItem(itemId, quantity);
        if (!result.success && result.message) {
            showNotification(result.message, 'error');
        }
    };

    const handleStockError = (message) => {
        showNotification(message, 'error');
    };

    const handleRemoveItem = async (itemId) => {
        const result = await removeItem(itemId);
        if (!result.success && result.message) {
            showNotification(result.message, 'error');
        } else if (result.success) {
            showNotification('Item removed from cart', 'success');
        }
    };

    const handleCheckout = () => {
        setShowCheckoutConfirm(true);
    };

    const confirmCheckout = async () => {
        setShowCheckoutConfirm(false);

        try {
            setCheckingOut(true);
            const result = await checkout();

            if (result.success) {
                showNotification('Order placed successfully!', 'success');
            } else {
                const errorMessage = result.message || 'An unexpected error occurred. Please try again.';
                showNotification(errorMessage, 'error');
            }
        } catch (err) {
            showNotification('An unexpected error occurred. Please try again.', 'error');
            console.error(err);
        } finally {
            setCheckingOut(false);
        }
    };

    if (loading) {
        return (
            <AuthenticatedLayout>
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
                            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading cart...</p>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    const items = cart?.items || [];
    const total = cart?.total || 0;

    return (
        <AuthenticatedLayout>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                            Shopping Cart
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                            {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                            {error}
                        </div>
                    )}

                    {items.length === 0 ? (
                        <EmptyCart />
                    ) : (
                        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
                            {/* Cart Items */}
                            <div className="lg:col-span-8">
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {items.map((item) => (
                                            <CartItem
                                                key={item.id}
                                                item={item}
                                                onUpdateQuantity={handleUpdateQuantity}
                                                onRemove={handleRemoveItem}
                                                updating={updating[item.id]}
                                                onStockError={handleStockError}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="lg:col-span-4 mt-8 lg:mt-0">
                                <OrderSummary
                                    items={items}
                                    total={total}
                                    onCheckout={handleCheckout}
                                    checkingOut={checkingOut}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Checkout Confirmation Modal */}
            <ConfirmModal
                show={showCheckoutConfirm}
                title="Proceed to Checkout"
                message={`Are you sure you want to proceed with checkout? Total amount: $${total.toFixed(2)}`}
                confirmText="Proceed to Checkout"
                cancelText="Cancel"
                onConfirm={confirmCheckout}
                onCancel={() => setShowCheckoutConfirm(false)}
            />
        </AuthenticatedLayout>
    );
}
