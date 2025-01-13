import React, { useEffect, useMemo, useState } from 'react';
import { Button, CircularProgress, Container, SelectChangeEvent, Stack } from '@mui/material';
import { useGetAccountApiOrgDataQuery, useGetAccountApiOrgTypesQuery, usePostAccountApiAddOrgDataMutation } from '@/src/store/api/serverApiV6';
import { useGetAccountApiCitiesQuery, useGetAccountApiCountriesQuery } from '@/src/store/api/serverApiV4';
import SettingTextField from '../TextField/SettingTextField';
import SettingSelect from '../Select/SettingSelect';
import StyledAvatar from '../Avatar/StyledAvatar';

interface OrgFormProps {
    org_id: number
}

const OrgForm: React.FC<OrgFormProps> = ({org_id}): React.ReactElement => {
    const {data: orgData, isLoading: isOrgDataLoading, refetch: refetchOrgData} = useGetAccountApiOrgDataQuery(org_id)
    const {data: orgTypeData} = useGetAccountApiOrgTypesQuery()
    const { data: citiesData } = useGetAccountApiCitiesQuery();
    const { data: countriesData } = useGetAccountApiCountriesQuery();
    const [postOrgData] = usePostAccountApiAddOrgDataMutation()
    
    const [disabled, setDisabled] = useState<boolean>(true);

    const initialFormState = useMemo(() => ({
        city: orgData?.city || '',
        country: orgData?.country || '',
        fullName: orgData?.full_name || '',
        shortName: orgData?.short_name || '',
        ror: orgData?.ror || '',
        isni: orgData?.isni || '',
        engName: orgData?.eng_name || '',
        orgType: orgData?.org_type || '',
        websiteUrl: orgData?.website_url || '',
        agentId: orgData?.agent_id || 0,
    }), [orgData]);

    const [formState, setFormState] = useState(initialFormState);

    useEffect(() => {
        if (orgData) {
            setFormState({
                city: orgData.city,
                country: orgData.country,
                fullName: orgData.full_name,
                shortName: orgData.short_name,
                ror: orgData.ror,
                isni: orgData.isni,
                engName: orgData.eng_name,
                orgType: orgData.org_type,
                websiteUrl: orgData.website_url,
                agentId: orgData.agent_id,
            });
        }
    }, [orgData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, name: string) => {
        const value = e.target.value;
        setFormState((prevState) => ({ ...prevState, [name]: value }));
    };

    const handleSelectChange = (e: SelectChangeEvent<string>, name: string) => {
        const value = e.target.value;
        setFormState((prevState) => ({ ...prevState, [name]: value }));
    };

    if (isOrgDataLoading) {
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
                                postOrgData({
                                    org_id: org_id,
                                    city: formState.city,
                                    country: formState.country,
                                    full_name: formState.fullName,
                                    short_name: formState.shortName,
                                    ror: formState.ror,
                                    isni: formState.isni,
                                    eng_name: formState.engName,
                                    org_type: formState.orgType,
                                    website_url: formState.websiteUrl,
                                    agent_id: formState.agentId,
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
                            const updatedOrgData = await refetchOrgData();
                            if (updatedOrgData.data) {
                                setFormState({
                                    city: updatedOrgData.data.city || '',
                                    country: updatedOrgData.data.country || '',
                                    fullName: updatedOrgData.data.full_name || '',
                                    shortName: updatedOrgData.data.short_name || '',
                                    ror: updatedOrgData.data.ror || '',
                                    isni: updatedOrgData.data.isni || '',
                                    engName: updatedOrgData.data.eng_name || '',
                                    orgType: updatedOrgData.data.org_type || '',
                                    websiteUrl: updatedOrgData.data.website_url || '',
                                    agentId: updatedOrgData.data.agent_id || 0,
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
            <SettingSelect
                sx={{pt: 2}}
                label="Тип"
                options={orgTypeData ?? []}
                value={formState.orgType}
                onChange={(e) => handleSelectChange(e, 'orgType')}
                disabled={disabled}
            />
            <Stack spacing={0.5}>
                <SettingTextField
                    label="Полное название"
                    value={formState.fullName}
                    onChange={(e) => handleInputChange(e, 'fullName')}
                    disabled={disabled}
                />
                <SettingTextField
                    label="Сокращенное название"
                    value={formState.shortName}
                    onChange={(e) => handleInputChange(e, 'shortName')}
                    disabled={disabled}
                />
                <SettingTextField
                    label="Английское название"
                    value={formState.engName}
                    onChange={(e) => handleInputChange(e, 'engName')}
                    disabled={disabled}
                />
            </Stack>
            <Stack direction="row" pt={2} spacing={4}>
                <Stack spacing={2} width={'100%'}>
                    <Stack spacing={0.5}>
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
                        <SettingTextField
                            label="Сайт"
                            value={formState.websiteUrl}
                            onChange={(e) => handleInputChange(e, 'websiteUrl')}
                            disabled={disabled}
                        />
                    </Stack>
                    <Stack spacing={1}>
                        <SettingTextField
                            label="ROR ID"
                            value={formState.ror}
                            onChange={(e) => handleInputChange(e, 'ror')}
                            disabled={disabled}
                        />
                        <SettingTextField
                            label="ISNI"
                            value={formState.isni}
                            onChange={(e) => handleInputChange(e, 'isni')}
                            disabled={disabled}
                        />
                    </Stack>
                </Stack>
                <StyledAvatar
                    fio={orgData?.full_name ?? ''}
                    url=""
                    height={163}
                    width={163}
                    editable={!disabled}
                />
            </Stack>
        </Stack>
    );
};

export default OrgForm;
