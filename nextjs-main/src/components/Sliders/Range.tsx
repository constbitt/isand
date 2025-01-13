import React, {useEffect, useMemo, useState} from "react";
import Slider from '@mui/material/Slider';
import {Stack, Typography} from "@mui/material";
import {Mark} from "@mui/base";
import {generateMarks} from "@/src/tools/sliderTool";

const StyledRange = ({label, value, min, max, onChange, marks, width, place, step, disableSwap}: {
    value: number[],
    label?: string | undefined,
    min: number,
    max: number,
    onChange: (event: Event, value: number[]) => void,
    marks?: boolean | Mark[],
    width?: string | number,
    place?: 'left' | 'top'
    step?: number
    disableSwap?: boolean
}) => {
    
    const [localValue, setLocalValue] = useState<typeof value>(value)

    useEffect(() => {
        if (value) {
            setLocalValue(value)
        }
    }, [value]);

    const generatedMarks = useMemo(() => {
        return marks === true ? generateMarks(min, max) : marks;
    }, [marks, min, max]);

    const stackDirection = place === 'left' ? 'row' : 'column';
    const stackSpacing = place === 'left' ? 2 : 0;

    return (
        <Stack direction={stackDirection} alignItems="center" spacing={stackSpacing} sx={{width: width}}>
            {label && <Typography sx={{whiteSpace: 'nowrap'}}>{label}</Typography>}
            <Slider value={localValue} onChangeCommitted={onChange as any} onChange={(_, value) => {
                (typeof value != "number") && setLocalValue(value)
            }} min={min} max={max} valueLabelDisplay={"auto"} step={step} disableSwap={disableSwap}
                    marks={generatedMarks}/>
        </Stack>
    )
}

export default StyledRange;