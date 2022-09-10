export const generateRandomUserAvatar = () => {
    return `https://avatars.dicebear.com/api/human/${Math.round(
        Math.random() * 1000,
    )}.svg`;
};
