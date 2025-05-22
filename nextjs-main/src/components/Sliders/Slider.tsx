import React, {useEffect, useState} from "react";
import Slider from '@mui/material/Slider';
import {Stack, Typography} from "@mui/material";
import {generateMarks} from "@/src/tools/sliderTool";
import {Mark} from "@mui/base";

const StyledSlider = ({
    label,
    value,
    min,
    max,
    onChange,
    width,
    marks,
    step
}: {
    value: number,
    label?: string | undefined,
    min: number,
    max: number,
    onChange: (event: Event, value: number) => void,
    width?: string | number,
    marks?: boolean | Mark[],
    step?: number
}) => {
    useEffect(() => {
        if (value) {
            setLocalValue(value)
        }
    }, [value]);

    const [localValue, setLocalValue] = useState<typeof value>(value)
    return (
        <Stack sx={{width: width}}>
            {label && <Typography>{label}</Typography>}
            <Slider value={localValue} onChangeCommitted={onChange as any} min={min} max={max} step={step} valueLabelDisplay={"auto"}
                    onChange={(_, value) => {
                        (typeof value == "number") && setLocalValue(value)
                    }}

                    marks={marks ? (typeof marks === "boolean") ? generateMarks(min, max) : marks : marks}/>
        </Stack>);
}

export default StyledSlider;