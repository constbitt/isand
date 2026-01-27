export const parseStringToArray = (str: string | undefined): number[] => {
    if (!str) return [];
    return str
        .split(';')
        .map(item => item.trim()) 
        .filter(item => item !== '') 
        .map(Number);         
};