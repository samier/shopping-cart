import { useState, useEffect } from 'react';
import Modal from '@/Components/Modal';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useForm, router, usePage } from '@inertiajs/react';

export default function LoginModal({ show, onClose, canResetPassword, onSwitchToRegister, onSwitchToForgotPassword }) {
    const { data, setData, post, processing, errors: formErrors, reset, clearErrors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    // Get page-level errors from Inertia
    const { errors: pageErrors } = usePage().props;

    // Filter only login-related errors from page errors
    // Login errors: email and password (but NOT name or password_confirmation)
    const loginPageErrors = pageErrors ? {
        ...(pageErrors.email && !pageErrors.name && !pageErrors.password_confirmation ? { email: pageErrors.email } : {}),
        ...(pageErrors.password && !pageErrors.name && !pageErrors.password_confirmation ? { password: pageErrors.password } : {}),
    } : {};

    // Merge page errors with form errors (page errors take priority)
    const errors = { ...formErrors, ...loginPageErrors };

    const [clientErrors, setClientErrors] = useState({});

    // Show modal if there are login-related errors on the page
    useEffect(() => {
        if (pageErrors && (pageErrors.email || pageErrors.password)) {
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
        // Clear page errors by reloading only errors prop
        if (pageErrors && (pageErrors.email || pageErrors.password) && !pageErrors.name && !pageErrors.password_confirmation) {
            router.reload({ only: ['errors'], preserveState: true, preserveScroll: true });
        }
        onClose();
    };

    // Client-side validation
    const validateForm = () => {
        const newErrors = {};

        if (!data.email || data.email.trim() === '') {
            newErrors.email = 'The email field is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            newErrors.email = 'Please enter a valid email address.';
        }

        if (!data.password || data.password.trim() === '') {
            newErrors.password = 'The password field is required.';
        }

        return newErrors;
    };

    // Clear client errors when data changes
    useEffect(() => {
        if (Object.keys(clientErrors).length > 0) {
            setClientErrors({});
        }
    }, [data.email, data.password]);

    const submit = (e) => {
        e.preventDefault();

        // Client-side validation
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setClientErrors(validationErrors);
            return;
        }

        setClientErrors({});

        post(route('login'), {
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
                // Only reset password on success, not on error
                if (Object.keys(errors).length === 0) {
                    reset('password');
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
                            Welcome Back
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Sign in to your account
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
                    {/* General Error Message - Show for authentication failures */}

                    <div>
                        <InputLabel htmlFor="email" value="Email" />

                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full"
                            autoComplete="username"
                            isFocused={true}
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
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                            required
                        />

                        <InputError message={clientErrors.password || errors.password} className="mt-2" />
                    </div>

                    <div className="mt-4 block">
                        <label className="flex items-center">
                            <Checkbox
                                name="remember"
                                checked={data.remember}
                                onChange={(e) =>
                                    setData('remember', e.target.checked)
                                }
                            />
                            <span className="ms-2 text-sm text-gray-600 dark:text-gray-400">
                                Remember me
                            </span>
                        </label>
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
                                    Logging in...
                                </span>
                            ) : (
                                'Log in'
                            )}
                        </PrimaryButton>
                    </div>

                    <div className="mt-6 space-y-3">
                        {onSwitchToRegister && (
                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => {
                                        // Clear form errors and reset form before switching
                                        clearErrors();
                                        reset();
                                        setClientErrors({});
                                        // Switch to register modal without closing
                                        onSwitchToRegister();
                                    }}
                                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
                                >
                                    Don't have an account?{' '}
                                    <span className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">
                                        Sign up
                                    </span>
                                </button>
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </Modal>
    );
}

