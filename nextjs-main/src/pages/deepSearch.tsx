// @ts-nocheck
import React, { useMemo, useState, useEffect, MutableRefObject, useRef, RefObject } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, Sector,SectorProps, TooltipProps } from 'recharts';
import { Container, Stack, Card, Button, Box, TextField, Typography, Switch, Grid, Slider, CircularProgress, Accordion, AccordionSummary, AccordionDetails, Modal } from "@mui/material"
import ClearIcon from '@mui/icons-material/Clear';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import {DataCells, DeepsearchItem, Phrases, SubjectArea} from "@/src/store/types/deepSearchTypes"
import {blueShades} from '@/src/configs/shadesConfig';
import TabsComponent from '@/src/components/Tabs/TabsComponent';
import { DragDropContext, Draggable, DropResult, Droppable } from 'react-beautiful-dnd';
import { useTypedDispatch } from '../hooks/useTypedDispatch';
import { useTypedSelector } from '../hooks/useTypedSelector';
import { selectFatcors, selectFactorsBox, selectSubfactors, selectSubfactorsBox, selectSubjectAreasBox, selectSwitchFactors, selectSwitchSubfactors, selectSwitchTerms, selectTerms, selectTermsBox, setFactors, setFactorsBox, setSubfactors, setSubfactorsBox, setSubjectAreas, setSubjectAreasBox, setSwitchFactors, setSwitchSubfactors, setTerms, setTermsBox, selectIsFirstRender, setIsFirstRender, removeSubjectAreasBox, removeFactorsBox, removeSubfactorsBox, removeTermsBox, setSwitchTerms, setCutOff, clearBox } from '../store/slices/deepSearchSlice';
import { useGetDeepSearchSubjectAreasQuery, usePostDeepSearchSubsetQuery } from '../store/api/serverApiV3';
import Link from 'next/link';
import Head from 'next/head';


interface CustomTooltipProps extends TooltipProps<number, string> {
    active?: boolean;
    payload?: Array<{payload: DataCells}>;
}
DeepsearchItem
const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const dataItem = payload[0].payload;
        return (
            <div style={{ backgroundColor: '#fff', padding: '5px', border: '1px solid #ccc' }}>
                <p>Метафактор: <span style={{ color: dataItem.color }}>{dataItem.name}</span></p>
                <p>Количество терминов: <span style={{ color: dataItem.color }}>{dataItem.value}</span></p>
            </div>
        );
    }
    return null;
};

const PieChartDeepSearchComponent: React.FC<{hRef: RefObject<HTMLDivElement>}> = ({hRef}) => {
    const { data: subjectAreasResponse, isLoading } = useGetDeepSearchSubjectAreasQuery();
    const dispatch = useTypedDispatch();
    const subjectAreasBox = useTypedSelector(selectSubjectAreasBox);
    const isFirstRender = useTypedSelector(selectIsFirstRender)
    const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

    const onPieEnter = (_: React.MouseEvent, index: number) => {
        setActiveIndex(index);
    };
    
    const onPieLeave = () => {
        setActiveIndex(undefined);
    };
    
    const renderActiveShape = (props: SectorProps) => {
        const { cx, cy, innerRadius, outerRadius = 0, startAngle, endAngle, fill } = props;
    
        return (
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 10}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
                style={{ cursor: 'pointer', outline: 'none' }}
            />
        );
    };

    useEffect(() => {
        if (subjectAreasResponse) {
            dispatch(setSubjectAreas(subjectAreasResponse.subject_areas));
        }
    }, [subjectAreasResponse, dispatch]);

    const dataCells = subjectAreasResponse?.subject_areas.map((subjectArea, index) => ({
        name: subjectArea.name,
        value: subjectArea.total_terms,
        color: blueShades[index],
        id: subjectArea.id
    })) || [];

    const onClickHandle = (name: string) => {
        if (!subjectAreasBox.find((item: SubjectArea) => item.name === name)) {
            const newArea = subjectAreasResponse?.subject_areas.find(item => item.name === name);
            if (newArea) {
                dispatch(setSubjectAreasBox([...subjectAreasBox, {...newArea, cut_off: [0, 1]}]));
            }
        }
    };

    return (
        <Stack ref={hRef} alignItems="center" sx={{height: '100%', width: '100%'}}>
            <Typography sx={{mt: 2}} variant="h6">Выберите метафакторы</Typography>
            {!isLoading ? (<ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        dataKey="value"
                        data={dataCells}
                        cx="50%"
                        cy="50%"
                        outerRadius="90%"
                        onClick={({ name }) => onClickHandle(name)}
                        strokeWidth={0}
                        animationDuration={isFirstRender ? 800 : 0}
                        onAnimationEnd={() => dispatch(setIsFirstRender(false))}
                        onMouseOver={onPieEnter}
                        onMouseOut={onPieLeave}
                        activeIndex={activeIndex}
                        activeShape={renderActiveShape}
                    >
                        {dataCells.map(entry =>
                            <Cell key={entry.id} fill={entry.color} style={{ outline: 'none' }} />
                        )}
                    </Pie>
                    <Legend layout="vertical" verticalAlign="bottom" align="center" />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'transparent', strokeWidth: 0 }} />
                </PieChart>
            </ResponsiveContainer>)
            : (<Stack sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
            </Stack>)}
        </Stack>
    );
};

