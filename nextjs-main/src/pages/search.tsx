// @ts-nocheck

import React, { useState, KeyboardEvent, useEffect } from 'react';
import Image from "next/image";
import { useRouter, NextRouter } from 'next/router';
import {
    Button, FormControl, FormLabel, RadioGroup,
    Radio, Accordion, AccordionSummary, AccordionDetails, 
    FormControlLabel, Checkbox, Box, Stack, TextField, Container, Typography, Card
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {useTypedDispatch} from "@/src/hooks/useTypedDispatch";
import {useTypedSelector} from "@/src/hooks/useTypedSelector";
import {setSearchFields, setPType, selectPhrase,
    setSortBy, setPhrase, setSortType, selectSearchFields,
    selectSortBy, selectSortType,
    selectTimeRange,
    setTimeRange,
    selectSearchApiRequest} from "@/src/store/slices/searchApiSlice"
import Link from "next/link";
import { RootState } from '../store/store';
import { AnyAction } from '@reduxjs/toolkit';
import Ratedown from '@/src/assets/images/search/ratedown.svg'
import Rateup from '@/src/assets/images/search/rateup.svg'
import StyledCheckbox from '../components/Fields/StyledCheckbox';
import Head from 'next/head';
import { useGetPublicationsTypesQuery } from '../store/api/serverApiV3';
import StyledRange from '@/src/components/Sliders/Range';
import { getAuthors, getJournals, getRunningQueriesThunk as apiV1GetRunningQueriesThunk } from "@/src/store/api/serverApi";
import { wrapper } from "@/src/store/store";
import { getOrganization, getRunningQueriesThunk as apiV2GetRunningQueriesThunk } from "@/src/store/api/serverApiV2";
import Select from "react-select";
import { ApiResponse } from "@/src/store/types/apiTypes";
import { Author } from "@/src/store/types/authorTypes";
import { Laboratory } from "@/src/store/types/laboratoryTypes";
import StyledAvatar from '@/src/components/Avatar/StyledAvatar';
import StyledContainedButton from "@/src/components/Buttons/StyledContainedButton";
import { useGetPublIsandInfoQuery, useSearchPublicationsQuery, useGetPublCardInfoQuery, useGetPublByFileStoreIdQuery, useSearchPublByTitleQuery } from "@/src/store/api/serverApiV2_5";
import { useInView } from "react-intersection-observer";
import CircularProgress from "@mui/material/CircularProgress";

interface CheckboxDropdownProps {
    options: string[]
    request_options: number[]
    name: string
    reducer: Function
    disableds: boolean[]
    disabled: boolean
}

const CheckboxDropdown: React.FC<CheckboxDropdownProps> = ({
    options, request_options, name, reducer, disableds, disabled
}): React.ReactElement => {
    const dispatch = useTypedDispatch();
    const [checked, setChecked] = useState<number[]>([]);
    const [open, setOpen] = useState(false)

    const handleChangeAccordion = () => {
        if (!disabled) {
            setOpen(!open);
        }
    }

    const handleChange = (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const newChecked: number[] = [...checked];
        if (event.target.checked) {
            newChecked.push(request_options[index]);
        } else {
            const indexToRemove = newChecked.indexOf(request_options[index]);
            if (indexToRemove !== -1) {
                newChecked.splice(indexToRemove, 1);
            }
        }
        setChecked(newChecked);
        dispatch(reducer(newChecked));
    };

    return (
        <Box>
            <Accordion disabled={disabled} expanded={!disabled ? open : false} onChange={handleChangeAccordion}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="checkbox-dropdown-content"
                    id="checkbox-dropdown-header"
                >
                    {name}
                </AccordionSummary>
                <AccordionDetails>
                    <Stack>
                        {options.map((option: string, index: number) => (
                            <FormControlLabel
                                key={index}
                                control={
                                    <Checkbox
                                        checked={checked.indexOf(request_options[index]) !== -1}
                                        onChange={handleChange(index)}
                                        name={option}
                                        disabled={disableds[index]}
                                    />
                                }
                                label={option}
                            />
                        ))}
                    </Stack>
                </AccordionDetails>
            </Accordion>
        </Box>
    );
};

interface IRadioGroupComponent {
    formLabel?: string;
    labels: (string | React.ReactElement)[];
    values: string[];
    radioGroupName: string;
    reducer: (value: string) => AnyAction;
    selector: (state: RootState) => string;
    disableds: boolean[]
}

const RadioGroupComponent: React.FC<IRadioGroupComponent> = ({
    labels,
    formLabel,
    values,
    radioGroupName,
    disableds,
    reducer,
    selector,
}): React.ReactElement => {
    const dispatch = useTypedDispatch();
    const selectedValue = useTypedSelector(selector);
    const [value, setValue] = useState<typeof selectedValue>(selectedValue);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value);
        dispatch(reducer(event.target.value));
    };

    return (
        <FormControl component="fieldset">
            {formLabel && <FormLabel id="sort-order-label">{formLabel}</FormLabel>}
            <RadioGroup aria-labelledby="sort-by-label" name={radioGroupName} value={value} onChange={handleChange}>
                {labels.map((label: string | React.ReactElement, index: number) => (
                    <FormControlLabel
                        key={index}
                        value={values[index]}
                        control={<Radio />}
                        label={label}
                        disabled={disableds[index]}
                    />
                ))}
            </RadioGroup>
        </FormControl>
    );
};


