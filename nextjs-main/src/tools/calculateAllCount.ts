export const calculateAllCount = (data: Array<{ all_count: number }>): number => {
    if (!data || data.length === 0) return 0;
    return data.reduce((total, item) => total + item.all_count, 0);
};