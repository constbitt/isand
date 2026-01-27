import React, { useState, KeyboardEvent, useEffect } from 'react';
import Image from "next/image";
import { useRouter, NextRouter } from 'next/router';
import {
    Button, FormControl, FormLabel, RadioGroup,
    Radio, Accordion, AccordionSummary, AccordionDetails, 
    FormControlLabel, Checkbox, Box, Stack, TextField, Container
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

const SortSearchComponent: React.FC = (): React.ReactElement => {
    const labelsSortType: string[] = ['По дате', 'По названию', 'По релевантности'];
    const valuesSortType: string[] = ['date', 'name', 'relevance'];
    const valuesSortBy: string[] = ['desc', 'asc'];
    const labelsSortBy: React.ReactElement[] = [
        <Image key={1} src={Ratedown} alt="ratedown" />,
        <Image key={2} src={Rateup} alt="rateup" />,
    ];
    const disableds_sort: boolean[] = [false, false, false]


    return (
        <Box>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="sort-dropdown-content"
                    id="sort-dropdown-header"
                >
                    Сортировка
                </AccordionSummary>
                <AccordionDetails>
                    <Stack spacing={2}>
                        <RadioGroupComponent
                            reducer={setSortType}
                            labels={labelsSortType}
                            radioGroupName="sortType"
                            selector={selectSortType}
                            values={valuesSortType}
                            disableds={disableds_sort}
                        />
                        <RadioGroupComponent
                            formLabel="Порядок"
                            reducer={setSortBy}
                            labels={labelsSortBy}
                            radioGroupName="sortBy"
                            selector={selectSortBy}
                            values={valuesSortBy}
                            disableds={[false, false]}
                        />
                    </Stack>
                </AccordionDetails>
            </Accordion>
        </Box>
    );
};

const DateSearchComponent: React.FC<{disabled: boolean}> = ({disabled}): React.ReactElement => {
    const dispatch = useTypedDispatch()
    const timeRange = useTypedSelector(selectTimeRange)
    const [minMax, setMinMax] = useState<{min: number, max: number}>({min: 1997, max: new Date().getFullYear()})
    const [open, setOpen] = useState(false)

    const handleChange = () => {
        if (!disabled) {
            setOpen(!open);
        }
    };

    useEffect(() => {
        // (async () => {
        //     try {
        //         const response = await 
        //         setMinMax(response)
        //     } catch (e) {
        //         console.error(e)
        //     }
        // })()
    }, [])


    return (
        <Box>
            <Accordion disabled={disabled} expanded={!disabled ? open : false} onChange={handleChange}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="sort-dropdown-content" id="sort-dropdown-header">
                    Временной диапазон
                </AccordionSummary>
                <AccordionDetails sx={{pt: 0}}>
                        <Stack direction={'row'} sx={{alignItems: 'center'}} spacing={2}>
                            <input
                                type="number"
                                min={minMax.min}
                                max={minMax.max}
                                value={timeRange[0]}
                                onChange={(e) => {
                                    const newValue = parseInt(e.target.value)
                                    dispatch(setTimeRange([newValue, timeRange[1]]))
                                }}
                                style={{
                                    width: '75px',
                                    padding: '4px 8px',
                                    border: (timeRange[0] > minMax.max || timeRange[0] < minMax.min) ? '1px solid red' : '1px solid #ccc',
                                    borderRadius: '4px',
                                    outline: 'none',
                                }}
                            />
                            <StyledRange min={minMax.min} max={minMax.max} width={'100px'} value={timeRange} marks={[]} onChange={
                                (_, value) => dispatch(setTimeRange(value))
                            } />
                            <input
                                type="number"
                                min={minMax.min}
                                max={minMax.max}
                                value={timeRange[1]}
                                onChange={(e) => {
                                    const newValue = parseInt(e.target.value)
                                    dispatch(setTimeRange([timeRange[0], newValue]))
                                }}
                                style={{
                                    width: '75px',
                                    padding: '4px 8px',
                                    border: (timeRange[1] > minMax.max || timeRange[1] < minMax.min) ? '1px solid red' : '1px solid #ccc',
                                    borderRadius: '4px',
                                    outline: 'none',
                                }}
                            />
                        </Stack>
                </AccordionDetails>
            </Accordion>
        </Box>
    );
}

const SearchPage: React.FC = (): React.ReactElement => {
    const dispatch = useTypedDispatch()
    const search_options: string[] = ['Публикации', 'Авторы', 'Города', 'Журналы', 'Конференции', 'Организации'];
    const disableds_options: boolean[] = [false, false, false, false, false, false]
    const request_search_options: string[] = ['publications', 'authors', 'geopositions', 'journals', 'conferences', 'organizations']

    const router: NextRouter = useRouter();

    const phrase = useTypedSelector(selectPhrase)
    const search_field = useTypedSelector(selectSearchFields)
    const searchRequest = useTypedSelector(selectSearchApiRequest)
    
    const {data: publicationTypes} = useGetPublicationsTypesQuery()

    return (
        <>
            <Head>
                <title>Полнотекстовый поиск</title>
            </Head>
            <Container maxWidth='lg' sx={{mt: '65px'}}>
                <Stack spacing={4}>
                    <Stack>
                        <Stack width={'100%'} direction={'row'} spacing={2}>
                            <TextField 
                                sx={{ flexGrow: 1 }}
                                value={phrase} 
                                onChange={(event: React.ChangeEvent<HTMLInputElement>) => dispatch(setPhrase(event.target.value))} 
                                label="Введите запрос" 
                                variant="outlined"
                                onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
                                    if (event.key === 'Enter') router.push({
                                        pathname: '/search/sResult',
                                        query: {...searchRequest},
                                    })
                                }} />
                            <Link href={{
                                pathname: '/search/sResult',
                                query: {...searchRequest},
                            }}>
                                <Button type="submit" variant="contained" 
                                    style={{ backgroundColor: '#1B4596', height: '100%' }}
                                >Найти</Button>
                            </Link>
                        </Stack>
                    </Stack>
                    <Stack direction={'row'} sx={{ mt: 1 }} spacing={4} alignItems={'flex-start'}>
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
                        <CheckboxDropdown 
                            options={publicationTypes?.types.map(
                                publType => publType.name
                            ) ?? []} 
                            request_options={publicationTypes?.types.map(
                                publType => publType.id
                            ) ?? []} 
                            disableds={publicationTypes?.types.map(
                                _ => false
                            ) ?? []} 
                            name={'Тип публикации'} 
                            reducer={setPType}
                            disabled={search_field !== 'publications'}
                        />
                        <DateSearchComponent disabled={search_field !== 'publications'} />
                        <SortSearchComponent />
                    </Stack>
                </Stack>
            </Container>
        </>
    );
};

export default SearchPage;