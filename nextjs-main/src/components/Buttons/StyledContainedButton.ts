import {styled} from "@mui/material/styles";
import {Button} from "@mui/material";

const StyledContainedButton = styled(Button)({
    color: "white",
    backgroundColor: "#1B4596 !important",
    ":hover" : {
        backgroundColor : "#163879 !important"
    },
    padding: "10px"
})


export default StyledContainedButton