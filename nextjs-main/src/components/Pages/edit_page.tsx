import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Grid, Avatar, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import Head from 'next/head';

interface OrganizationFormData {
    fullName: string;
    shortName: string;
    englishName: string;
    city: string;
    country: string;
    website: string;
    rorId: string;
    isni: string;
}

interface PersonFormData {
    surname: string;
    name: string;
    patronymic: string;
    city: string;
    country: string;
    affiliation: string;
    position: string;
    degree: string;
    title: string;
    prnid: string;
    scopusId: string;
    wosId: string;
    orcid: string;
    spinId: string;
    rincId: string;
    researchGateId: string;
}

interface JournalFormData {
    fullName: string;
    shortName: string;
    englishName: string;
    issn: string;
    eissn: string;
    publisher: string;
    website: string;
    wosId: string;
    scopusId: string;
}

const EditPageContent: React.FC = () => {
    const [selectedPage, setSelectedPage] = useState('person');
    const [personData, setPersonData] = useState<PersonFormData>({
        surname: 'Новиков',
        name: 'Дмитрий',
        patronymic: 'Александрович',
        city: 'Москва',
        country: 'Россия',
        affiliation: 'Институт проблем управления им. В.А. Трапезникова РАН',
        position: 'директор',
        degree: 'доктор технических наук',
        title: 'доцент',
        prnid: '000000',
        scopusId: '000000',
        wosId: '000000',
        orcid: '000000',
        spinId: '000000',
        rincId: '000000',
        researchGateId: '000000'
    });

    const [orgData, setOrgData] = useState<OrganizationFormData>({
        fullName: 'Институт проблем управления им. В.А. Трапезникова РАН',
        shortName: 'ИПУ РАН',
        englishName: 'V.A. Trapeznikov Institute of Control Sciences of Russian Academy of Sciences',
        city: 'Москва',
        country: 'Россия',
        website: 'www.ipu.ru',
        rorId: 'ror.org/000000000',
        isni: '0000 0000 0000 0000'
    });

    const [journalData, setJournalData] = useState<JournalFormData>({
        fullName: 'Автоматика и телемеханика',
        shortName: 'АиТ',
        englishName: 'Automation and Remote Control',
        issn: '0005-2310',
        eissn: '1608-3032',
        publisher: 'ИПУ РАН',
        website: 'http://www.mathnet.ru/at',
        wosId: '000000',
        scopusId: '000000'
    });

    const handlePersonChange = (field: keyof PersonFormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setPersonData({
            ...personData,
            [field]: event.target.value
        });
    };

    const handleOrgChange = (field: keyof OrganizationFormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setOrgData({
            ...orgData,
            [field]: event.target.value
        });
    };

    const handleJournalChange = (field: keyof JournalFormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setJournalData({
            ...journalData,
            [field]: event.target.value
        });
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        console.log(selectedPage === 'person' ? personData : selectedPage === 'organization' ? orgData : journalData);
    };

    const labelStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingRight: 2,
        minWidth: '150px'
    };

    const fieldStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: 2
    };

    const availablePages = [
        { id: 'person', name: 'Новиков Д.А.' },
        { id: 'organization', name: 'Институт проблем управления им. В.А. Трапезникова РАН' },
        { id: 'journal', name: 'Автоматика и телемеханика' }
    ];

    const renderOrganizationForm = () => (
        <Grid container spacing={2}>
            <Grid item xs={12} sx={fieldStyle}>
                <Typography sx={labelStyle}>Тип</Typography>
                <TextField
                    sx={{ width: '30%' }}
                    variant="outlined"
                    size="small"
                    value="НИИ"
                    disabled
                />
            </Grid>
            <Grid item xs={12} sx={fieldStyle}>
                <Typography sx={labelStyle}>
                    Полное<br />название
                </Typography>
                <TextField
                    sx={{ width: '70%' }}
                    variant="outlined"
                    size="small"
                    value={orgData.fullName}
                    onChange={handleOrgChange('fullName')}
                />
            </Grid>
            <Grid item xs={12} sx={fieldStyle}>
                <Typography sx={labelStyle}>Сокращенное <br />название</Typography>
                <TextField
                    sx={{ width: '30%' }}
                    variant="outlined"
                    size="small"
                    value={orgData.shortName}
                    onChange={handleOrgChange('shortName')}
                />
            </Grid>
            <Grid item xs={12} sx={fieldStyle}>
                <Typography sx={labelStyle}>Английское <br />название</Typography>
                <TextField
                    sx={{ width: '70%' }}
                    variant="outlined"
                    size="small"
                    value={orgData.englishName}
                    onChange={handleOrgChange('englishName')}
                />
            </Grid>

            <Grid container item spacing={2}>
                <Grid item xs={12} md={7}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sx={fieldStyle}>
                            <Typography sx={labelStyle}>Город</Typography>
                            <TextField
                                sx={{ width: '40%' }}
                                variant="outlined"
                                size="small"
                                value={orgData.city}
                                onChange={handleOrgChange('city')}
                            />
                        </Grid>
                        <Grid item xs={12} sx={fieldStyle}>
                            <Typography sx={labelStyle}>Страна</Typography>
                            <TextField
                                sx={{ width: '40%' }}
                                variant="outlined"
                                size="small"
                                value={orgData.country}
                                onChange={handleOrgChange('country')}
                            />
                        </Grid>
                        <Grid item xs={12} sx={fieldStyle}>
                            <Typography sx={labelStyle}>Сайт</Typography>
                            <TextField
                                sx={{ width: '40%' }}
                                variant="outlined"
                                size="small"
                                value={orgData.website}
                                onChange={handleOrgChange('website')}
                            />
                        </Grid>
                        <Grid item xs={12} sx={fieldStyle}>
                            <Typography sx={labelStyle}>ROR ID</Typography>
                            <TextField
                                sx={{ width: '40%' }}
                                variant="outlined"
                                size="small"
                                value={orgData.rorId}
                                onChange={handleOrgChange('rorId')}
                            />
                        </Grid>
                        <Grid item xs={12} sx={fieldStyle}>
                            <Typography sx={labelStyle}>ISNI</Typography>
                            <TextField
                                sx={{ width: '40%' }}
                                variant="outlined"
                                size="small"
                                value={orgData.isni}
                                onChange={handleOrgChange('isni')}
                            />
                        </Grid>
                    </Grid>
                </Grid>

                <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'start', pl: 4 }}>
                    <Box sx={{ textAlign: 'center' }}>
                        <Avatar
                            sx={{ width: 200, height: 200, mb: 2 }}
                            alt="Фото организации"
                        />
                        <Button variant="contained" component="label" size="small">
                            Изменить фото
                            <input type="file" hidden accept="image/*" />
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </Grid>
    );

    const renderPersonForm = () => (
        <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sx={fieldStyle}>
                        <Typography sx={labelStyle}>Фамилия</Typography>
                        <TextField
                            sx={{ width: '40%' }}
                            variant="outlined"
                            size="small"
                            value={personData.surname}
                            onChange={handlePersonChange('surname')}
                        />
                    </Grid>
                    <Grid item xs={12} sx={fieldStyle}>
                        <Typography sx={labelStyle}>Имя</Typography>
                        <TextField
                            sx={{ width: '40%' }}
                            variant="outlined"
                            size="small"
                            value={personData.name}
                            onChange={handlePersonChange('name')}
                        />
                    </Grid>
                    <Grid item xs={12} sx={fieldStyle}>
                        <Typography sx={labelStyle}>Отчество</Typography>
                        <TextField
                            sx={{ width: '40%' }}
                            variant="outlined"
                            size="small"
                            value={personData.patronymic}
                            onChange={handlePersonChange('patronymic')}
                        />
                    </Grid>
                    <Grid item xs={12} sx={fieldStyle}>
                        <Typography sx={labelStyle}>Город</Typography>
                        <TextField
                            sx={{ width: '40%' }}
                            variant="outlined"
                            size="small"
                            value={personData.city}
                            onChange={handlePersonChange('city')}
                        />
                    </Grid>
                    <Grid item xs={12} sx={fieldStyle}>
                        <Typography sx={labelStyle}>Страна</Typography>
                        <TextField
                            sx={{ width: '40%' }}
                            variant="outlined"
                            size="small"
                            value={personData.country}
                            onChange={handlePersonChange('country')}
                        />
                    </Grid>
                </Grid>
            </Grid>

            <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'start' }}>
                <Box sx={{ textAlign: 'center' }}>
                    <Avatar
                        sx={{ width: 200, height: 200, mb: 2 }}
                        alt="Фото профиля"
                    />
                    <Button variant="contained" component="label" size="small">
                        Изменить фото
                        <input type="file" hidden accept="image/*" />
                    </Button>
                </Box>
            </Grid>

            <Grid item xs={12} >
                <Grid container spacing={2}>
                    <Grid item xs={12} sx={fieldStyle}>
                        <Typography sx={labelStyle}>Аффилиация</Typography>
                        <TextField
                            sx={{ width: '60%' }}
                            variant="outlined"
                            size="small"
                            value={personData.affiliation}
                            onChange={handlePersonChange('affiliation')}
                        />
                    </Grid>
                    <Grid item xs={12} sx={fieldStyle}>
                        <Typography sx={labelStyle}>Должность</Typography>
                        <TextField
                            sx={{ width: '60%' }}
                            variant="outlined"
                            size="small"
                            value={personData.position}
                            onChange={handlePersonChange('position')}
                        />
                    </Grid>
                    <Grid item xs={12} sx={fieldStyle}>
                        <Typography sx={labelStyle}>Ученая степень</Typography>
                        <TextField
                            sx={{ width: '60%' }}
                            variant="outlined"
                            size="small"
                            value={personData.degree}
                            onChange={handlePersonChange('degree')}
                        />
                    </Grid>
                    <Grid item xs={12} sx={fieldStyle}>
                        <Typography sx={labelStyle}>Ученое звание</Typography>
                        <TextField
                            sx={{ width: '60%' }}
                            variant="outlined"
                            size="small"
                            value={personData.title}
                            onChange={handlePersonChange('title')}
                        />
                    </Grid>

                    <Grid item xs={12} sx={fieldStyle}>
                        <Typography sx={labelStyle}>PRNID</Typography>
                        <TextField
                            sx={{ width: '20%' }}
                            variant="outlined"
                            size="small"
                            value={personData.prnid}
                            onChange={handlePersonChange('prnid')}
                        />
                    </Grid>
                    <Grid item xs={12} sx={fieldStyle}>
                        <Typography sx={labelStyle}>Scopus ID</Typography>
                        <TextField
                            sx={{ width: '20%' }}
                            variant="outlined"
                            size="small"
                            value={personData.scopusId}
                            onChange={handlePersonChange('scopusId')}
                        />
                    </Grid>
                    <Grid item xs={12} sx={fieldStyle}>
                        <Typography sx={labelStyle}>WoS Researcher ID</Typography>
                        <TextField
                            sx={{ width: '20%' }}
                            variant="outlined"
                            size="small"
                            value={personData.wosId}
                            onChange={handlePersonChange('wosId')}
                        />
                    </Grid>
                    <Grid item xs={12} sx={fieldStyle}>
                        <Typography sx={labelStyle}>ORCID</Typography>
                        <TextField
                            sx={{ width: '20%' }}
                            variant="outlined"
                            size="small"
                            value={personData.orcid}
                            onChange={handlePersonChange('orcid')}
                        />
                    </Grid>
                    <Grid item xs={12} sx={fieldStyle}>
                        <Typography sx={labelStyle}>SPIN РИНЦ</Typography>
                        <TextField
                            sx={{ width: '20%' }}
                            variant="outlined"
                            size="small"
                            value={personData.spinId}
                            onChange={handlePersonChange('spinId')}
                        />
                    </Grid>
                    <Grid item xs={12} sx={fieldStyle}>
                        <Typography sx={labelStyle}>РИНЦ ID</Typography>
                        <TextField
                            sx={{ width: '20%' }}
                            variant="outlined"
                            size="small"
                            value={personData.rincId}
                            onChange={handlePersonChange('rincId')}
                        />
                    </Grid>
                    <Grid item xs={12} sx={fieldStyle}>
                        <Typography sx={labelStyle}>ResearchGate ID</Typography>
                        <TextField
                            sx={{ width: '20%' }}
                            variant="outlined"
                            size="small"
                            value={personData.researchGateId}
                            onChange={handlePersonChange('researchGateId')}
                        />
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );

    const renderJournalForm = () => (
        <Grid container spacing={2}>
            <Grid item xs={12} sx={fieldStyle}>
                <Typography sx={labelStyle}>Тип</Typography>
                <TextField
                    sx={{ width: '40%' }}
                    variant="outlined"
                    size="small"
                    value="Журнал"
                    disabled
                />
            </Grid>
            <Grid item xs={12} sx={fieldStyle}>
                <Typography sx={labelStyle}>
                    Полное<br />название
                </Typography>
                <TextField
                    sx={{ width: '70%' }}
                    variant="outlined"
                    size="small"
                    value={journalData.fullName}
                    onChange={handleJournalChange('fullName')}
                />
            </Grid>
            <Grid item xs={12} sx={fieldStyle}>
                <Typography sx={labelStyle}>Сокращенное <br />название</Typography>
                <TextField
                    sx={{ width: '40%' }}
                    variant="outlined"
                    size="small"
                    value={journalData.shortName}
                    onChange={handleJournalChange('shortName')}
                />
            </Grid>
            <Grid item xs={12} sx={fieldStyle}>
                <Typography sx={labelStyle}>Английское <br />название</Typography>
                <TextField
                    sx={{ width: '70%' }}
                    variant="outlined"
                    size="small"
                    value={journalData.englishName}
                    onChange={handleJournalChange('englishName')}
                />
            </Grid>

            <Grid container item spacing={2}>
                <Grid item xs={12} md={7}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sx={fieldStyle}>
                            <Typography sx={labelStyle}>ISSN</Typography>
                            <TextField
                                sx={{ width: '40%' }}
                                variant="outlined"
                                size="small"
                                value={journalData.issn}
                                onChange={handleJournalChange('issn')}
                            />
                        </Grid>
                        <Grid item xs={12} sx={fieldStyle}>
                            <Typography sx={labelStyle}>eISSN</Typography>
                            <TextField
                                sx={{ width: '40%' }}
                                variant="outlined"
                                size="small"
                                value={journalData.eissn}
                                onChange={handleJournalChange('eissn')}
                            />
                        </Grid>
                        <Grid item xs={12} sx={fieldStyle}>
                            <Typography sx={labelStyle}>Издатель</Typography>
                            <TextField
                                sx={{ width: '60%' }}
                                variant="outlined"
                                size="small"
                                value={journalData.publisher}
                                onChange={handleJournalChange('publisher')}
                            />
                        </Grid>
                        <Grid item xs={12} sx={fieldStyle}>
                            <Typography sx={labelStyle}>Сайт</Typography>
                            <TextField
                                sx={{ width: '60%' }}
                                variant="outlined"
                                size="small"
                                value={journalData.website}
                                onChange={handleJournalChange('website')}
                            />
                        </Grid>
                        <Grid item xs={12} sx={fieldStyle}>
                            <Typography sx={labelStyle}>WoS ID</Typography>
                            <TextField
                                sx={{ width: '60%' }}
                                variant="outlined"
                                size="small"
                                value={journalData.wosId}
                                onChange={handleJournalChange('wosId')}
                            />
                        </Grid>
                        <Grid item xs={12} sx={fieldStyle}>
                            <Typography sx={labelStyle}>Scopus ID</Typography>
                            <TextField
                                sx={{ width: '60%' }}
                                variant="outlined"
                                size="small"
                                value={journalData.scopusId}
                                onChange={handleJournalChange('scopusId')}
                            />
                        </Grid>
                    </Grid>
                </Grid>

                <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'start', pl: 4 }}>
                    <Box sx={{ textAlign: 'center' }}>
                        <Avatar
                            sx={{ width: 200, height: 200, mb: 2 }}
                            alt="Обложка журнала"
                        />
                        <Button variant="contained" component="label" size="small">
                            Изменить фото
                            <input type="file" hidden accept="image/*" />
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </Grid>
    );

    return (
        <Box sx={{ padding: 2 }}>
            <Head>
                <title>Изменение страниц</title>
            </Head>
            
            <form onSubmit={handleSubmit}>
                <Box sx={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <Typography 
                        variant='body1'
                        sx={{ 
                            color: '#1B4596',
                            fontFamily: 'Nunito Sans, sans-serif',
                            textAlign: 'left',
                            width: '100%',
                            fontWeight: 500,
                            mb: 3,
                            fontSize: '1.5rem'
                        }}
                    >
                        Доступные страницы
                    </Typography>

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={3}>
                            <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                                {availablePages.map(page => (
                                    <Typography 
                                        key={page.id}
                                        sx={{ 
                                            mb: 2, 
                                            cursor: 'pointer',
                                            bgcolor: selectedPage === page.id ? '#e0e0e0' : 'transparent',
                                            p: 1,
                                            borderRadius: 1
                                        }}
                                        onClick={() => setSelectedPage(page.id)}
                                    >
                                        {page.name}
                                    </Typography>
                                ))}
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={9}>
                            {selectedPage === 'person' && renderPersonForm()}
                            {selectedPage === 'organization' && renderOrganizationForm()}
                            {selectedPage === 'journal' && renderJournalForm()}
                        </Grid>
                    </Grid>

                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <Button variant="contained" component="label" size="small">
                            Перейти к странице
                        </Button>
                    </Box>
                </Box>
            </form>
        </Box>
    );
};

export default EditPageContent;