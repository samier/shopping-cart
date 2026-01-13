import { useState, useCallback } from 'react';
import api from '@/api';

export function useCart() {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [updating, setUpdating] = useState({});

    const fetchCart = useCallback(async (showLoading = true) => {
        try {
            if (showLoading) {
                setLoading(true);
            }
            setError(null);
            const response = await api.get('/cart');
            setCart(response.data.data || response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load cart.');
            console.error(err);
        } finally {
            if (showLoading) {
                setLoading(false);
            }
        }
    }, []);

    const addItem = useCallback(async (productId, quantity = 1) => {
        try {
            const response = await api.post('/cart', {
                product_id: productId,
                quantity: quantity,
            });
            return { success: true, data: response.data };
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to add product to cart.';
            return { success: false, message };
        }
    }, []);

    const removeItem = useCallback(async (itemId) => {
        try {
            setUpdating(prev => ({ ...prev, [itemId]: true }));
            await api.delete(`/cart/${itemId}`);
            
            // Update cart locally to avoid full reload
            setCart(prevCart => {
                if (!prevCart) return prevCart;
                const updatedItems = prevCart.items.filter(item => item.id !== itemId);
                const newTotal = updatedItems.reduce((sum, item) => 
                    sum + (item.quantity * item.product.price), 0
                );
                return {
                    ...prevCart,
                    items: updatedItems,
                    total: Math.round(newTotal * 100) / 100,
                };
            });
            
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to remove item from cart.';
            return { success: false, message };
        } finally {
            setUpdating(prev => ({ ...prev, [itemId]: false }));
        }
    }, []);

    const updateItem = useCallback(async (itemId, quantity) => {
        if (quantity < 1) {
            return removeItem(itemId);
        }

        try {
            setUpdating(prev => ({ ...prev, [itemId]: true }));
            const response = await api.put(`/cart/${itemId}`, { quantity });
            
            // Update cart locally with the updated item to avoid full reload
            if (response.data?.data) {
                setCart(prevCart => {
                    if (!prevCart) return prevCart;
                    const updatedItems = prevCart.items.map(item => 
                        item.id === itemId 
                            ? { ...item, ...response.data.data, quantity: response.data.data.quantity }
                            : item
                    );
                    // Recalculate total
                    const newTotal = updatedItems.reduce((sum, item) => 
                        sum + (item.quantity * item.product.price), 0
                    );
                    return {
                        ...prevCart,
                        items: updatedItems,
                        total: Math.round(newTotal * 100) / 100,
                    };
                });
            } else {
                // Fallback to full fetch if response doesn't have data
                await fetchCart();
            }
            
            return { success: true, data: response.data?.data };
        } catch (err) {
            let message = 'Failed to update cart item.';
            if (err.response?.status === 400) {
                message = err.response?.data?.message || 'Insufficient stock available.';
            } else if (err.response?.data?.message) {
                message = err.response.data.message;
            }
            return { success: false, message };
        } finally {
            setUpdating(prev => ({ ...prev, [itemId]: false }));
        }
    }, [fetchCart, removeItem]);

    const checkout = useCallback(async () => {
        try {
            const response = await api.post('/orders');
            await fetchCart();
            return { success: true, data: response.data };
        } catch (err) {
            const message = err.response?.data?.message || 'An unexpected error occurred. Please check your cart items and try again.';
            return { success: false, message };
        }
    }, [fetchCart]);

    return {
        cart,
        setCart,
        loading,
        error,
        updating,
        fetchCart,
        addItem,
        updateItem,
        removeItem,
        checkout,
    };
}

