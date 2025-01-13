export interface Setting {
    first_name: string
    last_name: string
    patronymic: string
    affiliations: string[]
    job_title: string[]
    city: string
    country: string
    science_degree: string
    science_title: string
    prnd_id: string
    scopus_id: string
    wos_id: string
    spin_rsci_id: string
    rsci_id: string
    research_gate_id: string
    orcid_id: string
}

export interface PersonalityData {
    city: string
    country: string
    affiliation: string
    job_title: string
    science_degree: string
    science_title: string
    prnd_id: string
    scopus_id: string
    wos_id: string
    orcid_id: string
    spin_rsci_id: string
    rsci_id: string
    research_gate_id: string
}

export interface OrganizationReg {
    full_name: string
    short_name: string
    ror: string
    isni: string
    eng_name: string
    org_type_name: string
    city: string
    country: string
}

export interface PersonHat {
    fio: string
    affiliations: string
    representative: number
}

export interface ModeratePages {
    fio: string
    org_names?: {
        name: string
        id: number
    }[]
}

export interface UploadPubl {
    file: File
    pnum: number
    is_complite: number
    id_upload: number
}

export interface Author {
    a_fullname: string
    a_affiliation: string
}

export interface GrobidPubl {
    title: string
    authors: Author[]
    year: string
}

export interface GrobidCorrect extends GrobidPubl {
    id_upload: number
}

export interface OrgSetting {
    full_name: string
    short_name: string
    ror: string
    isni: string
    eng_name: string
    org_type: string
    agent_id: number
    country: string
    city: string
    website_url: string
}

export interface OrgData extends OrgSetting {
    org_id: number
}