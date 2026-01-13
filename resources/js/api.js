import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
    withCredentials: true, // Include cookies/session with requests
});

/**
 * Get CSRF token from meta tag, Inertia props, or cookie
 * Priority: meta tag (most reliable) > Inertia props > cookie
 */
const getCsrfToken = () => {
    // Try meta tag first (updated on every page load/reload)
    const metaToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (metaToken) {
        return metaToken;
    }

    // Try Inertia shared props (if available via usePage hook)
    // Note: This requires the component to be within Inertia context
    try {
        // Check if we can access Inertia's current page props
        if (window.__INERTIA__?.page?.props?.csrf_token) {
            return window.__INERTIA__.page.props.csrf_token;
        }
    } catch (e) {
        // Ignore if not available
    }

    // Fallback to cookie (Laravel sets XSRF-TOKEN cookie)
    const cookies = document.cookie.split('; ');
    const xsrfCookie = cookies.find(row => row.startsWith('XSRF-TOKEN='));
    if (xsrfCookie) {
        const token = xsrfCookie.split('=')[1];
        return decodeURIComponent(token);
    }

    return null;
};

/**
 * Request interceptor - Add CSRF token to all requests
 */
api.interceptors.request.use(
    (config) => {
        const token = getCsrfToken();
        if (token) {
            config.headers['X-CSRF-TOKEN'] = token;
        }

        // For DELETE requests, Laravel might need _method or proper method
        if (config.method === 'delete') {
            config.headers['X-HTTP-Method-Override'] = 'DELETE';
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Track retry attempts to prevent infinite loops
const csrfRetryCount = new Map();

/**
 * Response interceptor - Handle errors and refresh CSRF token
 */
api.interceptors.response.use(
    (response) => {
        // Update CSRF token from response headers if provided
        // Check both lowercase and original case headers
        const newToken = response.headers['x-csrf-token'] ||
                        response.headers['X-CSRF-Token'] ||
                        response.headers['X-CSRF-TOKEN'];
        if (newToken) {
            // Update meta tag
            const metaTag = document.querySelector('meta[name="csrf-token"]');
            if (metaTag) {
                metaTag.setAttribute('content', newToken);
            }
            // Update Inertia props if available
            try {
                if (window.__INERTIA__?.page?.props) {
                    window.__INERTIA__.page.props.csrf_token = newToken;
                }
            } catch (e) {
                // Ignore if not available
            }
        }
        return response;
    },
    async (error) => {
        // Handle CSRF token mismatch (419) - usually indicates session expiration
        if (error.response?.status === 419) {
            const requestKey = `${error.config.method}-${error.config.url}`;
            const retryCount = csrfRetryCount.get(requestKey) || 0;

            // Only retry once to prevent infinite loops
            if (retryCount < 1) {
                csrfRetryCount.set(requestKey, retryCount + 1);

                // Get fresh token from Inertia props
                const freshToken = getCsrfToken();

                if (freshToken) {
                    // Update the failed request's headers with fresh token
                    error.config.headers['X-CSRF-TOKEN'] = freshToken;

                    // Retry the request
                    try {
                        const response = await api.request(error.config);
                        csrfRetryCount.delete(requestKey);
                        return response;
                    } catch (retryError) {
                        csrfRetryCount.delete(requestKey);
                        // If retry also fails, session likely expired - redirect to products page
                        if (retryError.response?.status === 419) {
                            // Session expired - redirect to products page (login handled via modals)
                            window.location.href = '/products';
                        }
                        return Promise.reject(retryError);
                    }
                } else {
                    // No token available, session expired - redirect to products page
                    csrfRetryCount.delete(requestKey);
                    window.location.href = '/products';
                }
            } else {
                // Already retried, session expired - redirect to products page
                csrfRetryCount.delete(requestKey);
                window.location.href = '/products';
            }

            return Promise.reject(error);
        }

        // Handle authentication errors (401 Unauthorized)
        if (error.response?.status === 401 && !error.config.url.includes('/products')) {
            // Redirect to products page (login handled via modals, not separate page)
            if (!window.location.pathname.includes('/products')) {
                window.location.href = '/products';
            }
        }

        return Promise.reject(error);
    }
);

export default api;

