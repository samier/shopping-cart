import { useState, useCallback } from 'react';
import api from '@/api';

// Products per page - matches backend config/products.php
const PRODUCTS_PER_PAGE = 8;

export function useProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: PRODUCTS_PER_PAGE,
        total: 0,
        has_more: false,
    });

    const fetchProducts = useCallback(async (page = 1, append = false, search = '') => {
        try {
            if (append) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }
            setError(null);
            const response = await api.get('/products', {
                params: {
                    page,
                    per_page: PRODUCTS_PER_PAGE,
                    search: search && search.length >= 3 ? search : undefined, // Only include search if 3+ characters
                },
            });

            // Laravel paginated resource response structure: { data: [...], links: {...}, meta: {...} }
            const newProducts = response.data.data || [];

            if (append) {
                // Append new products to existing ones
                setProducts(prevProducts => [...prevProducts, ...newProducts]);
            } else {
                // Replace products for first load or refresh
                setProducts(newProducts);
            }

            // Extract pagination from meta object (Laravel's standard pagination structure)
            if (response.data.meta) {
                setPagination({
                    current_page: response.data.meta.current_page,
                    last_page: response.data.meta.last_page,
                    per_page: response.data.meta.per_page,
                    total: response.data.meta.total,
                    from: response.data.meta.from,
                    to: response.data.meta.to,
                    has_more: response.data.meta.current_page < response.data.meta.last_page,
                });
            }
        } catch (err) {
            setError('Failed to load products. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    /**
     * Update product stock in the local state
     */
    const updateProductStock = useCallback((productId, newStock) => {
        setProducts(prevProducts =>
            prevProducts.map(product =>
                product.id === productId
                    ? { ...product, stock_quantity: newStock }
                    : product
            )
        );
    }, []);

    /**
     * Load more products (next page)
     */
    const loadMore = useCallback(async () => {
        if (loadingMore || !pagination.has_more) {
            return;
        }
        const nextPage = pagination.current_page + 1;
        await fetchProducts(nextPage, true);
    }, [fetchProducts, pagination, loadingMore]);

    /**
     * Refresh products to get latest stock from server (silent - no loading state)
     * @param {string} search - Search query
     * @param {number} page - Page number to refresh (defaults to current page)
     */
    const refreshProducts = useCallback(async (search = '', page = null) => {
        try {
            // Use provided page or current page from pagination state
            const currentPage = page !== null ? page : pagination.current_page;

            // Don't set loading state for silent refresh
            const response = await api.get('/products', {
                params: {
                    page: currentPage,
                    per_page: PRODUCTS_PER_PAGE,
                    search: search && search.length >= 3 ? search : undefined, // Only include search if 3+ characters
                },
            });

            // Laravel paginated resource response structure: { data: [...], links: {...}, meta: {...} }
            setProducts(response.data.data || []);

            // Extract pagination from meta object (Laravel's standard pagination structure)
            if (response.data.meta) {
                setPagination({
                    current_page: response.data.meta.current_page,
                    last_page: response.data.meta.last_page,
                    per_page: response.data.meta.per_page,
                    total: response.data.meta.total,
                    from: response.data.meta.from,
                    to: response.data.meta.to,
                    has_more: response.data.meta.current_page < response.data.meta.last_page,
                });
            } else {
                // Fallback: if no pagination data, keep current pagination state
                setPagination(prev => ({
                    ...prev,
                    has_more: false,
                }));
            }
            setError(null);
        } catch (err) {
            // Silently fail - don't show error for background refresh
            console.error('Failed to refresh products:', err);
        }
    }, [pagination.current_page]);

    return {
        products,
        loading,
        loadingMore,
        error,
        pagination,
        fetchProducts,
        loadMore,
        updateProductStock,
        refreshProducts,
        setProducts,
    };
}

