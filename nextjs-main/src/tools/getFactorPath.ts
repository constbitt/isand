export const getFactorPath = (level: number, path: string, factorsData: any[]): string[] => {
    if (level === 1) {
        return [path];
    }

    if (level === 2) {
        const factor = factorsData.find(f => f.c_f_1_name === path);
        if (factor) {
            return [factor.c_f_0_name, path];
        }
    }

    if (level === 3) {
        const factor = factorsData.find(f => f.c_f_2_name === path);
        if (factor) {
            return [factor.c_f_0_name, factor.c_f_1_name, path];
        }
    }

    return [];
};