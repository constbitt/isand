import { useTypedDispatch } from "@/src/hooks/useTypedDispatch"
import { useTypedSelector } from "@/src/hooks/useTypedSelector"
import { useGetAccountApiAffiliationQuery } from "@/src/store/api/serverApiV4"
import { selectAffiliation, selectConfirmError, selectExistEmailError, selectLenError, selectNoneEmail, selectNoneLastName, selectNoneName, selectNonePassword, selectRegConfirmPassword, selectRegPassword, selectRegEmail, selectLastname, selectName, setAffiliation, setConfirmError, setExistEmailError, setLastname, setLenError, setName, setNoneEmail, setNoneLastName, setNoneName, setNonePassword, setPatronymic, setRegConfirmPassword, setRegEmail, setRegPassword } from "@/src/store/slices/headerModalSlice"
import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Stack, TextField, Typography } from "@mui/material"
import PasswordTextField from "../TextField/PasswordTextField"
import { useRouter } from 'next/router'

const RegistrationComponent: React.FC<{onKeyDown: () => void}> = ({onKeyDown}): React.ReactElement => {
    const dispatch = useTypedDispatch()
    const router = useRouter()
    const password = useTypedSelector(selectRegPassword)
    const confirm_password = useTypedSelector(selectRegConfirmPassword)
    const email = useTypedSelector(selectRegEmail)
    const lastname = useTypedSelector(selectLastname)
    const name = useTypedSelector(selectName)
    const confirm_error = useTypedSelector(selectConfirmError)
    const none_password = useTypedSelector(selectNonePassword)
    const exist_email_error = useTypedSelector(selectExistEmailError)
    const len_error = useTypedSelector(selectLenError)
    const none_email = useTypedSelector(selectNoneEmail)
    const none_lastname = useTypedSelector(selectNoneLastName)
    const none_name = useTypedSelector(selectNoneName)
    const affiliation = useTypedSelector(selectAffiliation)
    const {data: affiliation_data} = useGetAccountApiAffiliationQuery()

    const handleChangeLastname = (event: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setNoneLastName(false))
        dispatch(setLastname(event.target.value));
    };

    const handleChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setNoneName(false))
        dispatch(setName(event.target.value));
    };

    const handleChangePatronymic = (event: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setPatronymic(event.target.value));
    };

    const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setRegPassword(event.target.value));
        dispatch(setNonePassword(false))
        if (event.target.value.length > 0 && event.target.value.length < 8) {
            dispatch(setLenError(true));
        } else {
            dispatch(setLenError(false));
            if (event.target.value !== confirm_password && confirm_password.length > 0) dispatch(setConfirmError(true))
            else dispatch(setConfirmError(false))
        }
    };
    
    const handleConfirmPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setRegConfirmPassword(event.target.value));
        if (event.target.value !== password) {
            dispatch(setConfirmError(true));
        } else {
            dispatch(setConfirmError(false));
        }
    };

    const handleKeyDown = () => {
        let hasError = false
        
        if (!lastname) {
            dispatch(setNoneLastName(true))
            hasError = true
        }
        if (!name) {
            dispatch(setNoneName(true))
            hasError = true
        }
        if (!email) {
            dispatch(setNoneEmail(true))
            hasError = true
        }
        if (!password) {
            dispatch(setNonePassword(true))
            hasError = true
        }
        if (password && password.length < 8) {
            dispatch(setLenError(true))
            hasError = true
        }
        if (password !== confirm_password) {
            dispatch(setConfirmError(true))
            hasError = true
        }
        
        if (!hasError && email === 'admin@ipu.ru' && password === '12345678') {
            router.push('/account')
            onKeyDown()
        }
    }

    const textFieldsData: {label: string, onChange: (event: React.ChangeEvent<HTMLInputElement>) => void, error: boolean, helperText: string}[] = [
        { 
            label: 'Фамилия', 
            onChange: handleChangeLastname,
            error: none_lastname,
            helperText: none_lastname ? "Фамилия не может быть пустой" : ""
        },
        { 
            label: 'Имя', 
            onChange: handleChangeName,
            error: none_name,
            helperText: none_name ? "Имя не может быть пустым" : ""
        },
        { 
            label: 'Отчество (необязательно)', 
            onChange: handleChangePatronymic,
            error: false,
            helperText: ""
        },
    ];

    return (
        <Stack spacing={2}>
            <Stack spacing={0.8}>
                {textFieldsData.map((item, index) => <TextField 
                    key={index}
                    sx={{ flexGrow: 1 }} 
                    label={item.label} 
                    variant="outlined"
                    onChange={item.onChange}
                    error={item.error}
                    helperText={item.error ? item.helperText : ""}
                />)}
                <FormControl>
                    <InputLabel id="affiliation-label">Аффилиация (необязательно)</InputLabel>
                    <Select
                        labelId="affiliation-label"
                        label="Аффилиация (необязательно)"
                        autoWidth
                        size="medium"
                        value={affiliation}
                        onChange={(e: SelectChangeEvent) => {
                            dispatch(setAffiliation(e.target.value as string))
                        }}
                    >
                        {affiliation_data?.map((item, index) => <MenuItem value={item} key={index}>{item}</MenuItem>)}
                    </Select>
                </FormControl>
            </Stack>
            <Stack spacing={0.8}>
                <TextField
                    sx={{ flexGrow: 1 }}
                    label="Электронная почта"
                    variant="outlined"
                    onChange={(event) => {
                        dispatch(setRegEmail(event.target.value))
                        dispatch(setNoneEmail(false))
                        dispatch(setExistEmailError(false))
                    }}
                    error={none_email || exist_email_error}
                    helperText={none_email ? "Email не может быть пустым" : (exist_email_error ? "Email уже зарегистрирован" : "")}
                />
                <PasswordTextField
                    label="Пароль"
                    onChange={handlePasswordChange}
                    error={none_password || len_error}
                    error_text={none_password ? "Пароль не может быть пустым" : (len_error ? "Пароль должен быть не менее 8 символов" : "")}
                />
                <PasswordTextField
                    label="Пароль (повторно)"
                    onChange={handleConfirmPasswordChange}
                    error={confirm_error}
                    error_text={confirm_error ? "Пароли не совпадают" : ""}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === 'Enter') {
                            e.preventDefault()
                            handleKeyDown()
                        }
                    }} 
                />
            </Stack>
            <Typography 
                color={'rgba(128, 128, 153, 1)'} 
                sx={{alignSelf: 'flex-start'}}
            >
                Нажимая "Зарегистрироваться", я соглашаюсь с
                <span style={{color: 'rgba(27, 69, 150, 1)', cursor: 'pointer'}}> условиями использования системы ИСАНД</span>
            </Typography>
        </Stack>
    )
}

export default RegistrationComponent;