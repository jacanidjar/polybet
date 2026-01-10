import toast from 'react-hot-toast';

// Enhanced toast with better dark mode support
const getToastStyle = (bgColor: string) => ({
    background: bgColor,
    color: '#fff',
    fontWeight: '500',
    borderRadius: '12px',
    padding: '12px 16px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
});

export const showSuccessToast = (message: string) => {
    toast.success(message, {
        duration: 4000,
        position: 'top-right',
        style: getToastStyle('#10B981'),
        iconTheme: {
            primary: '#fff',
            secondary: '#10B981',
        },
    });
};

export const showErrorToast = (message: string) => {
    toast.error(message, {
        duration: 4000,
        position: 'top-right',
        style: getToastStyle('#EF4444'),
        iconTheme: {
            primary: '#fff',
            secondary: '#EF4444',
        },
    });
};

export const showInfoToast = (message: string) => {
    toast(message, {
        duration: 4000,
        position: 'top-right',
        icon: 'ℹ️',
        style: getToastStyle('#3B82F6'),
    });
};

export const showLoadingToast = (message: string) => {
    return toast.loading(message, {
        position: 'top-right',
        style: {
            background: '#18181B',
            color: '#fff',
            fontWeight: '500',
            borderRadius: '12px',
            padding: '12px 16px',
        },
    });
};

export const showPromiseToast = <T,>(
    promise: Promise<T>,
    messages: {
        loading: string;
        success: string;
        error: string;
    }
) => {
    return toast.promise(
        promise,
        {
            loading: messages.loading,
            success: messages.success,
            error: messages.error,
        },
        {
            style: {
                borderRadius: '12px',
                padding: '12px 16px',
            },
            success: {
                duration: 4000,
                style: getToastStyle('#10B981'),
                iconTheme: {
                    primary: '#fff',
                    secondary: '#10B981',
                },
            },
            error: {
                duration: 4000,
                style: getToastStyle('#EF4444'),
                iconTheme: {
                    primary: '#fff',
                    secondary: '#EF4444',
                },
            },
        }
    );
};

export const dismissToast = (toastId: string) => {
    toast.dismiss(toastId);
};


export { toast };
