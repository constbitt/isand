import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {RootState} from "@/src/store/store";
import { AlertState } from "../types/alertTypes";


const initState: AlertState = {
    message: "",
    open: false,
    severity: 'error'
}
export const alertationSlice = createSlice({
    name: "alertation",
    initialState: initState,
    reducers: {
        setAlert: (state, action: PayloadAction<{message: string, severity: 'error'|'success', open: boolean}>) => {
            state.message = action.payload.message
            state.severity = action.payload.severity
            state.open = action.payload.open
        },
        setAlertOpen: (state, action: PayloadAction<boolean>) => {
            state.open = action.payload
        },
    }
})

export const {
    setAlert,
    setAlertOpen,
} = alertationSlice.actions

export const selectAlertMessage = (state: RootState): string => state.alertation.message
export const selectAlertOpen = (state: RootState): boolean => state.alertation.open
export const selectAlertSeverity = (state: RootState): 'error'| 'success' => state.alertation.severity