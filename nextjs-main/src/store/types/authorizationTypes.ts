export interface Authorization {
    main_email: string
    password: string
}

export interface Registration {
    last_name: string
    first_name: string
    patronymic: string
    affiliation: string

    main_email: string
    password: string
}

export interface AuthorizationResponse {
    token: string
    fio: string
    avatar: string
}

export interface HeaderModalStates {
    auth_email: string
    auth_password: string
    lastname: string
    name: string
    patronymic: string
    affiliation: string
    reg_email: string
    reg_password: string
    reg_confirm_password: string
    len_error: boolean
    confirm_error: boolean
    pass_error: boolean
    exist_email_error: boolean
    none_password: boolean
    none_email: boolean
    none_name: boolean
    none_last_name: boolean

    header_fio: string
    header_avatar_url: string
    authorization: boolean
}

export interface AuthToken {
    avatar: string
    fio: string
}