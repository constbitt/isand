export const serializeSchemeValues = (s: string | null | undefined) => {
    return s?.slice(1, -1).split(",")
        .map(item => item.trim().slice(1, -1))
        .filter(item => item)
}