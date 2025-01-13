export const descendingComparatorByField = (orderBy: string) => {
    return (a: any, b: any) => {
        if (b[orderBy] < a[orderBy]) {
            return -1;
        }
        if (b[orderBy] > a[orderBy]) {
            return 1;
        }
        return 0;
    }
}