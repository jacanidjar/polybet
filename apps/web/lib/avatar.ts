export const generateAvatarGradient = (address: string) => {
    if (!address) return "linear-gradient(45deg, #3b82f6, #8b5cf6)";
    const hash = address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
        ["#3b82f6", "#8b5cf6"], // Blue to Purple
        ["#10b981", "#3b82f6"], // Emerald to Blue
        ["#f59e0b", "#ef4444"], // Amber to Red
        ["#8b5cf6", "#ec4899"], // Purple to Pink
        ["#06b6d4", "#8b5cf6"], // Cyan to Purple
    ];
    const pair = colors[hash % colors.length];
    return `linear-gradient(135deg, ${pair[0]}, ${pair[1]})`;
};
