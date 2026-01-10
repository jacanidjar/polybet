"use client";

import { ConnectWallet } from "@/components/ConnectWallet";

export default function LoginPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 p-6">
            <div className="w-full max-w-md space-y-8 text-center bg-neutral-900 p-10 rounded-2xl border border-neutral-800">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">
                        Welcome to Polybet
                    </h2>
                    <p className="mt-2 text-sm text-gray-400">
                        Connect your wallet to start predicting. <br />
                        No account required.
                    </p>
                </div>

                <div className="flex justify-center">
                    <ConnectWallet />
                </div>

                <p className="px-8 text-center text-xs text-gray-500">
                    By connecting, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
    );
}
