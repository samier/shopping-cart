import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function ConfirmModal({
    show = false,
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    variant = 'default', // 'default', 'danger'
}) {
    const isDanger = variant === 'danger';

    return (
        <Modal show={show} onClose={onCancel} maxWidth="sm">
            <div className="p-8">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    {isDanger && (
                        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 ring-4 ring-red-50 dark:ring-red-900/20">
                            <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                    )}
                    {!isDanger && (
                        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 ring-4 ring-indigo-50 dark:ring-indigo-900/20">
                            <svg className="h-8 w-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    )}
                </div>

                {/* Title */}
                <h3 className={`text-xl font-bold text-center mb-3 ${isDanger ? 'text-red-900 dark:text-red-100' : 'text-gray-900 dark:text-white'}`}>
                    {title}
                </h3>

                {/* Message */}
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-8 leading-relaxed">
                    {message}
                </p>

                {/* Actions */}
                <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
                    <SecondaryButton
                        onClick={onCancel}
                        className="w-full sm:w-auto order-2 sm:order-1"
                    >
                        {cancelText}
                    </SecondaryButton>
                    <PrimaryButton
                        onClick={onConfirm}
                        className={`w-full sm:w-auto order-1 sm:order-2 ${
                            isDanger 
                                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500 dark:bg-red-600 dark:hover:bg-red-700' 
                                : ''
                        }`}
                    >
                        {confirmText}
                    </PrimaryButton>
                </div>
            </div>
        </Modal>
    );
}

