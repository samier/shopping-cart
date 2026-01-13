import { useState, useEffect } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import ResetPasswordModal from '@/Components/Auth/ResetPasswordModal';
import LoginModal from '@/Components/Auth/LoginModal';
import { Head, router } from '@inertiajs/react';

export default function ResetPassword({ token, email, status }) {
    const [showResetModal, setShowResetModal] = useState(true);
    const [showLoginModal, setShowLoginModal] = useState(false);

    useEffect(() => {
        // If password was successfully reset, show login modal
        if (status) {
            setShowResetModal(false);
            setShowLoginModal(true);
        }
    }, [status]);

    return (
        <GuestLayout>
            <Head title="Reset Password" />
            
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
                <ResetPasswordModal
                    show={showResetModal}
                    onClose={() => {
                        setShowResetModal(false);
                        router.visit(route('products'));
                    }}
                    token={token}
                    email={email}
                    onSwitchToLogin={() => {
                        setShowResetModal(false);
                        setShowLoginModal(true);
                    }}
                />
                
                <LoginModal
                    show={showLoginModal}
                    onClose={() => {
                        setShowLoginModal(false);
                        router.visit(route('products'));
                    }}
                    canResetPassword={true}
                    onSwitchToRegister={() => {}}
                    onSwitchToForgotPassword={() => {}}
                />
            </div>
        </GuestLayout>
    );
}
