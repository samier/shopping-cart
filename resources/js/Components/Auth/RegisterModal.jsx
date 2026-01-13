import { useState, useEffect } from 'react';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Link, useForm, router, usePage } from '@inertiajs/react';

export default function RegisterModal({ show, onClose, onSwitchToLogin }) {
    const { data, setData, post, processing, errors: formErrors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    // Get page-level errors from Inertia
    const { errors: pageErrors } = usePage().props;

    // Filter only registration-related errors from page errors
    // Registration errors: name, email (only if name or password_confirmation exists), password (only if name or password_confirmation exists), password_confirmation
    // This ensures login errors don't show in registration modal
    const registrationPageErrors = pageErrors ? {
        ...(pageErrors.name ? { name: pageErrors.name } : {}),
        // Only show email error if it's a registration error (has name or password_confirmation)
        ...(pageErrors.email && (pageErrors.name || pageErrors.password_confirmation) ? { email: pageErrors.email } : {}),
        // Only show password error if it's a registration error (has name or password_confirmation)
        ...(pageErrors.password && (pageErrors.name || pageErrors.password_confirmation) ? { password: pageErrors.password } : {}),
        ...(pageErrors.password_confirmation ? { password_confirmation: pageErrors.password_confirmation } : {}),
    } : {};

    // Merge page errors with form errors (page errors take priority)
    const errors = { ...formErrors, ...registrationPageErrors };

    const [clientErrors, setClientErrors] = useState({});

    // Show modal if there are registration-related errors on the page
    useEffect(() => {
        if (pageErrors && (pageErrors.name || pageErrors.email || pageErrors.password || pageErrors.password_confirmation)) {
            // Don't auto-open, but ensure errors are visible if modal is already open
        }
    }, [pageErrors]);

    // Prevent modal from closing if there are errors
    const hasErrors = Object.keys(errors).length > 0 || Object.keys(clientErrors).length > 0;

    // Clear errors when modal closes (allow manual closing, but clear errors first)
    const handleClose = () => {
        // Clear errors before closing
        clearErrors();
        reset();
        setClientErrors({});
        // Clear page errors by reloading only errors prop (only registration errors)
        if (pageErrors && (pageErrors.name || pageErrors.password_confirmation || (pageErrors.email && (pageErrors.name || pageErrors.password_confirmation)) || (pageErrors.password && (pageErrors.name || pageErrors.password_confirmation)))) {
            router.reload({ only: ['errors'], preserveState: true, preserveScroll: true });
        }
        onClose();
    };

    // Client-side validation
    const validateForm = () => {
        const newErrors = {};

        if (!data.name || data.name.trim() === '') {
            newErrors.name = 'The name field is required.';
        } else if (data.name.length > 255) {
            newErrors.name = 'The name may not be greater than 255 characters.';
        }

        if (!data.email || data.email.trim() === '') {
            newErrors.email = 'The email field is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            newErrors.email = 'Please enter a valid email address.';
        } else if (data.email !== data.email.toLowerCase()) {
            newErrors.email = 'The email field must be lowercase.';
        }

        if (!data.password || data.password.trim() === '') {
            newErrors.password = 'The password field is required.';
        } else if (data.password.length < 8) {
            newErrors.password = 'The password must be at least 8 characters.';
        }

        if (!data.password_confirmation || data.password_confirmation.trim() === '') {
            newErrors.password_confirmation = 'Please confirm your password.';
        } else if (data.password !== data.password_confirmation) {
            newErrors.password_confirmation = 'The password confirmation does not match.';
        }

        return newErrors;
    };

    // Clear client errors when data changes
    useEffect(() => {
        if (Object.keys(clientErrors).length > 0) {
            setClientErrors({});
        }
    }, [data.name, data.email, data.password, data.password_confirmation]);

    const submit = (e) => {
        e.preventDefault();

        // Client-side validation
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setClientErrors(validationErrors);
            return;
        }

        setClientErrors({});

        post(route('register'), {
            preserveScroll: true, // Keep scroll position on error
            preserveState: true, // Preserve component state on error
            onSuccess: (page) => {
                reset();
                clearErrors();
                setClientErrors({});

                // Update CSRF token from Inertia response
                if (page.props?.csrf_token) {
                    const metaTag = document.querySelector('meta[name="csrf-token"]');
                    if (metaTag) {
                        metaTag.setAttribute('content', page.props.csrf_token);
                    }
                    // Update Inertia props
                    try {
                        if (window.__INERTIA__?.page?.props) {
                            window.__INERTIA__.page.props.csrf_token = page.props.csrf_token;
                        }
                    } catch (e) {
                        // Ignore if not available
                    }
                }

                onClose();
                // Get pending product ID before reload
                const pendingProductId = sessionStorage.getItem('pendingProductId');

                // Reload only auth prop to update auth state while preserving component state
                // Use onSuccess callback to directly add the product after auth is updated
                router.reload({
                    only: ['auth'],
                    preserveState: true,
                    preserveScroll: true,
                    onSuccess: () => {
                        // After auth reload completes, add the pending product
                        if (pendingProductId) {
                            // Use a small delay to ensure cart context is ready
                            setTimeout(() => {
                                // Trigger a custom event that Products component can listen to
                                window.dispatchEvent(new CustomEvent('addPendingProductAfterLogin', {
                                    detail: { productId: parseInt(pendingProductId, 10) }
                                }));
                            }, 300);
                        }
                    }
                });
            },
            onError: (pageErrors) => {
                // Keep modal open on validation errors
                // Errors are automatically displayed via the errors object
                // Modal will remain open
            },
            onFinish: () => {
                // Only reset passwords on success, not on error
                if (Object.keys(errors).length === 0) {
                    reset('password', 'password_confirmation');
                }
            },
        });
    };

    return (
        <Modal show={show} onClose={handleClose} maxWidth="md" preventClose={false}>
            <div className="p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Create Account
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Sign up to get started
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        aria-label="Close"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={submit}>
                    {/* General Error Message - Show if there are any errors */}
                    {Object.keys(errors).length > 0 && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-600">
                            <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">
                                Please correct the following errors:
                            </p>
                            <ul className="text-sm text-red-600 dark:text-red-400 list-disc list-inside space-y-1">
                                {errors.name && <li>{errors.name}</li>}
                                {errors.email && <li>{errors.email}</li>}
                                {errors.password && <li>{errors.password}</li>}
                                {errors.password_confirmation && <li>{errors.password_confirmation}</li>}
                            </ul>
                        </div>
                    )}

                    <div>
                        <InputLabel htmlFor="name" value="Name" />

                        <TextInput
                            id="name"
                            name="name"
                            value={data.name}
                            className="mt-1 block w-full"
                            autoComplete="name"
                            isFocused={true}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />

                        <InputError message={clientErrors.name || errors.name} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="email" value="Email" />

                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full"
                            autoComplete="username"
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />

                        <InputError message={clientErrors.email || errors.email} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="password" value="Password" />

                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full"
                            autoComplete="new-password"
                            onChange={(e) => {
                                setData('password', e.target.value);
                                // Re-validate password_confirmation if it has a value
                                if (data.password_confirmation && data.password_confirmation !== e.target.value && clientErrors.password_confirmation) {
                                    // Keep the error if passwords don't match
                                } else if (data.password_confirmation === e.target.value && clientErrors.password_confirmation) {
                                    // Clear error if passwords now match
                                    setClientErrors(prev => {
                                        const newErrors = { ...prev };
                                        delete newErrors.password_confirmation;
                                        return newErrors;
                                    });
                                }
                            }}
                            required
                        />

                        <InputError message={clientErrors.password || errors.password} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <InputLabel
                            htmlFor="password_confirmation"
                            value="Confirm Password"
                        />

                        <TextInput
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="mt-1 block w-full"
                            autoComplete="new-password"
                            onChange={(e) => {
                                setData('password_confirmation', e.target.value);
                                // Clear password_confirmation error if passwords now match
                                if (data.password === e.target.value && clientErrors.password_confirmation) {
                                    setClientErrors(prev => {
                                        const newErrors = { ...prev };
                                        delete newErrors.password_confirmation;
                                        return newErrors;
                                    });
                                }
                            }}
                            required
                        />

                        <InputError
                            message={clientErrors.password_confirmation || errors.password_confirmation}
                            className="mt-2"
                        />
                    </div>

                    <div className="mt-6">
                        <PrimaryButton
                            className="w-full justify-center"
                            disabled={processing}
                        >
                            {processing ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Registering...
                                </span>
                            ) : (
                                'Create Account'
                            )}
                        </PrimaryButton>
                    </div>

                    <div className="mt-6 text-center">
                        {onSwitchToLogin && (
                            <button
                                type="button"
                                onClick={() => {
                                    // Clear form errors and reset form before switching
                                    clearErrors();
                                    reset();
                                    setClientErrors({});
                                    // Switch to login modal without closing
                                    onSwitchToLogin();
                                }}
                                className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
                            >
                                Already have an account?{' '}
                                <span className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">
                                    Sign in
                                </span>
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </Modal>
    );
}