const AuthorCard = ({ author }: { author: Author }) => {
    return (
        <Card key={author.id} sx={{ m: 0, boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)', display: 'flex', alignItems: 'center', padding: '16px' }}>
            <StyledAvatar 
                fio={author.value} 
                width={100}
                height={100}
                url={''}
                editable={false}
            />
            <Typography variant="h6" sx={{ marginLeft: '16px', fontSize: '2.0rem' }}>{author.value}</Typography>
        </Card>
    );
};

function AuthorsResultPage({
    authorsResponse,
    laboratoriesResponse
}: {
    authorsResponse: ApiResponse<Author[]>,
    laboratoriesResponse: ApiResponse<Laboratory[]>
}) {
    const [selectedAuthors, setSelectedAuthors] = useState<Author[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const { data: authors, error: authorsError } = authorsResponse;
    const handleHref = (creatureId: string) => {
        return `/search/author?creature_id=${creatureId}`;
    };
    if (!authors) {
        return <div>{"Some error occurred..."}</div>;
    }
    const filteredAuthors = authors.filter(author =>
        author.value.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const customStyles = {
        control: (base: any) => ({
            ...base,
            borderRadius: '7px',
            padding: '4px',
        }),
        multiValue: (base: any) => ({
            ...base,
            backgroundColor: '#e4e4e4',
            borderRadius: '4px',
        }),
        multiValueLabel: (base: any) => ({
            ...base,
            color: '#000',
        }),
    };
    const handleSearch = () => {};
    const getOptionLabel = (option: any) => option.name || option.label || option.value || "Unknown";
    const getOptionValue = (option: any) => option.id || option.value;
    return (
        <>
            <Head>
                <title>Текстовый поиск</title>
            </Head>
            <Stack sx={{ height: "100%" }} mt={2} spacing={3}>
                <Stack sx={{ width: "90%", alignSelf: "center" }} spacing={3}>
                    <Stack direction={"row"} spacing={1} sx={{ justifyContent: "center" }}>
                        <Box sx={{ width: "100%" }} role="presentation">
                            <Stack sx={{ width: "100%"}} spacing={2.7}>
                            <input
                                    type="text"
                                    placeholder="Введите ФИО автора"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </Stack>
        </Box>
                        <StyledContainedButton 
                            variant="contained"
                            onClick={handleSearch} 
                        >
                            Найти
                        </StyledContainedButton>
                    </Stack>
                    <Stack spacing={3}>
                        {filteredAuthors.map((author) => (
                            <Link key={author.id} href={handleHref(author.id)}>
                                <AuthorCard author={author} />
                            </Link>
                        ))}
                    </Stack>
                </Stack>
            </Stack>
        </>
    );
}

interface PublicationWithId extends Publication {
    fileStoreId: number;
}

const PublicationsPage = () => {
    const [currentId, setCurrentId] = useState(1);
    const [allPublications, setAllPublications] = useState<PublicationWithId[]>([]);
    const { ref, inView } = useInView();
    const { data, error, isLoading  } = useGetPublByFileStoreIdQuery(currentId);
    const [searchText, setSearchText] = useState('');
    const [isSearching, setIsSearching] = useState(false); 
    const { data: searchResults, error: searchError } = useSearchPublByTitleQuery(
        {title: searchText },
        { skip: !isSearching }
    );
    const [showResults, setShowResults] = useState(false);

    const handleSearch = () => {
        setIsSearching(true);
        setShowResults(true);
    };
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };
    useEffect(() => {
        setShowResults(false);
    }, [searchText]);
    useEffect(() => {
        if (searchResults) {
            setIsSearching(false);
        }
    }, [searchResults]);
    useEffect(() => {
        if (searchError) {
            setIsSearching(false);
        }
    }, [searchError]);
    useEffect(() => {
        if (data && data.length > 0) {
            const publicationsWithId = data.map(publication => ({
                ...publication,
                fileStoreId: currentId
            }));
            if (currentId < 100) {
            setAllPublications(prev => [...prev, ...publicationsWithId]);
            setCurrentId(prev => prev + 1);
            //console.log(currentId);
            }
        }
    }, [data]);
    useEffect(() => {
        if (inView && !isLoading && currentId < 100) {
            setCurrentId(prev => prev + 1);
        }
        //console.log(currentId);
    }, [inView, isLoading]);
    const handleHref = (id: number) => {
        return `/search/publication?creature_id=${id}`;
    };
    //if (searchError) return <Typography color="error">flkfkl</Typography>;
    if (error) return <Typography color="error"></Typography>;
    return (
        <Stack sx={{ height: "100%" }} mt={2} spacing={3}>
            <Stack sx={{ width: "90%", alignSelf: "center" }} spacing={3}>
                <Stack direction="row" spacing={1} sx={{ width: "100%" }}>
                    <Box sx={{ flexGrow: 1 }}>
                        <input
                            type="text"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Введите название публикации"
                            style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                            }}
                        />
                    </Box>
                    <StyledContainedButton 
                        variant="contained"
                        onClick={handleSearch} 
                    >
                        Найти
                    </StyledContainedButton>
                </Stack>
                {isSearching && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <CircularProgress />
                    </Box>
                )}
                <Stack spacing={3}>
                {searchText !== '' && !isSearching && showResults && (
                    <>
                    {searchResults && searchResults.length > 0 ? (
                        searchResults.map((publication) => (
                        <Link
                            key={publication.publ_isand_id}
                            href={`/publications/isand_publ?creature_id=${publication.publ_isand_id}`}
                            passHref
                        >
                            <Card
                            sx={{
                                m: 0,
                                boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)',
                                alignItems: 'center',
                                padding: '16px',
                                cursor: 'pointer',
                            }}
                            >
                            <Typography variant="h6">{publication.publ_name}</Typography>
                            <Typography
                                variant="body1"
                                sx={{
                                color: '#1B4596',
                                fontFamily: 'Nunito Sans, sans-serif',
                                textAlign: 'left',
                                width: '100%',
                                fontWeight: 700,
                                }}
                            >
                                Авторы: {publication.author_fios}
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                color: 'text.secondary',
                                textAlign: 'left',
                                width: '100%',
                                }}
                            >
                                Год: {publication.year}
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                color: 'text.secondary',
                                textAlign: 'left',
                                width: '100%',
                                }}
                            >
                                Источник: {publication.ext_source}
                            </Typography>
                            </Card>
                        </Link>
                        ))
                    ) : (
                        <Typography variant="body1" sx={{ textAlign: 'center', color: 'text.secondary', mt: 2 }}>
                        Публикации не найдены
                        </Typography>
                    )}
                    </>
                )}
                </Stack>

                <Stack spacing={3}>
                    {searchText === '' && (
                        <>
                            {allPublications.map((publication) => (
                                <Link key={publication.publ_isand_id} href={handleHref(publication.fileStoreId)} passHref>
                                    <Card sx={{ m: 0, boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)', alignItems: 'center', padding: '16px', cursor: 'pointer' }}>
                                        <Typography variant="h6">{publication.publ_name}</Typography>
                                        <Typography 
                                            variant='body1' 
                                            sx={{ 
                                                color: '#1B4596',
                                                fontFamily: 'Nunito Sans, sans-serif',
                                                textAlign: 'left',
                                                width: '100%',
                                                fontWeight: 700
                                            }}
                                        >
                                            Авторы: {publication.author_fios}
                                        </Typography>
                                        <Typography 
                                            variant='body2' 
                                            sx={{
                                                color: 'text.secondary',
                                                textAlign: 'left',
                                                width: '100%'
                                            }}
                                        >
                                            Год: {publication.year}
                                        </Typography>
                                        <Typography 
                                            variant='body2' 
                                            sx={{
                                                color: 'text.secondary',
                                                textAlign: 'left',
                                                width: '100%'
                                            }}
                                        >
                                            Источник: {publication.ext_source}
                                        </Typography>
                                    </Card>
                                </Link>
                            ))}
                            <Box ref={ref} sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                {isLoading && <CircularProgress />}
                            </Box>
                        </>
                    )}
                </Stack>
            </Stack>
        </Stack>
    );
};

