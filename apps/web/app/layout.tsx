import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: {
        default: "Polybet - The World's Largest Prediction Market",
        template: "%s | Polybet"
    },
    description: "Trade on news, politics, crypto, and more with instant execution. The future of prediction markets.",
    keywords: ["prediction market", "crypto", "betting", "politics", "finance", "trading"],
    authors: [{ name: "Polybet Team" }],
    openGraph: {
        type: "website",
        locale: "en_US",
        url: "https://polybet.app",
        title: "Polybet - Prediction Markets",
        description: "Trade on the outcome of future events.",
        siteName: "Polybet",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "Polybet Preview",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Polybet",
        description: "The world's largest prediction market",
        creator: "@polybet",
    },
    icons: {
        icon: "/favicon.ico",
        apple: "/apple-touch-icon.png",
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <Providers>
                    {children}
                    <Toaster />
                </Providers>
            </body>
        </html>
    );
}
