import { Link } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';

export default function OrderSummary({ items, total, onCheckout, checkingOut }) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Order Summary
            </h2>
            
            <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
                    <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Shipping</span>
                    <span className="text-green-600 dark:text-green-400">Free</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex justify-between">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">Total</span>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">${total.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <PrimaryButton
                onClick={onCheckout}
                disabled={checkingOut}
                className="w-full py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {checkingOut ? (
                    <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                    </span>
                ) : (
                    'Proceed to Checkout'
                )}
            </PrimaryButton>

            <Link
                href={route('products')}
                className="block mt-4 text-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
                Continue Shopping
            </Link>
        </div>
    );
}

