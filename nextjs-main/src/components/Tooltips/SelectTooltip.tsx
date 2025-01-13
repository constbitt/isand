import React, {ReactElement, ReactNode} from "react";
import {tooltipClasses, TooltipProps, Typography} from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import {styled} from '@mui/material/styles';

const StyledTooltip = styled(({className, ...props}: TooltipProps) => (
    <Tooltip {...props} classes={{popper: className}}/>
))(() => ({
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: '#f5f5f9',
        color: 'rgba(0, 0, 0, 0.87)',
        fontSize: 15,
        border: '1px solid #dadde9',
    },
}));


const SelectTooltip = ({children, titleText, ...props}: { children: ReactElement | string, titleText: ReactNode }) => {
    return <StyledTooltip title={<Typography sx={{fontSize: "15px"}}>{titleText}</Typography>} placement={"top"}
                          leaveDelay={100} {...props}>
        <div onMouseEnter={(e)=>{
            e.preventDefault()
        }}>
            {children}
        </div>
    </StyledTooltip>
}

export default SelectTooltip;