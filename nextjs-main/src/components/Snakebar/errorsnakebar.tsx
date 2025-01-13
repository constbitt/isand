import { useTypedDispatch } from "@/src/hooks/useTypedDispatch";
import { useTypedSelector } from "@/src/hooks/useTypedSelector";
import { selectAlertMessage, selectAlertOpen, setAlertOpen, selectAlertSeverity } from "@/src/store/slices/alertationSlice";
import { Alert, Snackbar } from "@mui/material"


const ErrorSnakeBar: React.FC = (): React.ReactElement => {
    const snackbarMessage = useTypedSelector(selectAlertMessage)
    const openAlertSnackbar = useTypedSelector(selectAlertOpen)
    const severity = useTypedSelector(selectAlertSeverity)
    const dispatch = useTypedDispatch()

    const handleCloseSnackbar = (event: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        dispatch(setAlertOpen(false))
    };

    const handleAlertClose = (event: React.SyntheticEvent<Element, Event>) => {
        dispatch(setAlertOpen(false))
    };



    return <Snackbar
        open={openAlertSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        // sx={{ zIndex: (theme) => theme.zIndex.modal + 1 }}
    >
        <Alert onClose={handleAlertClose} severity={severity} sx={{ width: '100%' }}>
            {snackbarMessage}
        </Alert>
    </Snackbar>
}

export default ErrorSnakeBar;