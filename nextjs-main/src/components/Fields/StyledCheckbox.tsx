import {Checkbox, Stack, SxProps, Theme, Typography} from "@mui/material";
import React from "react";

const StyledCheckbox = ({value, onChange, title, disabled, sx}: {
    value: boolean,
    title: string,
    disabled?: boolean,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    sx?: SxProps<Theme>
}) => {
    return (<Stack direction={"row"} sx={{...sx}}>
        <Checkbox checked={value} disabled={disabled} sx={{height: "min-content", alignSelf: "center"}}
                  onChange={onChange} color={"secondary"}/>
        <Typography sx={{
            textAlign: "center"
        }}>{title}</Typography>
    </Stack>)
}

export default StyledCheckbox;