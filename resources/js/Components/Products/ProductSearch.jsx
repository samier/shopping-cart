import { useState, useEffect, useRef } from 'react';

export default function ProductSearch({ onSearchChange, searchQuery = '' }) {
    const [localQuery, setLocalQuery] = useState(searchQuery);
    const searchTimeoutRef = useRef(null);
    const searchInputRef = useRef(null);
    // Track if input was focused before search API call
    const wasFocusedBeforeSearchRef = useRef(false);

    // Sync with external searchQuery prop (only if changed externally)
    useEffect(() => {
        if (searchQuery !== localQuery) {
            setLocalQuery(searchQuery);
        }
    }, [searchQuery]);

    // Restore focus after parent re-render if it was focused before search
    // This runs after every render to catch focus loss from parent state updates
    useEffect(() => {
        if (wasFocusedBeforeSearchRef.current && searchInputRef.current) {
            // Use requestAnimationFrame to ensure DOM is ready after React render
            requestAnimationFrame(() => {
                if (searchInputRef.current && wasFocusedBeforeSearchRef.current) {
                    // Only restore if input is not already focused (avoid unnecessary focus calls)
                    if (document.activeElement !== searchInputRef.current) {
                        searchInputRef.current.focus();
                    }
                    // Reset flag after restoration attempt
                    wasFocusedBeforeSearchRef.current = false;
                }
            });
        }
    });

    // Handle search input change with debouncing (400ms)
    // Only triggers API call when trimmed query length is >= 3 characters
    useEffect(() => {
        // Clear previous timeout on each keystroke
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Trim the query to handle spaces
        const trimmedQuery = localQuery.trim();

        // If trimmed query is less than 3 characters, clear search immediately
        if (trimmedQuery.length === 0 || trimmedQuery.length < 3) {
            if (onSearchChange) {
                onSearchChange('');
            }
            return;
        }

        // Debounce search API call (400ms after user stops typing)
        searchTimeoutRef.current = setTimeout(() => {
            // Re-check trimmed query in case it changed during debounce
            const finalTrimmedQuery = localQuery.trim();
            if (onSearchChange && finalTrimmedQuery.length >= 3) {
                // Check if input is currently focused before making API call
                // This is the key: capture focus state before parent re-render
                wasFocusedBeforeSearchRef.current = searchInputRef.current &&
                    document.activeElement === searchInputRef.current;

                // Trigger search API call with trimmed query (will cause parent re-render)
                onSearchChange(finalTrimmedQuery);

                // Focus restoration happens in the useEffect above after re-render
            }
        }, 400);

        // Cleanup timeout on unmount
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [localQuery, onSearchChange]);

    const handleInputChange = (e) => {
        const value = e.target.value;
        // Allow user to type spaces in the input field
        // Spaces will be trimmed before sending to API in the useEffect
        setLocalQuery(value);
    };

    const handleClearSearch = () => {
        setLocalQuery('');
        if (onSearchChange) {
            onSearchChange('');
        }
        // Focus input after clearing
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    };

    return (
        <div className="relative w-full max-w-md mx-auto">
            <div className="relative flex items-center">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input
                    ref={searchInputRef}
                    type="text"
                    value={localQuery}
                    onChange={handleInputChange}
                    placeholder="Search products by name..."
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg leading-5 bg-white dark:bg-gray-800 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white sm:text-sm"
                    autoComplete="off"
                    autoFocus={false}
                />
                {localQuery && (
                    <button
                        onClick={handleClearSearch}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        type="button"
                        aria-label="Clear search"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
}
