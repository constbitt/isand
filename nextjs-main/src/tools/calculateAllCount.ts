export const calculateAllCount = (authorActivity: Array<{ all_count: number }>): number => {
    return authorActivity.reduce((total, item) => total + item.all_count, 0);
};