import { Link } from '@inertiajs/react';

export default function CartIcon({ cartCount = 0, className = '' }) {
    const hasItems = cartCount > 0;

    return (
        <Link
            href={route('cart')}
            className={`relative inline-flex items-center justify-center p-2 text-gray-500 hover:text-gray-700 focus:outline-none transition duration-150 ease-in-out dark:text-gray-400 dark:hover:text-gray-300 ${className}`}
            aria-label={`Shopping cart with ${cartCount} items`}
        >
            <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
            </svg>
            {hasItems && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                    {cartCount > 99 ? '99+' : cartCount}
                </span>
            )}
        </Link>
    );
}

