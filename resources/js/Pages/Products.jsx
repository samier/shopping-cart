import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import GuestLayout from '@/Layouts/GuestLayout';
import ProductGrid from '@/Components/Products/ProductGrid';
import Pagination from '@/Components/Products/Pagination';
import ProductSearch from '@/Components/Products/ProductSearch';
import LoginModal from '@/Components/Auth/LoginModal';
import RegisterModal from '@/Components/Auth/RegisterModal';
import ForgotPasswordModal from '@/Components/Auth/ForgotPasswordModal';
import { useProducts } from '@/hooks/useProducts';
import { useCartContext } from '@/Contexts/CartContext';
import { showNotification } from '@/utils/notifications';
import api from '@/api';

export default function Products() {
    const { auth, flash, errors: pageErrors } = usePage().props;
    const { products, loading, error, pagination, fetchProducts, refreshProducts, setProducts } = useProducts();
    const { cart, setCart, fetchCart, updateItem, removeItem } = useCartContext();
    const [addingToCart, setAddingToCart] = useState({});
    const [updating, setUpdating] = useState({});
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [pendingProductId, setPendingProductId] = useState(null); // Store product ID when user needs to login
    const isAddingPendingProductRef = useRef(false); // Use ref to prevent duplicate additions (synchronous check)
    const previousAuthUserRef = useRef(auth.user); // Track previous auth state to detect login
    const isInitialMountRef = useRef(true); // Track if this is the first render

    // Show login modal if password was reset successfully
    useEffect(() => {
        if (flash?.password_reset_success || (flash?.status && flash.status.includes('reset'))) {
            setShowLoginModal(true);
            showNotification('Password reset successfully! Please log in with your new password.', 'success');
        }
    }, [flash]);

    // Auto-open login modal if there are login errors and keep it open
    useEffect(() => {
        const hasLoginErrors = pageErrors && (pageErrors.email || pageErrors.password) && !pageErrors.name && !pageErrors.password_confirmation;
        if (hasLoginErrors && !showRegisterModal) {
            // Always keep login modal open when there are login errors
            setShowLoginModal(true);
        }
    }, [pageErrors, showRegisterModal]);

    // Auto-open registration modal if there are registration errors and keep it open
    useEffect(() => {
        const hasRegistrationErrors = pageErrors && (pageErrors.name || pageErrors.password_confirmation || (pageErrors.email && (pageErrors.name || pageErrors.password_confirmation)) || (pageErrors.password && (pageErrors.name || pageErrors.password_confirmation)));
        if (hasRegistrationErrors && !showLoginModal) {
            // Always keep registration modal open when there are registration errors
            setShowRegisterModal(true);
        }
    }, [pageErrors, showLoginModal]);

    // Fetch products on mount, when auth state changes, or when search query changes
    useEffect(() => {
        // Fetch products on mount and when auth state or search query changes
        // Always start from page 1, don't append
        fetchProducts(1, false, searchQuery);
        // Scroll to top when search changes (not on initial mount)
        if (searchQuery) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        // Cart is automatically fetched by CartProvider when auth.user changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auth.user, searchQuery]); // Depend on both auth.user and searchQuery

    // Handle adding pending product after successful login
    const handlePostLogin = useCallback(async (productIdToAdd) => {
        // Prevent duplicate additions using ref (synchronous check)
        if (isAddingPendingProductRef.current || !productIdToAdd || !auth.user) {
            return;
        }

        // Set flag immediately (synchronous) to prevent duplicates
        isAddingPendingProductRef.current = true;

        try {
            setAddingToCart(prev => ({ ...prev, [productIdToAdd]: true }));
            await api.post('/cart', {
                product_id: productIdToAdd,
                quantity: 1,
            });

            // Refresh cart silently
            await fetchCart();

            // Refresh products silently - preserve current page
            refreshProducts(searchQuery, pagination.current_page);

            // Show success message
            showNotification('Product added to cart successfully!', 'success');

            // Clear pending product ID (from both state and sessionStorage)
            setPendingProductId(null);
            sessionStorage.removeItem('pendingProductId');
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to add product to cart.';
            showNotification(message, 'error');
            console.error(err);
            // Clear pending product ID even on error to prevent retry loops
            setPendingProductId(null);
            sessionStorage.removeItem('pendingProductId');
        } finally {
            setAddingToCart(prev => ({ ...prev, [productIdToAdd]: false }));
            // Reset flag
            isAddingPendingProductRef.current = false;
        }
    }, [auth.user, fetchCart, refreshProducts, searchQuery, pagination.current_page]);

    // Clear cart when user logs out (without page reload)
    useEffect(() => {
        if (!auth.user && cart) {
            setCart(null);
        }
    }, [auth.user, cart, setCart]);

    // Listen for custom event to add pending product after login
    useEffect(() => {
        const handleAddPendingProduct = (event) => {
            const { productId } = event.detail;

            // Prevent duplicate execution
            if (isAddingPendingProductRef.current || !productId || !auth.user) {
                return;
            }

            // Clear from sessionStorage
            sessionStorage.removeItem('pendingProductId');

            // Add the product
            handlePostLogin(productId);
        };

        window.addEventListener('addPendingProductAfterLogin', handleAddPendingProduct);

        return () => {
            window.removeEventListener('addPendingProductAfterLogin', handleAddPendingProduct);
        };
    }, [auth.user, handlePostLogin]);

    // Also handle auth state transition as fallback
    useEffect(() => {
        // Skip on initial mount
        if (isInitialMountRef.current) {
            isInitialMountRef.current = false;
            previousAuthUserRef.current = auth.user;
            return;
        }

        // Capture previous auth state
        const previousAuthUser = previousAuthUserRef.current;
        const wasLoggedOut = !previousAuthUser;
        const isNowLoggedIn = !!auth.user;
        const justLoggedIn = wasLoggedOut && isNowLoggedIn;

        // Update ref
        previousAuthUserRef.current = auth.user;

        // If user just logged in, check for pending product
        if (justLoggedIn) {
            const storedProductId = sessionStorage.getItem('pendingProductId');
            if (storedProductId && auth.user && !isAddingPendingProductRef.current) {
                const productId = parseInt(storedProductId, 10);
                // Small delay to ensure everything is ready
                setTimeout(() => {
                    if (auth.user && fetchCart) {
                        sessionStorage.removeItem('pendingProductId');
                        handlePostLogin(productId);
                    }
                }, 500);
            }
        }
    }, [auth.user, handlePostLogin, fetchCart]);

    // Handle page change
    const handlePageChange = useCallback((page) => {
        fetchProducts(page, false, searchQuery);
        // Scroll to top when page changes
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [fetchProducts, searchQuery]);

    // Handle search change
    const handleSearchChange = useCallback((query) => {
        setSearchQuery(query);
    }, []);


    // Calculate available stock for products (total stock - items in cart)
    // This is calculated on the fly to avoid state management issues
    const getAvailableStock = (product) => {
        if (!cart?.items) {
            return product.stock_quantity;
        }
        const cartItem = cart.items.find(item => item.product_id === product.id);
        return cartItem
            ? Math.max(0, product.stock_quantity - cartItem.quantity)
            : product.stock_quantity;
    };

    // Enhance products with available stock for display
    const productsWithStock = products.map(product => ({
        ...product,
        availableStock: getAvailableStock(product),
    }));

    const addToCart = async (productId) => {
        // Check if user is authenticated
        if (!auth.user) {
            // Store the product ID to add after login (in both state and sessionStorage for persistence)
            setPendingProductId(productId);
            sessionStorage.setItem('pendingProductId', productId.toString());
            // Clear any existing modal states before showing login
            setShowRegisterModal(false);
            setShowLoginModal(true);
            return;
        }

        try {
            setAddingToCart(prev => ({ ...prev, [productId]: true }));
            await api.post('/cart', {
                product_id: productId,
                quantity: 1,
            });

            // Refresh cart silently (no loading state)
            await fetchCart();

            // Refresh products silently (no loading state) - preserve current page
            refreshProducts(searchQuery, pagination.current_page);

            // Show success message
            showNotification('Product added to cart successfully!', 'success');
        } catch (err) {
            if (err.response?.status === 401) {
                // Store the product ID to add after login (in both state and sessionStorage for persistence)
                setPendingProductId(productId);
                sessionStorage.setItem('pendingProductId', productId.toString());
                setShowLoginModal(true);
            } else if (err.response?.status === 419) {
                // CSRF token mismatch - the API interceptor will handle retry
                // If retry fails, it will redirect to login page
                // This notification may not show if redirect happens first
                showNotification('Session expired. Please try again.', 'error');
            } else {
                const message = err.response?.data?.message || 'Failed to add product to cart.';
                showNotification(message, 'error');
            }
            console.error(err);
        } finally {
            setAddingToCart(prev => ({ ...prev, [productId]: false }));
        }
    };

    const handleUpdateQuantity = async (productId, quantity) => {
        // Find cart item for this product
        const cartItem = cart?.items?.find(item => item.product_id === productId);
        if (!cartItem) {
            return;
        }

        // Find product to check stock
        const product = products.find(p => p.id === productId);
        if (!product) return;

        // Compare with total stock quantity, not available stock
        // availableStock = total stock - items in cart (for display purposes)
        // But we should allow quantity up to total stock
        if (quantity > product.stock_quantity) {
            showNotification(`Only ${product.stock_quantity} ${product.name} available in stock.`, 'error');
            return;
        }

        try {
            setUpdating(prev => ({ ...prev, [cartItem.id]: true }));
            const result = await updateItem(cartItem.id, quantity);
            if (!result.success && result.message) {
                showNotification(result.message, 'error');
                // Refresh cart to sync state on error
                await fetchCart();
            } else {
                // Update cart locally without full fetch
                // The useCart hook already updates the cart state
                // Just refresh products to get latest stock (without showing loader) - preserve current page
                refreshProducts(searchQuery, pagination.current_page);
            }
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to update quantity.';
            showNotification(message, 'error');
            // Refresh cart to sync state on error
            await fetchCart();
        } finally {
            setUpdating(prev => ({ ...prev, [cartItem.id]: false }));
        }
    };

    const handleRemoveFromCart = async (productId) => {
        // Find cart item for this product
        const cartItem = cart?.items?.find(item => item.product_id === productId);
        if (!cartItem) {
            return;
        }

        try {
            setUpdating(prev => ({ ...prev, [cartItem.id]: true }));
            const result = await removeItem(cartItem.id);
            if (!result.success && result.message) {
                showNotification(result.message, 'error');
            } else {
                await fetchCart();
                // Refresh products to get latest stock
                await refreshProducts(searchQuery, pagination.current_page);
                showNotification('Item removed from cart', 'success');
            }
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to remove item.';
            showNotification(message, 'error');
        } finally {
            setUpdating(prev => ({ ...prev, [cartItem.id]: false }));
        }
    };

    // Create a map of product IDs to cart items for quick lookup
    const cartItemsMap = {};
    if (cart?.items) {
        cart.items.forEach(item => {
            cartItemsMap[item.product_id] = item;
        });
    }

    // Use stable layout reference - select layout outside render path to prevent remounting
    // This ensures the component tree doesn't remount on every state update
    const Layout = auth.user ? AuthenticatedLayout : GuestLayout;

    // Memoize layout props to prevent unnecessary re-renders
    // Only recreate when auth.user changes (which changes the layout type)
    const layoutProps = useMemo(() => {
        if (auth.user) {
            return {};
        }
        return {
            onLoginClick: () => setShowLoginModal(true),
            onRegisterClick: () => setShowRegisterModal(true),
        };
    }, [auth.user]);

    // Don't show full page loader, show skeleton loaders instead

    return (
        <Layout {...layoutProps}>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Our Products
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                            Discover our amazing collection of tech products
                        </p>

                        {/* Product Search */}
                        <ProductSearch
                            onSearchChange={handleSearchChange}
                            searchQuery={searchQuery}
                        />
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg dark:bg-red-900/20 dark:border-red-600 dark:text-red-400">
                            {error}
                        </div>
                    )}


                    {/* Products Grid */}
                    <ProductGrid
                        products={productsWithStock}
                        onAddToCart={addToCart}
                        addingToCart={addingToCart}
                        cartItems={cartItemsMap}
                        onUpdateQuantity={handleUpdateQuantity}
                        onRemove={handleRemoveFromCart}
                        updating={updating}
                        loading={loading}
                        skeletonCount={8}
                    />

                    {/* Pagination */}
                    {products.length > 0 && (
                        <Pagination pagination={pagination} onPageChange={handlePageChange} />
                    )}
                </div>
            </div>

            {/* Auth Modals */}
            <LoginModal
                show={showLoginModal && !showRegisterModal}
                onClose={() => {
                    // Always allow closing, but clear errors first
                    const hasLoginErrors = pageErrors && (pageErrors.email || pageErrors.password) && !pageErrors.name && !pageErrors.password_confirmation;
                    if (hasLoginErrors) {
                        router.reload({ only: ['errors'], preserveState: true, preserveScroll: true });
                    }
                    setShowLoginModal(false);
                }}
                canResetPassword={true}
                onSwitchToRegister={() => {
                    // Switch modals without reloading (errors will be cleared when registration modal closes)
                    // Clear login modal state first
                    setShowLoginModal(false);
                    // Open registration modal
                    setShowRegisterModal(true);
                }}
                onSwitchToForgotPassword={() => {
                    setShowLoginModal(false);
                    setShowForgotPasswordModal(true);
                }}
            />
            <RegisterModal
                show={showRegisterModal && !showLoginModal}
                onClose={() => {
                    // Always allow closing, but clear errors first
                    const hasRegistrationErrors = pageErrors && (pageErrors.name || pageErrors.password_confirmation || (pageErrors.email && (pageErrors.name || pageErrors.password_confirmation)) || (pageErrors.password && (pageErrors.name || pageErrors.password_confirmation)));
                    if (hasRegistrationErrors) {
                        router.reload({ only: ['errors'], preserveState: true, preserveScroll: true });
                    }
                    setShowRegisterModal(false);
                }}
                onSwitchToLogin={() => {
                    // Switch modals without reloading (errors will be cleared when login modal closes)
                    // Clear registration modal state first
                    setShowRegisterModal(false);
                    // Open login modal
                    setShowLoginModal(true);
                }}
            />
            <ForgotPasswordModal
                show={showForgotPasswordModal}
                onClose={() => setShowForgotPasswordModal(false)}
                onSwitchToLogin={() => {
                    setShowForgotPasswordModal(false);
                    setShowLoginModal(true);
                }}
            />
        </Layout>
    );
}
