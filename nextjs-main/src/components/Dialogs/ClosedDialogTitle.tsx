import React, {ReactElement, ReactNode} from "react";
import {DialogTitle, IconButton, Stack} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const ClosedDialogTitle = ({children, setOpen}: {
    children: ReactNode,
    setOpen: (value: boolean) => void
}) => {
    return (<DialogTitle width={"100%"}>
        <Stack direction={"row"} sx={{width: "100%", justifyContent: "space-between", alignItems: "center"}}>
            {children}
            <IconButton onClick={() => {
                setOpen(false)
            }} sx={{height: "min-content"}}>
                <CloseIcon/>
            </IconButton>
        </Stack>
    </DialogTitle>)
}

export default ClosedDialogTitle