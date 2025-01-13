import React, { useEffect, useMemo, useState } from 'react';
import { Button, CircularProgress, Container, SelectChangeEvent, Stack, Typography } from '@mui/material';
import SettingTextField from '@/src/components/TextField/SettingTextField';
import SettingSelect from '@/src/components/Select/SettingSelect';
import StyledAvatar from '@/src/components/Avatar/StyledAvatar';
import { useGetAccountApiAffiliationQuery, useGetAccountApiCitiesQuery, useGetAccountApiCountriesQuery, useGetAccountApiJobTitleQuery } from '@/src/store/api/serverApiV4';
import { useGetAccountApiPersonDataQuery, usePostAccountApiAddPersonalityDataMutation } from '@/src/store/api/serverApiV6';

const PersonalityForm: React.FC = () => {
    const { data: personData, refetch: refetchPersonData, isLoading: isPersonDataLoading } = useGetAccountApiPersonDataQuery();
    const { data: affiliationData } = useGetAccountApiAffiliationQuery();
    const { data: citiesData } = useGetAccountApiCitiesQuery();
    const { data: jobTitleData } = useGetAccountApiJobTitleQuery();
    const { data: countriesData } = useGetAccountApiCountriesQuery();
    const [postPersonalityData] = usePostAccountApiAddPersonalityDataMutation();

    const [disabled, setDisabled] = useState<boolean>(true);
    const initialFormState = useMemo(() => ({
        firstName: personData?.first_name || '',
        lastName: personData?.last_name || '',
        patronymic: personData?.patronymic || '',
        city: personData?.city || '',
        country: personData?.country || '',
        affiliation: personData?.affiliations?.[personData?.affiliations.length - 1] || '',
        jobTitle: personData?.job_title[personData?.job_title.length - 1] || '',
        scienceDegree: personData?.science_degree || '',
        scienceTitle: personData?.science_title || '',
        prndId: personData?.prnd_id || '',
        scopusId: personData?.scopus_id || '',
        wosId: personData?.wos_id || '',
        orcidId: personData?.orcid_id || '',
        spinRsciId: personData?.spin_rsci_id || '',
        rsciId: personData?.rsci_id || '',
        researchGateId: personData?.research_gate_id || '',
    }), [personData]);

    const [formState, setFormState] = useState(initialFormState);

    useEffect(() => {
        if (personData) {
            setFormState({
                firstName: personData.first_name || '',
                lastName: personData.last_name || '',
                patronymic: personData.patronymic || '',
                city: personData.city || '',
                country: personData.country || '',
                affiliation: personData.affiliations?.[personData?.affiliations.length - 1] || '',
                jobTitle: personData.job_title[personData?.job_title.length - 1] || '',
                scienceDegree: personData.science_degree || '',
                scienceTitle: personData.science_title || '',
                prndId: personData.prnd_id || '',
                scopusId: personData.scopus_id || '',
                wosId: personData.wos_id || '',
                orcidId: personData.orcid_id || '',
                spinRsciId: personData.spin_rsci_id || '',
                rsciId: personData.rsci_id || '',
                researchGateId: personData.research_gate_id || '',
            });
        }
    }, [personData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, name: string) => {
        const value = e.target.value;
        setFormState((prevState) => ({ ...prevState, [name]: value }));
    };

    const handleSelectChange = (e: SelectChangeEvent<string>, name: string) => {
        const value = e.target.value;
        setFormState((prevState) => ({ ...prevState, [name]: value }));
    };

    if (isPersonDataLoading) {
        return (
            <Container sx={{ height: '100%', width: "60%", display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Stack width="60%" spacing={2}>
            <Stack direction={'row'} spacing={0.5}>
                <Button
                    onClick={() => {
                        setDisabled(prev => {
                            if (!prev) {
                                postPersonalityData({
                                    affiliation: formState.affiliation,
                                    city: formState.city,
                                    country: formState.country,
                                    job_title: formState.jobTitle,
                                    science_degree: formState.scienceDegree,
                                    science_title: formState.scienceTitle,
                                    prnd_id: formState.prndId,
                                    orcid_id: formState.orcidId,
                                    wos_id: formState.wosId,
                                    scopus_id: formState.scopusId,
                                    rsci_id: formState.rsciId,
                                    research_gate_id: formState.researchGateId,
                                    spin_rsci_id: formState.spinRsciId,
                                });
                            }
                            return !prev;
                        });
                    }}
                    type="submit"
                    variant="contained"
                    sx={{ width: '40%', textTransform: 'none', fontSize: 16 }}
                    style={{ backgroundColor: '#1B4596', height: '100%' }}
                >
                    {disabled ? 'Редактировать' : 'Сохранить'}
                </Button>
                <Button
                    onClick={async () => {
                        if (!disabled) {
                            setDisabled(true);
                            const updatedPersonData = await refetchPersonData();
                            if (updatedPersonData.data) {
                                setFormState({
                                    firstName: updatedPersonData.data.first_name || '',
                                    lastName: updatedPersonData.data.last_name || '',
                                    patronymic: updatedPersonData.data.patronymic || '',
                                    city: updatedPersonData.data.city || '',
                                    country: updatedPersonData.data.country || '',
                                    affiliation: updatedPersonData.data.affiliations?.[updatedPersonData.data.affiliations.length - 1] || '',
                                    jobTitle: updatedPersonData.data.job_title[updatedPersonData.data.job_title.length - 1] || '',
                                    scienceDegree: updatedPersonData.data.science_degree || '',
                                    scienceTitle: updatedPersonData.data.science_title || '',
                                    prndId: updatedPersonData.data.prnd_id || '',
                                    scopusId: updatedPersonData.data.scopus_id || '',
                                    wosId: updatedPersonData.data.wos_id || '',
                                    orcidId: updatedPersonData.data.orcid_id || '',
                                    spinRsciId: updatedPersonData.data.spin_rsci_id || '',
                                    rsciId: updatedPersonData.data.rsci_id || '',
                                    researchGateId: updatedPersonData.data.research_gate_id || '',
                                });
                            }
                        }
                    }}
                    type="submit"
                    variant="contained"
                    sx={{ width: '40%', textTransform: 'none', fontSize: 16 }}
                    style={{ backgroundColor: '#1B4596', height: '100%' }}
                >
                    {disabled ? 'Перейти к странице' : 'Отменить редактирование'}
                </Button>
            </Stack>
            <Stack direction="row" spacing={10} pt={2}>
                <Stack spacing={2}>
                    <Stack spacing={0.5}>
                        <SettingTextField
                            label="Имя"
                            value={formState.firstName}
                            disabled
                            blueBackGraund
                        />
                        <SettingTextField
                            label="Фамилия"
                            value={formState.lastName}
                            disabled
                            blueBackGraund
                        />
                        <SettingTextField
                            label="Отчество"
                            value={formState.patronymic}
                            disabled
                            blueBackGraund
                        />
                    </Stack>
                    <Stack spacing={1}>
                        <SettingSelect
                            label="Страна"
                            options={countriesData ?? []}
                            value={formState.country}
                            onChange={(e) => handleSelectChange(e, 'country')}
                            disabled={disabled}
                        />
                        <SettingSelect
                            label="Город"
                            options={citiesData ?? []}
                            value={formState.city}
                            onChange={(e) => handleSelectChange(e, 'city')}
                            disabled={disabled}
                        />
                    </Stack>
                </Stack>
                <StyledAvatar
                    fio={`${personData?.last_name ?? ''} ${personData?.first_name ?? ''}`}
                    url=""
                    height={163}
                    width={163}
                    editable={!disabled}
                />
            </Stack>
            <Stack spacing={0.5} width="80%">
                <SettingSelect
                    label="Аффилиация"
                    options={affiliationData ?? []}
                    value={formState.affiliation}
                    onChange={(e) => handleSelectChange(e, 'affiliation')}
                    disabled={disabled}
                />
                <SettingSelect
                    label="Должность"
                    options={jobTitleData ?? []}
                    value={formState.jobTitle}
                    onChange={(e) => handleSelectChange(e, 'jobTitle')}
                    disabled={disabled}
                />
            </Stack>
            <Stack spacing={0.5} width="80%">
                <SettingTextField
                    label="Ученая степень"
                    value={formState.scienceDegree}
                    onChange={(e) => handleInputChange(e, 'scienceDegree')}
                    disabled={disabled}
                />
                <SettingTextField
                    label="Ученое звание"
                    value={formState.scienceTitle}
                    onChange={(e) => handleInputChange(e, 'scienceTitle')}
                    disabled={disabled}
                />
            </Stack>
            <Stack spacing={0.5} width="40%">
                <SettingTextField
                    label="ПРНД ID"
                    value={formState.prndId}
                    onChange={(e) => handleInputChange(e, 'prndId')}
                    disabled={disabled}
                />
                <SettingTextField
                    label="Scopus ID"
                    value={formState.scopusId}
                    onChange={(e) => handleInputChange(e, 'scopusId')}
                    disabled={disabled}
                />
                <SettingTextField
                    label="WoS ResearcherID"
                    value={formState.wosId}
                    onChange={(e) => handleInputChange(e, 'wosId')}
                    disabled={disabled}
                />
                <SettingTextField
                    label="ORCID"
                    value={formState.orcidId}
                    onChange={(e) => handleInputChange(e, 'orcidId')}
                    disabled={disabled}
                />
                <SettingTextField
                    label="SPIN РИНЦ"
                    value={formState.spinRsciId}
                    onChange={(e) => handleInputChange(e, 'spinRsciId')}
                    disabled={disabled}
                />
                <SettingTextField
                    label="РИНЦ ID"
                    value={formState.rsciId}
                    onChange={(e) => handleInputChange(e, 'rsciId')}
                    disabled={disabled}
                />
                <SettingTextField
                    label="ResearchGate ID"
                    value={formState.researchGateId}
                    onChange={(e) => handleInputChange(e, 'researchGateId')}
                    disabled={disabled}
                />
            </Stack>
        </Stack>
    );
};

export default PersonalityForm;