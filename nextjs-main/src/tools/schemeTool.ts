export const serializeSchemeValues = (s: string | null | undefined) => {

    if (!s) return [];

    const regex = /'([^']+)'/g;
    const matches = [];
    let match;

    while ((match = regex.exec(s)) !== null) {
        matches.push(match[1].trim());
    }
    
    return matches;
};
