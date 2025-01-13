import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/src/store/store";
import { HeaderModalStates } from "../types/authorizationTypes";
import { useSelector } from "react-redux";
import { useMemo } from 'react';
import { createSelector } from 'reselect';


const initState: HeaderModalStates = {
    affiliation: "",
    name: "",
    lastname: "",
    reg_email: "",
    auth_email: "",
    reg_confirm_password: "",
    reg_password: "",
    auth_password: "",
    patronymic: "",
    confirm_error: false,
    exist_email_error: false,
    len_error: false,
    none_email: false,
    none_last_name: false,
    none_name: false,
    none_password: false,
    pass_error: false,

    header_fio: "",
    header_avatar_url: "",
    authorization: false,
}

export const headerModalSlice = createSlice({
    name: "headerModal",
    initialState: initState,
    reducers: {
        setAffiliation: (state, action: PayloadAction<string>) => {
            state.affiliation = action.payload
        },
        setName: (state, action: PayloadAction<string>) => {
            state.name = action.payload;
        },
        setLastname: (state, action: PayloadAction<string>) => {
            state.lastname = action.payload;
        },
        setRegEmail: (state, action: PayloadAction<string>) => {
            state.reg_email = action.payload;
        },
        setAuthEmail: (state, action: PayloadAction<string>) => {
            state.auth_email = action.payload;
        },
        setRegConfirmPassword: (state, action: PayloadAction<string>) => {
            state.reg_confirm_password = action.payload;
        },
        setRegPassword: (state, action: PayloadAction<string>) => {
            state.reg_password = action.payload;
        },
        setAuthPassword: (state, action: PayloadAction<string>) => {
            state.auth_password = action.payload;
        },
        setPatronymic: (state, action: PayloadAction<string>) => {
            state.patronymic = action.payload;
        },
        setConfirmError: (state, action: PayloadAction<boolean>) => {
            state.confirm_error = action.payload;
        },
        setExistEmailError: (state, action: PayloadAction<boolean>) => {
            state.exist_email_error = action.payload;
        },
        setLenError: (state, action: PayloadAction<boolean>) => {
            state.len_error = action.payload;
        },
        setNoneEmail: (state, action: PayloadAction<boolean>) => {
            state.none_email = action.payload;
        },
        setNoneLastName: (state, action: PayloadAction<boolean>) => {
            state.none_last_name = action.payload;
        },
        setNoneName: (state, action: PayloadAction<boolean>) => {
            state.none_name = action.payload;
        },
        setNonePassword: (state, action: PayloadAction<boolean>) => {
            state.none_password = action.payload;
        },
        setPassError: (state, action: PayloadAction<boolean>) => {
            state.pass_error = action.payload;
        },
        setHeaderModalInitState: (state) => {
            state = {...initState, header_avatar_url: state.header_avatar_url, header_fio: state.header_fio};     
        },
        setHeaderInfo: (state, action: PayloadAction<{header_fio: string, header_avatar_url: string, authorization: boolean}>) => {
            state.header_fio = action.payload.header_fio;
            state.header_avatar_url = action.payload.header_avatar_url;
            state.authorization = action.payload.authorization
        },
    }
})

export const {
    setAffiliation,
    setName,
    setLastname,
    setRegEmail,
    setAuthEmail,
    setRegConfirmPassword,
    setRegPassword,
    setAuthPassword,
    setPatronymic,
    setConfirmError,
    setExistEmailError,
    setLenError,
    setNoneEmail,
    setNoneLastName,
    setNoneName,
    setNonePassword,
    setPassError,
    setHeaderModalInitState,
    setHeaderInfo,
} = headerModalSlice.actions

const selectHeaderModalState = (state: RootState) => state.headerModal;

export const selectAffiliation = (state: RootState) => state.headerModal.affiliation;
export const selectName = (state: RootState) => state.headerModal.name;
export const selectLastname = (state: RootState) => state.headerModal.lastname;
export const selectRegEmail = (state: RootState) => state.headerModal.reg_email;
export const selectAuthEmail = (state: RootState) => state.headerModal.auth_email;
export const selectRegConfirmPassword = (state: RootState) => state.headerModal.reg_confirm_password;
export const selectRegPassword = (state: RootState) => state.headerModal.reg_password;
export const selectAuthPassword = (state: RootState) => state.headerModal.auth_password;
export const selectPatronymic = (state: RootState) => state.headerModal.patronymic;
export const selectConfirmError = (state: RootState) => state.headerModal.confirm_error;
export const selectExistEmailError = (state: RootState) => state.headerModal.exist_email_error;
export const selectLenError = (state: RootState) => state.headerModal.len_error;
export const selectNoneEmail = (state: RootState) => state.headerModal.none_email;
export const selectNoneLastName = (state: RootState) => state.headerModal.none_last_name;
export const selectNoneName = (state: RootState) => state.headerModal.none_name;
export const selectNonePassword = (state: RootState) => state.headerModal.none_password;
export const selectPassError = (state: RootState) => state.headerModal.pass_error;
export const selectHeaderAvaterUrl = (state: RootState): string => state.headerModal.header_avatar_url;
export const selectHeaderFio = (state: RootState): string => state.headerModal.header_fio;
export const selectAuthorization = (state: RootState): boolean => state.headerModal.authorization;

export const selectRegistrationData = createSelector(
    [selectHeaderModalState],
    (headerModal) => ({
        first_name: headerModal.name,
        last_name: headerModal.lastname,
        patronymic: headerModal.patronymic,
        affiliation: headerModal.affiliation,
        main_email: headerModal.reg_email,
        password: headerModal.reg_password,
    })
);

export const selectAuthenticationData = createSelector(
    [selectHeaderModalState],
    (headerModal) => ({
        main_email: headerModal.auth_email,
        password: headerModal.auth_password,
    })
);