"use client";

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { toast } from 'react-hot-toast';

interface Comment {
    id: string;
    content: string;
    createdAt: string;
    user: {
        address: string;
        username?: string;
    };
}

export const CommentsSection = ({ marketId }: { marketId: number }) => {
    const { address, isConnected } = useAccount();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isPosting, setIsPosting] = useState(false);

    const fetchComments = async () => {
        try {
            const res = await fetch(`http://localhost:3001/comments?marketId=${marketId}`);
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [marketId]);

    const handlePost = async () => {
        if (!newComment.trim()) return;
        if (!isConnected || !address) {
            toast.error("Please connect your wallet");
            return;
        }

        setIsPosting(true);
        try {
            const res = await fetch('http://localhost:3001/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    marketId,
                    userAddress: address,
                    content: newComment
                })
            });

            if (res.ok) {
                setNewComment('');
                fetchComments(); // Refresh list
                toast.success('Comment posted!');
            } else {
                toast.error('Failed to post comment');
            }
        } catch (e) {
            console.error(e);
            toast.error('Error posting comment');
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Input */}
            <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-neutral-200 dark:bg-zinc-800 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={isConnected ? "Add a comment..." : "Connect wallet to comment"}
                        disabled={!isConnected || isPosting}
                        className="w-full rounded-lg border border-neutral-200 bg-white p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white min-h-[100px]"
                    />
                    <div className="flex justify-end">
                        <button
                            onClick={handlePost}
                            disabled={!newComment.trim() || isPosting || !isConnected}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPosting ? 'Posting...' : 'Post Comment'}
                        </button>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="space-y-6">
                {isLoading ? (
                    <div className="text-center text-gray-500">Loading comments...</div>
                ) : comments.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">Be the first to comment!</div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
                                {comment.user.address.slice(2, 4)}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                                        {comment.user.username || `${comment.user.address.slice(0, 6)}...`}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {new Date(comment.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {comment.content}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
