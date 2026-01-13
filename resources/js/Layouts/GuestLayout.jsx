import ApplicationLogo from '@/Components/ApplicationLogo';
import CartIcon from '@/Components/Cart/CartIcon';
import { Link, usePage } from '@inertiajs/react';
import { useCartContext } from '@/Contexts/CartContext';

export default function GuestLayout({ children, onLoginClick, onRegisterClick }) {
    const { auth } = usePage().props;
    const { cart } = useCartContext();

    // Calculate cart item count
    const cartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Navigation */}
            <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link href="/" className="flex items-center">
                                <ApplicationLogo className="h-10 w-10 stroke-current text-gray-800 dark:text-gray-200" />
                                <span className="ml-3 text-xl font-semibold text-gray-900 dark:text-white">
                                    Shopping Cart
                                </span>
                            </Link>

                            <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
                                <Link
                                    href={route('products')}
                                    className="inline-flex items-center px-3 py-2 border-b-2 border-transparent text-sm font-medium leading-5 text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:outline-none focus:text-gray-700 focus:border-gray-300 transition duration-150 ease-in-out dark:text-gray-400 dark:hover:text-gray-300"
                                >
                                    Products
                                </Link>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            {auth.user ? (
                                <>
                                    <CartIcon cartCount={cartCount} className="p-2" />
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={onLoginClick || (() => window.location.href = route('login'))}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none transition duration-150 ease-in-out dark:text-gray-400 dark:hover:text-gray-300"
                                    >
                                        Log in
                                    </button>
                                    <button
                                        onClick={onRegisterClick || (() => window.location.href = route('register'))}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-150 ease-in-out dark:bg-gray-700 dark:hover:bg-gray-600"
                                    >
                                        Register
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main>{children}</main>

            {/* Footer */}
            <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                        © 2026 Shopping Cart. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
