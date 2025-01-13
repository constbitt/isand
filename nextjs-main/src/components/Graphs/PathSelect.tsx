import React, { useEffect, useState } from 'react';
import StyledAutocomplete from '../Fields/StyledAutocompleteField';
import { Item, SubjectArea } from '@/src/store/types/thesaurusTypes';
import { usePostAllItemsMutation } from '@/src/store/api/serverApiV5';

interface PathSelectProps {
    subjectAreasOptions: SubjectArea[];
    subjectAreas: SubjectArea[];
    subjectAreasSetter: React.Dispatch<React.SetStateAction<SubjectArea[]>>;
    factors: Item[];
    factorsSetter: React.Dispatch<React.SetStateAction<Item[]>>;
    subfactors: Item[];
    subfactorsSetter: React.Dispatch<React.SetStateAction<Item[]>>;
    terms: Item[];
    termsSetter: React.Dispatch<React.SetStateAction<Item[]>>;
}

const PathSelect: React.FC<PathSelectProps> = ({
    subjectAreasOptions,
    subjectAreas,
    subjectAreasSetter,
    factors,
    factorsSetter,
    subfactors,
    subfactorsSetter,
    terms,
    termsSetter,
}) => {
    
    const allOption = {id: 0, name: "все", id_parent: -1}
    
    const [postAllItems] = usePostAllItemsMutation()
        
    const [factorsOptions, setFactorsOptions] = useState<Item[]>([])
    const [subfactorsOptions, setSubfactorsOptions] = useState<Item[]>([])
    const [termsOptions, setTermsOptions] = useState<Item[]>([])
    const [allDataLoad, setAllDataLoad] = useState<boolean>(false)

    const handleSelectionChange = (setter: Function, value: (Item | SubjectArea)[]) => {
        console.log(value, value.some((item, index) => item.id === 0 && index !== 0));
        (!value.length || value.some((item, index) => item.id === 0 && index !== 0))
            ? setter([allOption])
            : setter(value.filter((item: Item | SubjectArea) => item.id !== 0))
    }
    const getIds = (lvl: number): number[] => {
        const levels: (Item[] | SubjectArea[])[] = [subjectAreas, factors, subfactors, terms];
        const levelsOptions: (Item[] | SubjectArea[])[] = [subjectAreasOptions, factorsOptions, subfactorsOptions, termsOptions];
        const allLeaves: number[] = [];
        for (let currentLevel = 0; currentLevel <= lvl - 1; currentLevel++) {
            if (currentLevel === lvl - 1) {
                levels[currentLevel][0].id === 0 
                    ? allLeaves.push(...levelsOptions[currentLevel]
                        .slice(1, levelsOptions[currentLevel].length)
                        .map((item: Item | SubjectArea) => item.id))
                    : allLeaves.push(...levels[currentLevel].map((item: Item | SubjectArea) => item.id))
            } else {
                const parentIds: (Item | SubjectArea)[] = levels[currentLevel][0].id === 0
                    ? levelsOptions[currentLevel].slice(1, levelsOptions[currentLevel].length) : levels[currentLevel]
                let childIds: Set<number | undefined> = levels[currentLevel + 1][0].id === 0 
                    ? new Set(levelsOptions[currentLevel + 1]
                        .slice(1, levelsOptions[currentLevel + 1].length)
                        .map(item => item.id_parent))    
                    : new Set(levels[currentLevel + 1].map(item => item.id_parent))     
                allLeaves.push(...parentIds.filter(item => !childIds.has(item.id)).map((item: Item | SubjectArea) => item.id));
            }
        }
    
        return allLeaves;
    }

    useEffect(() => {
        (async () => {
            try {
                let response = await postAllItems({ root_ids: [0], lvl: 1 }).unwrap()
                setFactorsOptions(response);
                response = await postAllItems({ root_ids: [0], lvl: 2 }).unwrap()
                setSubfactorsOptions(response);
                response = await postAllItems({ root_ids: [0], lvl: 3 }).unwrap()
                setTermsOptions(response);
                setAllDataLoad(true)
            } catch (e) {
                console.error(e)
            }
        })()
    }, [])

    useEffect(() => {
        if (allDataLoad)
            (async () => {
                try {
                    const response = await postAllItems({ root_ids: getIds(1), lvl: 1 }).unwrap()
                    setFactorsOptions(response)
                } catch (e) {
                    console.error(e)
                }
            })()
    }, [subjectAreas])

    useEffect(() => {
        if (allDataLoad)
            factorsSetter(prev => {
                const res = prev.filter(item => factorsOptions.some(option => option.id === item.id))
                return res.length ? res : [allOption]
            })
    }, [factorsOptions])

    useEffect(() => {
        if (allDataLoad)
            (async () => {
                try {
                    const response = await postAllItems({ root_ids: getIds(2), lvl: 2 }).unwrap()
                    setSubfactorsOptions(response);
                } catch (e) {
                    console.error(e)
                }
            })()
    }, [factors])

    useEffect(() => {
        if (allDataLoad)
            subfactorsSetter(prev => {
                const res = prev.filter(item => subfactorsOptions.some(option => option.id === item.id))
                return res.length ? res : [allOption]
            })
    }, [subfactorsOptions])

    useEffect(() => {
        if (allDataLoad)
            (async () => {
                try {
                    const response = await postAllItems({ root_ids: getIds(3), lvl: 3 }).unwrap()
                    setTermsOptions(response);
                } catch (e) {
                    console.error(e)
                }
            })()
    }, [subfactors])
    
    useEffect(() => {
        if (allDataLoad)
            termsSetter(prev => {
                const res = prev.filter(item => termsOptions.some(option => option.id === item.id))
                return res.length ? res : [allOption]
            })
    }, [termsOptions])    


    return (
        <>
            <StyledAutocomplete
                value={subjectAreas}
                onChange={(_, value) => handleSelectionChange(subjectAreasSetter, value)}
                multiple={true}
                options={subjectAreasOptions}
                placeholder={'метафакторы'}
                getOptionLabel={(item: SubjectArea) => item.name}
                isOptionEqualToValue={(option, value) => option.id === value.id && option.name === value.name && option.id_parent === value.id_parent}
                sx={{maxWidth: '100%', width: '100%', maxHeight: '96px', overflowY: 'auto'}}
            />
            <StyledAutocomplete
                value={factors}
                onChange={(_, value) => handleSelectionChange(factorsSetter, value)}
                multiple={true}
                options={factorsOptions}
                placeholder={'факторы'}
                getOptionLabel={(item: Item) => item.name}
                isOptionEqualToValue={(option, value) => option.id === value.id && option.name === value.name && option.id_parent === value.id_parent}
                sx={{maxWidth: '100%', width: '100%', maxHeight: '96px', overflowY: 'auto'}}
            />
            <StyledAutocomplete
                value={subfactors}
                onChange={(_, value) => handleSelectionChange(subfactorsSetter, value)}
                multiple={true}
                options={subfactorsOptions}
                placeholder={'подфакторы'}
                getOptionLabel={(item: Item) => item.name}
                isOptionEqualToValue={(option, value) => option.id === value.id && option.name === value.name && option.id_parent === value.id_parent}
                sx={{maxWidth: '100%', width: '100%', maxHeight: '96px', overflowY: 'auto'}}
            />
            <StyledAutocomplete
                value={terms}
                onChange={(_, value) => handleSelectionChange(termsSetter, value)}
                multiple={true}
                options={termsOptions}
                placeholder={'термины'}
                getOptionLabel={(item: Item) => item.name}
                isOptionEqualToValue={(option, value) => option.id === value.id && option.name === value.name && option.id_parent === value.id_parent}
                sx={{maxWidth: '100%', width: '100%', maxHeight: '96px', overflowY: 'auto'}}
            />
        </>
    );
};

export default PathSelect;