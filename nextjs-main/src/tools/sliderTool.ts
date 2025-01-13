import {Mark} from "@mui/base";

export const generateMarks = (min: number, max: number) => {
    const marks: Mark[] = [];

    if (min === max) {
        marks.push({ value: min, label: String(min) });
    } else {
        marks.push({ value: min, label: String(min) });
        const step = (max - min) / 4;

        if (step >= 1) {
            for (let i = 1; i < 4; i++) {
                const lb = Math.trunc(min + step * i);
                marks.push({ value: lb, label: String(lb) });
            }
        } else {
            for (let i = min + 1; i < max; i++) {
                marks.push({ value: i, label: String(i) });
            }
        }

        marks.push({ value: max, label: String(max) });
    }

    return marks;
};