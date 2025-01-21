export const parseStringToArray = (input: string): number[] => {
    return input
        .split(';')
        .map(item => item.trim()) 
        .filter(item => item !== '') 
        .map(Number);         
};