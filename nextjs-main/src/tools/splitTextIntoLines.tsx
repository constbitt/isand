const splitTextIntoLines = (text: string, maxWidth: number): string[] => {
    const words = text.split(' ');
    let line = '';
    const lines: string[] = [];

    words.forEach(word => {
        if ((line + word).length < maxWidth) {
            line += `${word} `;
        } else {
            lines.push(line.trim());
            line = `${word} `;
        }
    });

    lines.push(line.trim());
    return lines;
};

export default splitTextIntoLines;