const FactorsDeepSearchComponent: React.FC = (): React.ReactElement => {
    const dispatch = useTypedDispatch();
    const subject_areas: SubjectArea[] = useTypedSelector(selectSubjectAreasBox);
    const factors_box: DeepsearchItem[] = useTypedSelector(selectFactorsBox);
    const sFactors = useTypedSelector(selectFatcors);
    const { data, error, isLoading } = usePostDeepSearchSubsetQuery({
        terms: subject_areas.map((item: SubjectArea) => item.id),
        level: 1
    });
    const switchFactors = useTypedSelector(selectSwitchFactors);

    useEffect(() => {
        if (data && JSON.stringify(data.subset) !== JSON.stringify(sFactors)) {
            dispatch(setFactors(data.subset.filter(subset_item => !factors_box.some(factor_box => factor_box.id === subset_item.id))));
        }
    }, [data]);

    const sortedFactors = useMemo(() => {
        return [...sFactors].sort((a, b) => switchFactors === 'alphabetical' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
    }, [sFactors, switchFactors]);

    const [filterFactors, setFilterFactors] = useState<DeepsearchItem>({ name: '', id: -1, parent_id: -1 });
    const filteredItems = useMemo(() => {
        return sortedFactors.filter(item =>
            item.name.toLowerCase().includes(filterFactors.name.toLowerCase())
        );
    }, [sortedFactors, filterFactors.name]);

    const handleCardClick = (factor: DeepsearchItem) => {
        dispatch(setFactorsBox([...factors_box, {...factor, cut_off: [0, 1]}]));
        dispatch(setFactors(sFactors.filter((item) => item.id !== factor.id)));
    };

    const handleSwitchChange = () => {
        dispatch(setSwitchFactors(switchFactors === 'alphabetical' ? 'popularity' : 'alphabetical'));
    };

    const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilterFactors((prevFilterFactors: DeepsearchItem) => ({
            ...prevFilterFactors,
            name: event.target.value,
        }));
    };

    return (
        <Stack height={'100%'} maxHeight={'100%'}>
            <Stack direction={'row'} spacing={2} sx={{ mt: 2 }} alignItems="center">
                <TextField

                    sx={{ flexGrow: 1, }}  
                    label={'Поиск факторов'} 
                    variant="outlined"
                    value={filterFactors.name}
                    onChange={handleFilterChange}
                />
                <Typography>Сортировка</Typography>
                <Typography className={switchFactors === 'alphabetical' ? 'font-bold' : ''}>по алфавиту</Typography>
                <Switch color='primary' checked={switchFactors === 'popularity'} onChange={handleSwitchChange} />
                <Typography className={switchFactors === 'popularity' ? 'font-bold' : ''}>по популярности</Typography>
            </Stack>
            {isLoading ? 
                (<Stack sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                </Stack>) :
                (<Droppable droppableId="factors" direction="horizontal" isDropDisabled={true}>
                    {(provided, snapshot) => (
                        <Grid 
                            container spacing={0.5} 
                            sx={{ mt: 2, overflowX: 'hidden', height: `${subject_areas.length === 0 && '100%'}`, overflowY: 'auto', maxHeight: '100%', padding: '0px 2px 10px 0px'}} 
                            {...provided.droppableProps} 
                            ref={provided.innerRef}
                        >
                            {subject_areas.length === 0 && <div className='w-full flex justify-center items-center'><p className='font-bold text-red text-lg'>Для отображения факторов выберите метафакторы</p></div>}
                            {filteredItems?.map((factor, index) => (
                                <Draggable key={index} draggableId={`item-${index}`} index={sFactors.findIndex((item => item === filteredItems[index]))}>
                                    {(provided) => (
                                        <Grid item xs={4} {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}>
                                            <Card onClick={() => handleCardClick(factor)} 
                                                sx={{ padding: '12px 36px', height: '100%', display: 'flex', boxShadow: '0 0 2px rgba(0,0,0,0.25)', 
                                                justifyContent: 'center', alignItems: 'center' }}
                                            >
                                                <Typography textAlign="center">{factor.name}</Typography>
                                            </Card>
                                        </Grid>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </Grid>
                    )}
                </Droppable>)
            }
        </Stack>
    );
};

const SubfactorsDeepSearchComponent: React.FC = (): React.ReactElement => {
    const dispatch = useTypedDispatch();
    const factors: DeepsearchItem[] = useTypedSelector(selectFactorsBox);
    const subfactors_box: DeepsearchItem[] = useTypedSelector(selectSubfactorsBox);
    const sSubfactors = useTypedSelector(selectSubfactors);
    const { data, error, isLoading } = usePostDeepSearchSubsetQuery({
        terms: factors.map((item: DeepsearchItem) => item.id),
        level: 2,
    });
    const switchSubfactors = useTypedSelector(selectSwitchSubfactors);

    useEffect(() => {
        if (data && JSON.stringify(data.subset) !== JSON.stringify(sSubfactors)) {
            dispatch(setSubfactors(data.subset.filter(subset_item => !subfactors_box.some(subfactor_box => subfactor_box.id === subset_item.id))));
        }
    }, [data]);

    const sortedSubfactors = useMemo(() => {
        return [...sSubfactors].sort((a, b) => switchSubfactors === 'alphabetical' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
    }, [sSubfactors, switchSubfactors]);

    const [filterSubfactors, setFilterSubfactors] = useState<DeepsearchItem>({ name: '', id: -1, parent_id: -1 });
    const filteredItems = useMemo(() => {
        return sortedSubfactors.filter(item =>
            item.name.toLowerCase().includes(filterSubfactors.name.toLowerCase())
        );
    }, [sortedSubfactors, filterSubfactors.name]);

    const handleCardClick = (subfactor: DeepsearchItem) => {
        dispatch(setSubfactorsBox([...subfactors_box, {...subfactor, cut_off: [0, 1]}]));
        dispatch(setSubfactors(sortedSubfactors.filter((item) => item.id !== subfactor.id)));
    };

    const handleSwitchChange = () => {
        dispatch(setSwitchSubfactors(switchSubfactors === 'alphabetical' ? 'popularity' : 'alphabetical'));
    };

    const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilterSubfactors((prevFilterSubfactors: DeepsearchItem) => ({
            ...prevFilterSubfactors,
            name: event.target.value,
        }));
    };

    return (
        <Stack height={'100%'} maxHeight={'100%'}>
            <Stack direction={'row'} spacing={2} sx={{ mt: 2 }} alignItems="center">
                <TextField

                    sx={{ flexGrow: 1 }}  
                    label={'Поиск подфакторов'} 
                    variant="outlined"
                    value={filterSubfactors.name}
                    onChange={handleFilterChange}
                />
                <Typography>Сортировка</Typography>
                <Typography className={switchSubfactors === 'alphabetical' ? 'font-bold' : ''}>по алфавиту</Typography>
                <Switch color='primary' checked={switchSubfactors === 'popularity'} onChange={handleSwitchChange} />
                <Typography className={switchSubfactors === 'popularity' ? 'font-bold' : ''}>по популярности</Typography>
            </Stack>
            {isLoading ? 
                (<Stack sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                </Stack>) :
                (<Droppable droppableId="subfactors" direction="horizontal" isDropDisabled={true}>
                    {(provided, snapshot) => (
                        <Grid 
                            container spacing={0.5} 
                            sx={{ mt: 2, overflowX: 'hidden', height: `${factors.length === 0 && '100%'}`, overflowY: 'auto', maxHeight: '100%', padding: '0px 2px 10px 0px' }} 
                            {...provided.droppableProps} 
                            ref={provided.innerRef}
                        >
                            {factors.length === 0 && <div className='w-full flex justify-center items-center'><p className='font-bold text-red text-lg'>Для отображения подфакторов выберите факторы</p></div>}
                            {filteredItems.map((subfactor, index) => (
                                <Draggable key={index} draggableId={`item-${index}`} index={sSubfactors.findIndex((item => item === filteredItems[index]))}>
                                    {(provided) => (
                                        <Grid item xs={4} {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}>
                                            <Card onClick={() => handleCardClick(subfactor)} 
                                                sx={{ padding: '12px 36px', height: '100%', display: 'flex', boxShadow: '0 0 2px rgba(0,0,0,0.25)', 
                                                justifyContent: 'center', alignItems: 'center' }}
                                            >
                                                <Typography textAlign="center">{subfactor.name}</Typography>
                                            </Card>
                                        </Grid>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </Grid>
                    )}
                </Droppable>)
            }
        </Stack>
    );
};

const TermsDeepSearchComponent: React.FC = (): React.ReactElement => {
    const dispatch = useTypedDispatch();
    const subfactors: DeepsearchItem[] = useTypedSelector(selectSubfactorsBox);
    const terms_box: DeepsearchItem[] = useTypedSelector(selectTermsBox);
    const sTerms = useTypedSelector(selectTerms);
    const { data, error, isLoading } = usePostDeepSearchSubsetQuery({
        terms: subfactors.map((item: DeepsearchItem) => item.id),
        level: 3,
    });
    const switchTerms = useTypedSelector(selectSwitchTerms);

    useEffect(() => {
        if (data && JSON.stringify(data.subset) !== JSON.stringify(sTerms)) {
            dispatch(setTerms(data.subset.filter(subset_item => !terms_box.some(term_box => term_box.id === subset_item.id))));
        }
    }, [data]);

    const sortedTerms = useMemo(() => {
        return [...sTerms].sort((a, b) => switchTerms === 'alphabetical' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
    }, [sTerms, switchTerms]);

    const [filterTerms, setFilterTerms] = useState<DeepsearchItem>({ name: '', id: -1, parent_id: -1 });
    const filteredItems = useMemo(() => {
        return sortedTerms.filter(item =>
            item.name.toLowerCase().includes(filterTerms.name.toLowerCase())
        );
    }, [sortedTerms, filterTerms.name]);

    const handleCardClick = (term: DeepsearchItem) => {
        dispatch(setTermsBox([...terms_box, {...term, cut_off: [0, 1]}]));
        dispatch(setTerms(sortedTerms.filter((item) => item.id !== term.id)));
    };

    const handleSwitchChange = () => {
        dispatch(setSwitchTerms(switchTerms === 'alphabetical' ? 'popularity' : 'alphabetical'));
    };

    const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilterTerms((prevFilterSubfactors: DeepsearchItem) => ({
            ...prevFilterSubfactors,
            name: event.target.value,
        }));
    };

    return (
        <Stack height={'100%'} maxHeight={'100%'}>
            <Stack direction={'row'} spacing={2} sx={{ mt: 2 }} alignItems="center">
                <TextField

                    sx={{ flexGrow: 1 }}  
                    label={'Поиск терминов'} 
                    variant="outlined"
                    value={filterTerms.name}
                    onChange={handleFilterChange}
                />
                <Typography>Сортировка</Typography>
                <Typography className={switchTerms === 'alphabetical' ? 'font-bold' : ''}>по алфавиту</Typography>
                <Switch color='primary' checked={switchTerms === 'popularity'} onChange={handleSwitchChange} />
                <Typography className={switchTerms === 'popularity' ? 'font-bold' : ''}>по популярности</Typography>
            </Stack>
            {isLoading ? 
                (<Stack sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                </Stack>) :
                (<Droppable droppableId="terms" direction="horizontal" isDropDisabled={true}>
                    {(provided, snapshot) => (
                        <Grid 
                            container spacing={0.5} 
                            sx={{ mt: 2, overflowX: 'hidden', height: `${subfactors.length === 0 && '100%'}`, overflowY: 'auto', maxHeight: '100%', padding: '0px 2px 10px 0px' }} 
                            {...provided.droppableProps} 
                            ref={provided.innerRef}
                        >
                            {subfactors.length === 0 && <div className='w-full flex justify-center items-center'><p className='font-bold text-red text-lg'>Для отображения терминов выберите подфакторы</p></div>}
                            {filteredItems.map((term, index) => (
                                <Draggable key={index} draggableId={`item-${index}`} index={sTerms.findIndex((item => item === filteredItems[index]))}>
                                    {(provided) => (
                                        <Grid item xs={4} {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}>
                                            <Card onClick={() => handleCardClick(term)} 
                                                sx={{ padding: '12px 36px', height: '100%', display: 'flex', boxShadow: '0 0 2px rgba(0,0,0,0.25)',
                                                justifyContent: 'center', alignItems: 'center' }}
                                            >
                                                <Typography textAlign="center">{term.name}</Typography>
                                            </Card>
                                        </Grid>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </Grid>
                    )}
                </Droppable>)
            }
            </Stack>
    );
};

interface DropBoxCardProps {
    name: string, 
    id: number, 
    remover: Function, 
    cut_off: number[],
    lvl: number,
    isExpanded: boolean,
}

const DropBoxCard: React.FC<DropBoxCardProps> = ({name, id, remover, cut_off, lvl, isExpanded}): React.ReactElement => {
    const dispatch = useTypedDispatch()
    const [value, setValue] = useState<number[]>(cut_off)

    useEffect(() => {
        dispatch(setCutOff({
            lvl: lvl,
            id: id,
            cut_off: value,
        }))
    }, [value])

    const handleChange = (event: Event, value: number | number[]) => {
        setValue(value as number[])
    };

    const handleIconClick = () => {
        dispatch(remover(id));
    };

    return (
        <Stack direction={'row'} alignItems={'center'} spacing={2}>
            <ClearIcon 
                color='primary' 
                onClick={handleIconClick} 
                sx={{
                    cursor: 'pointer', 
                    fontSize: 18, 
                    alignSelf: 'flex-start'
                }} 
                style={{marginTop: isExpanded ? '5px' : '15px'}} 
            />
            {isExpanded
                ?  <>
                    <Typography sx={{flexGrow: 1, width: '100%'}}>{name}</Typography>
                    <Stack direction={'row'} spacing={1.5} sx={{ width: '100%' }}>
                        <Typography>{value[0].toFixed(2)}</Typography>
                        <Slider
                            value={value}
                            onChange={handleChange}
                            sx={{ flexGrow: 1 }}
                            onClick={(e) => e.stopPropagation()}
                            valueLabelDisplay="off"
                            min={0}
                            max={1}
                            step={0.01}
                        />
                        <Typography>{value[1].toFixed(2)}</Typography>
                    </Stack>
                </>
                : <Accordion sx={{flexGrow: 1}} style={{marginLeft: 16}}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{pb: 0}}>{name}</AccordionSummary>
                    <AccordionDetails sx={{ p: '0px 8px 8px 8px' }}>
                        <Stack direction={'row'} spacing={1.5} sx={{ width: '100%' }}>
                            <Typography>{value[0].toFixed(2)}</Typography>
                            <Slider
                                value={value}
                                onChange={handleChange}
                                onClick={(e) => e.stopPropagation()}
                                valueLabelDisplay="off"
                                min={0}
                                max={1}
                                step={0.01}
                            />
                            <Typography>{value[1].toFixed(2)}</Typography>
                        </Stack>
                    </AccordionDetails>
                </Accordion>
            } 
        </Stack>
    )
}

const DragNdDropBox: React.FC<{height: number, maxHeight: number}> = ({height, maxHeight}): React.ReactElement => {
    const dispatch = useTypedDispatch()
    const subject_areas = useTypedSelector(selectSubjectAreasBox);
    const factors = useTypedSelector(selectFactorsBox);
    const subfactors = useTypedSelector(selectSubfactorsBox);
    const terms = useTypedSelector(selectTermsBox);
    const scrollContainerRef: MutableRefObject<HTMLDivElement | null> = useRef<HTMLDivElement>(null);

    const [isExpanded, setIsExpanded] = useState<boolean>(false);

    const prevLengths = useRef({
        subject_areas: subject_areas.length,
        factors: factors.length,
        subfactors: subfactors.length,
        terms: terms.length,
    });

    useEffect(() => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const currentScrollHeight = container.scrollHeight;
            const currentScrollTop = container.scrollTop;

            const isListReduced =
                subject_areas.length < prevLengths.current.subject_areas ||
                factors.length < prevLengths.current.factors ||
                subfactors.length < prevLengths.current.subfactors ||
                terms.length < prevLengths.current.terms;

            if (!isListReduced) {
                container.scrollTo({ top: currentScrollHeight, behavior: 'smooth' });
            } else {
                container.scrollTop = currentScrollTop;
            }

            prevLengths.current = {
                subject_areas: subject_areas.length,
                factors: factors.length,
                subfactors: subfactors.length,
                terms: terms.length,
            };
        }
    }, [subject_areas.length, factors.length, subfactors.length, terms.length]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsExpanded(false);
            }
        }
        if (isExpanded) document.addEventListener('keydown', handleKeyDown)

        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isExpanded])

    const getQueryData = (): Phrases[] => {
        
        const filteredSubjectAreas: DeepsearchItem[] = subject_areas.filter(subject_area =>
            factors.every(factor => factor.parent_id !== subject_area.id)
        );
        
        const filteredFactors: DeepsearchItem[] = factors.filter(factor =>
            subfactors.every(subfactor => subfactor.parent_id !== factor.id)
        );
        
        const filteredSubfactors: DeepsearchItem[] = subfactors.filter(subfactor =>
            terms.every(term => term.parent_id !== subfactor.id)
        );
       
        return [...filteredSubjectAreas, ...filteredFactors, ...filteredSubfactors, ...terms].map(item => {
            return {
                name: item.name,
                id: item.id,
                cut_off: item.cut_off as number[]
            }
        })
    } 

    return (
        <>
            {isExpanded && <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                marginTop: 116,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                zIndex: 1,
            }} onClick={() => setIsExpanded(false)} />}
            <Card sx={{ 
                width: isExpanded ? '45%' : '30%', 
                height: height, 
                maxHeight: maxHeight, 
                p: 2, 
                boxShadow: '0 2px 8px rgba(0,0,0,0.25)', 
                position: 'absolute', 
                top: 0, right: 0,
                transition: "width 0.3s ease-in-out",
                zIndex: 2,
            }}>
                <Stack height={'100%'} justifyContent={'space-between'} alignItems={'center'}>
                    <Stack direction={'row'} width={'100%'} position={'relative'}>
                        {!subject_areas.length 
                            ? <p className='grow text-center'>Сегменты <span className="font-bold">не выбраны</span></p>
                            : <p className="font-bold">Сегменты</p>
                        }
                        {isExpanded
                            ? <CloseFullscreenIcon color='primary' onClick={() => setIsExpanded(prev => !prev)} sx={{ fontSize: 18, position: 'absolute', top: 0, right: 0, cursor: 'pointer' }} />
                            : <OpenInFullIcon color='primary' onClick={() => setIsExpanded(prev => !prev)} sx={{ fontSize: 18, position: 'absolute', top: 0, right: 0, cursor: 'pointer' }} />
                        }
                    </Stack>
                    <Droppable droppableId="box">
                        {(provided) => (
                            <Stack
                                ref={(node) => {
                                    provided.innerRef(node);
                                    scrollContainerRef.current = node;
                                }}
                                {...provided.droppableProps}
                                sx={{ overflowY: 'auto', width: '100%', maxHeight: '100%', height: '100%', justifyContent: 'flex-start', padding: '1px 4px 1px 1px' }}
                            >
                                {!subject_areas.length 
                                    ? <div className='w-full h-full flex justify-center items-center'>
                                        <p className="w-full text-center">Здесь пока пусто</p>
                                    </div>
                                    : <Stack spacing={0.5} sx={{ mt: 0.5, pl: 0.2 }}>
                                        <ul>
                                            {subject_areas.map((area, areaIndex) => (
                                                <li key={area.id} className="mt-2 mb-2">
                                                    <DropBoxCard
                                                        isExpanded={isExpanded}
                                                        cut_off={area.cut_off ?? [0, 1]}
                                                        key={area.id}
                                                        remover={removeSubjectAreasBox}
                                                        id={area.id}
                                                        name={`${areaIndex + 1}. ${area.name}`}
                                                        lvl={0}
                                                    />
                                                    <ul>
                                                        {factors.filter(factor => factor.parent_id === area.id).map((factor, factorIndex) => (
                                                            <li key={factor.id} className="mt-2 mb-2">
                                                                <DropBoxCard
                                                                    isExpanded={isExpanded}
                                                                    cut_off={factor.cut_off ?? [0, 1]}
                                                                    key={factor.id}
                                                                    remover={removeFactorsBox}
                                                                    id={factor.id}
                                                                    name={`${areaIndex + 1}.${factorIndex + 1}. ${factor.name}`}
                                                                    lvl={1}
                                                                />
                                                                <ul>
                                                                    {subfactors.filter(subfactor => subfactor.parent_id === factor.id).map((subfactor, subfactorIndex) => (
                                                                        <li key={subfactor.id} className="mt-2 mb-2">
                                                                            <DropBoxCard
                                                                                isExpanded={isExpanded}
                                                                                cut_off={subfactor.cut_off ?? [0, 1]}
                                                                                key={subfactor.id}
                                                                                remover={removeSubfactorsBox}
                                                                                id={subfactor.id}
                                                                                name={`${areaIndex + 1}.${factorIndex + 1}.${subfactorIndex + 1}. ${subfactor.name}`}
                                                                                lvl={2}
                                                                            />
                                                                            <ul>
                                                                                {terms.filter(term => term.parent_id === subfactor.id).map((term, termIndex) => (
                                                                                    <li key={term.id} className="mt-2 mb-2">
                                                                                        <DropBoxCard
                                                                                            isExpanded={isExpanded}
                                                                                            cut_off={term.cut_off ?? [0, 1]}
                                                                                            key={term.id}
                                                                                            remover={removeTermsBox}
                                                                                            id={term.id}
                                                                                            name={`${areaIndex + 1}.${factorIndex + 1}.${subfactorIndex + 1}.${termIndex + 1}. ${term.name}`}
                                                                                            lvl={3}
                                                                                        />
                                                                                    </li>
                                                                                ))}
                                                                            </ul>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </li>
                                            ))}
                                        </ul>
                                    </Stack>
                                }
                                {provided.placeholder}
                            </Stack>
                        )}
                    </Droppable>
                    <Button variant="outlined" sx={{width: '100%', borderRadius: 5}} onClick={() => dispatch(clearBox())}>
                        Очистить корзину
                        <DeleteForeverIcon color='primary' />
                    </Button>
                    <Link href={{
                        pathname: '/deepSearch/dResult',
                        query: {
                            phrases: JSON.stringify(getQueryData()),
                            search_field: 0,
                            sort_by: 'desc',
                            sort_type: 'relevance',
                            time_range: [1997, new Date().getFullYear()],
                        },
                    }} style={{width: '100%'}}
                        onClick={() => {
                            dispatch(setIsFirstRender(true));}}
                    >
                        <Button sx={{ mt: 1, width: '100%', borderRadius: 2 }} variant="contained" style={{ backgroundColor: '#1B4596' }}>
                            Показать результаты
                        </Button>
                    </Link>
                </Stack>
            </Card>
        </>
    );
};

const DeepSearchPage: React.FC = (): React.ReactElement => {

    const dispatch = useTypedDispatch();
    const factors_box = useTypedSelector(selectFactorsBox);
    const factors = useTypedSelector(selectFatcors)
    const subfactors = useTypedSelector(selectSubfactors)
    const subfactors_box = useTypedSelector(selectSubfactorsBox)
    const terms = useTypedSelector(selectTerms)
    const terms_box = useTypedSelector(selectTermsBox)
    const [boxHeight, setBoxHeight] = useState<number>(0);

    const ref: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (ref.current) 
            setBoxHeight(ref.current.clientHeight + 48)
        
        const handleResize = () => {
            if (ref.current) {
                setBoxHeight(ref.current.clientHeight + 48);
            }
        }
        window.addEventListener('resize', handleResize)

        return () => window.removeEventListener('resize', handleResize)
    }, [ref])

    const tabs: {label: string, component: React.ReactNode}[] = [
        { label: '1.Метафакторы', component: <PieChartDeepSearchComponent hRef={ref} /> },
        { label: '2.Факторы', component: <FactorsDeepSearchComponent />},
        { label: '3.Подфакторы', component: <SubfactorsDeepSearchComponent />},
        { label: '4.Термины', component: <TermsDeepSearchComponent /> }
    ]

    const onDragEnd = (result: DropResult) => {
        const { source, destination } = result;

        if (!destination) {
            return;
        }

        if (source.droppableId === 'factors' && destination.droppableId === 'box') {
            const movedItem: DeepsearchItem = {...factors[source.index], cut_off: [0, 1]}
            dispatch(setFactorsBox([...factors_box, movedItem]));
            dispatch(setFactors(factors.filter((_, index) => index !== source.index)));
        }

        if (source.droppableId === 'subfactors' && destination.droppableId === 'box') {
            const movedItem: DeepsearchItem = {...subfactors[source.index], cut_off: [0, 1]}
            dispatch(setSubfactorsBox([...subfactors_box, movedItem]));
            dispatch(setSubfactors(subfactors.filter((_, index) => index !== source.index)));
        }
        if (source.droppableId === 'terms' && destination.droppableId === 'box') {
            const movedItem: DeepsearchItem = {...terms[source.index], cut_off: [0, 1]}
            dispatch(setTermsBox([...terms_box, movedItem]));
            dispatch(setTerms(terms.filter((_, index) => index !== source.index)));
        }
    };

    return (
        <>  
            <Head>
                <title>Тематический поиск</title>
            </Head>
            <Container sx={{height: '100%', width: '100%'}}>
                <DragDropContext onDragEnd={onDragEnd}>
                    <Stack direction={'row'} height={'100%'} justifyContent={'flex-start'} width={'100%'} sx={{position: 'relative'}}>
                        <Box width={'60%'} height={'100%'}>
                            <TabsComponent tabs={tabs} />
                        </Box>
                        <DragNdDropBox height={boxHeight} maxHeight={boxHeight} />
                    </Stack>
                </DragDropContext>
            </Container>    
        </>
    );
};

export default DeepSearchPage;