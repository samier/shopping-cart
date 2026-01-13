import { CartProvider } from '@/Contexts/CartContext';

export default function RootLayout({ children }) {
    return <CartProvider>{children}</CartProvider>;
}