const JournalCard = ({ journal }: { journal: Author }) => {
    return (
        <Card key={journal.id} sx={{ m: 0, boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)', display: 'flex', alignItems: 'center', padding: '16px' }}>
            <StyledAvatar 
                fio={journal.value} 
                width={100}
                height={100}
                url={''}
                editable={false}
            />
            <Typography variant="h6" sx={{ marginLeft: '16px', fontSize: '2.0rem' }}>{journal.value}</Typography>
        </Card>
    );
};

function JournalsPage({
    journalsResponse
}: {
    journalsResponse: ApiResponse<Author[]>
}) {
    const [selectedJournals, setSelectedJournals] = useState<Author[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const { data: journals, error: journalsError } = journalsResponse;
    const handleHref = (value: string) => {
        return `/search/journal?name=${value}`;
    };
    if (!journals) {
        return <div>{"Some error occurred..."}</div>;
    }
    const filteredJournals = journals.filter(journal =>
        journal.value.toLowerCase().includes(searchTerm.toLowerCase())
    );

    console.log("searchTerm: ", searchTerm);
    const customStyles = {
        control: (base: any) => ({
            ...base,
            borderRadius: '7px',
            padding: '4px',
        }),
        multiValue: (base: any) => ({
            ...base,
            backgroundColor: '#e4e4e4',
            borderRadius: '4px',
        }),
        multiValueLabel: (base: any) => ({
            ...base,
            color: '#000',
        }),
    };
    const handleSearch = () => {};
    const getOptionLabel = (option: any) => option.name || option.label || option.value || "Unknown";
    const getOptionValue = (option: any) => option.id || option.value;
    return (
        <>
            <Head>
                <title>Текстовый поиск</title>
            </Head>
            <Stack sx={{ height: "100%" }} mt={2} spacing={3}>
                <Stack sx={{ width: "90%", alignSelf: "center" }} spacing={3}>
                    <Stack direction={"row"} spacing={1} sx={{ justifyContent: "center" }}>
                        <Box sx={{ width: "100%" }} role="presentation">
                            <Stack sx={{ width: "100%"}} spacing={2.7}>
                                <input
                                        type="text"
                                        placeholder="Введите название журнала"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                />
                            </Stack>
                        </Box>
                        <StyledContainedButton 
                            variant="contained"
                            onClick={handleSearch} 
                        >
                            Найти
                        </StyledContainedButton>
                    </Stack>
                    <Stack spacing={3}>
                        {filteredJournals.map((journal) => (
                            <Link key={journal.id} href={handleHref(journal.value)}>
                                <JournalCard journal={journal} />
                            </Link>
                        ))}
                    </Stack>
                </Stack>
            </Stack>
        </>
    );
}


const SearchPage: React.FC = (props: any): React.ReactElement => {
const dispatch = useTypedDispatch()
const search_options: string[] = ['Авторы', 'Публикации', 'Журналы'];
const disableds_options: boolean[] = [false, false, false, false, false, false];
const request_search_options: string[] = ['authors', 'publications', 'journals'];
const search_field = useTypedSelector(selectSearchFields);


return (
    <Container>
        <Stack direction={'row'} sx={{ mt: 1, ml: 7 }} spacing={4} alignItems={'flex-start'}>
            <Accordion>
                <AccordionSummary 
                    expandIcon={<ExpandMoreIcon />} 
                    aria-controls="sort-dropdown-content" 
                    id="sort-dropdown-header"
                >
                    Область поиска
                </AccordionSummary>
                <AccordionDetails>
                    <RadioGroupComponent 
                        disableds={disableds_options} 
                        labels={search_options} 
                        radioGroupName='search-fields' 
                        reducer={setSearchFields} 
                        values={request_search_options} 
                        selector={selectSearchFields} 
                    />
                </AccordionDetails>
            </Accordion>
        </Stack>

        {search_field === 'authors' ? (
            <AuthorsResultPage {...props} />
        ) : search_field === 'publications' ? (
            <PublicationsPage />
        ) : search_field === 'journals' ? (
            <JournalsPage {...props}/>
        ) : null}
    </Container>
);

};


export const getServerSideProps = wrapper.getServerSideProps(
    (store) => async () => {
        const authorsResponse = await store.dispatch(getAuthors.initiate());
        const laboratoriesResponse = await store.dispatch(getOrganization.initiate());
        const journalsResponse = await store.dispatch(getJournals.initiate());
        await Promise.all(store.dispatch(apiV2GetRunningQueriesThunk()));
        await Promise.all(store.dispatch(apiV1GetRunningQueriesThunk()));
        return {
            props: {
                authorsResponse,
                journalsResponse,
                laboratoriesResponse
            },
        };
    }
);

export default SearchPage;