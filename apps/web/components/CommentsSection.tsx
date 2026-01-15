"use client";

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { toast } from 'react-hot-toast';
import { Heart, MessageCircle, Reply } from 'lucide-react';
import { clsx } from 'clsx';

interface Comment {
    id: string;
    content: string;
    createdAt: string;
    parentId: string | null;
    user: {
        address: string;
        username?: string;
    };
    likes: any[];
    replies?: Comment[];
}

const CommentItem = ({
    comment,
    level = 0,
    onReply,
    onLike
}: {
    comment: Comment,
    level?: number,
    onReply: (parentId: string, content: string) => void,
    onLike: (id: string) => void
}) => {
    const { address } = useAccount();
    const [isReplying, setIsReplying] = useState(false);
    const [replyContent, setReplyContent] = useState('');

    const isLiked = comment.likes?.some((l: any) => l.user?.address === address) || false;
    const likeCount = comment.likes?.length || 0;

    const handleReplySubmit = () => {
        if (!replyContent.trim()) return;
        onReply(comment.id, replyContent);
        setIsReplying(false);
        setReplyContent('');
    };

    return (
        <div className={clsx("flex gap-3", level > 0 && "mt-4")}>
            <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold">
                    {comment.user.username?.[0] || comment.user.address.slice(2, 4)}
                </div>
                {level > 0 && <div className="w-[1px] h-full bg-zinc-200 dark:bg-zinc-800 mx-auto mt-2" />}
            </div>

            <div className="flex-1 min-w-0">
                <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl px-4 py-3 border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                            {comment.user.username || `${comment.user.address.slice(0, 6)}...`}
                        </span>
                        <span className="text-xs text-zinc-500">
                            {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap break-words">
                        {comment.content}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 mt-1 ml-2">
                    <button
                        onClick={() => onLike(comment.id)}
                        className={clsx("flex items-center gap-1 text-xs font-medium transition-colors",
                            isLiked ? "text-pink-500" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                        )}
                    >
                        <Heart size={14} className={isLiked ? "fill-current" : ""} />
                        {likeCount > 0 && likeCount} Like{likeCount !== 1 ? 's' : ''}
                    </button>

                    <button
                        onClick={() => setIsReplying(!isReplying)}
                        className="flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                    >
                        <Reply size={14} />
                        Reply
                    </button>
                </div>

                {/* Reply Input */}
                {isReplying && (
                    <div className="mt-3 flex gap-2">
                        <input
                            type="text"
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Write a reply..."
                            className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                            autoFocus
                        />
                        <button
                            onClick={handleReplySubmit}
                            disabled={!replyContent.trim()}
                            className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-blue-500"
                        >
                            Send
                        </button>
                    </div>
                )}

                {/* Nested Replies */}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 pl-4 border-l-2 border-zinc-100 dark:border-zinc-800">
                        {comment.replies.map(reply => (
                            <CommentItem
                                key={reply.id}
                                comment={reply}
                                level={level + 1}
                                onReply={onReply}
                                onLike={onLike}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

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
                // Filter top-level comments only, as nested ones are inside .replies
                const topLevel = data.filter((c: Comment) => !c.parentId);
                setComments(topLevel);
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

    const handlePost = async (parentId: string | null = null, content: string = newComment) => {
        if (!content.trim()) return;
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
                    content: content,
                    parentId
                })
            });

            if (res.ok) {
                if (!parentId) setNewComment('');
                fetchComments(); // Refresh list to show new comment/reply
                toast.success(parentId ? 'Reply posted!' : 'Comment posted!');
            } else {
                toast.error('Failed to post');
            }
        } catch (e) {
            console.error(e);
            toast.error('Error posting');
        } finally {
            setIsPosting(false);
        }
    };

    const handleLike = async (commentId: string) => {
        if (!isConnected || !address) return toast.error("Connect wallet to like");

        // Optimistic update
        setComments(prev => {
            // Helper to update tree deeply based on ID
            const updateTree = (list: Comment[]): Comment[] => {
                return list.map(c => {
                    if (c.id === commentId) {
                        const hasLiked = c.likes.some((l: any) => l.user?.address === address);
                        const newLikes = hasLiked
                            ? c.likes.filter((l: any) => l.user?.address !== address)
                            : [...c.likes, { user: { address } }]; // Mock
                        return { ...c, likes: newLikes };
                    }
                    if (c.replies) {
                        return { ...c, replies: updateTree(c.replies) };
                    }
                    return c;
                });
            };
            return updateTree(prev);
        });

        try {
            await fetch(`http://localhost:3001/comments/${commentId}/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userAddress: address })
            });
            fetchComments(); // Re-sync with server
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="space-y-8">
            {/* Input */}
            <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-neutral-200 dark:bg-zinc-800 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={isConnected ? "Add a comment..." : "Connect wallet to comment"}
                        disabled={!isConnected || isPosting}
                        className="w-full rounded-xl border border-neutral-200 bg-white p-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white min-h-[100px] shadow-sm transition-all"
                    />
                    <div className="flex justify-end">
                        <button
                            onClick={() => handlePost()}
                            disabled={!newComment.trim() || isPosting || !isConnected}
                            className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-bold text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
                        >
                            {isPosting ? 'Posting...' : 'Post Comment'}
                        </button>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="space-y-6">
                {isLoading ? (
                    <div className="flex flex-col gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex gap-4 animate-pulse">
                                <div className="h-10 w-10 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-1/4 bg-zinc-200 dark:bg-zinc-800 rounded" />
                                    <div className="h-12 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : comments.length === 0 ? (
                    <div className="text-center text-zinc-500 py-12 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                        <MessageCircle className="mx-auto mb-2 text-zinc-400" size={32} />
                        Be the first to share your thoughts!
                    </div>
                ) : (
                    comments.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            onReply={(pid, content) => handlePost(pid, content)}
                            onLike={handleLike}
                        />
                    ))
                )}
            </div>
        </div>
    );
};
