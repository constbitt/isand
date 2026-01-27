import {Box, Drawer, IconButton, Stack, Typography} from "@mui/material";
import React, { useEffect } from "react";
import {useTypedSelector} from "@/src/hooks/useTypedSelector";
import {useTypedDispatch} from "@/src/hooks/useTypedDispatch";

import {
    selectAuthors,
    selectLaboratories,
    selectWorks,
    setAuthors,
    setLaboratories,
    setWorks,
    setTimeRange,
    setInitialTimeRange
} from "@/src/store/slices/profilesSlice";
import CloseIcon from '@mui/icons-material/Close';
//import StyledAutocomplete from "@/src/components/Fields/StyledAutocompleteField";
import StyledSelect from "@/src/components/Fields/StyledSelect";
import {Author, AuthorsPostsPreparedResponseItem, AuthorsPostsRequest} from "@/src/store/types/authorTypes";
import {Laboratory} from "@/src/store/types/laboratoryTypes";
import {useGetAuthorsPostsQuery, useGetJournalsPostsQuery, useGetConferencesPostsQuery, useGetCitiesPostsQuery, useGetOrganizationsPostsQuery, useConvertIdQuery} from "@/src/store/api/serverApi";
import {useGetPublInfoQuery} from "@/src/store/api/serverApiV2_5";
import {Work} from "@/src/store/types/workTypes";


const AuthorsLaboratoriesMenu = ({
    openMenu,
    setOpenMenu,
    authors,
    laboratories,
    entityType
  }: {
    openMenu: boolean;
    setOpenMenu: React.Dispatch<React.SetStateAction<boolean>>;
    authors: Author[];
    laboratories: Laboratory[];
    entityType: 'profiles' | 'journals' | 'conferences' | 'organizations' | 'cities';
  }) => {
    const dispatch = useTypedDispatch();
  
    const selected_authors = useTypedSelector(selectAuthors);
    const selected_laboratories = useTypedSelector(selectLaboratories);
    const selected_works = useTypedSelector(selectWorks);
    const authorParams = {
      authors: selected_authors.map((item) => ({ author_id: item.id })),
    };
    
    const skipCondition = selected_authors.length === 0;

    const { data: authorsWorksData } = useGetAuthorsPostsQuery(authorParams, { 
        skip: skipCondition || entityType !== 'profiles' 
    });
    const { data: journalsWorksData } = useGetJournalsPostsQuery(authorParams, { 
        skip: skipCondition || entityType !== 'journals' 
    });
    const { data: conferencesWorksData } = useGetConferencesPostsQuery(authorParams, { 
        skip: skipCondition || entityType !== 'conferences' 
    });

    const { data: organizationsWorksData } = useGetOrganizationsPostsQuery(authorParams, { 
      skip: skipCondition || entityType !== 'organizations' 
  });

  const { data: citiesWorksData } = useGetCitiesPostsQuery(authorParams, { 
    skip: skipCondition || entityType !== 'cities' 
  });

    const worksData = entityType === 'profiles'
        ? authorsWorksData
        : entityType === 'journals'
        ? journalsWorksData
        : entityType === 'conferences'
        ? conferencesWorksData
        : entityType === 'organizations'
        ? organizationsWorksData
        : entityType === 'cities'
        ? citiesWorksData
        : [];
/*
    const { data: publicationInfoStart} = useGetPublInfoQuery(worksData?.[0]?.id!, {
        skip: !worksData?.[0]?.id
    });

    const { data: publicationInfoEnd} = useGetPublInfoQuery(worksData?.[worksData?.length - 1]?.id!, {
      skip: !worksData?.[worksData?.length - 1]?.id
    });
    */

    
    //console.log(worksData?.[0] + "; " + worksData?.[worksData?.length - 1]);
    const [years, setYears] = React.useState<number[]>([]);
    useEffect(() => {
      const fetchYears = async () => {
        if (!worksData?.length) return;
    
        try {
          const yearsFetched: number[] = [];
    
          for (const work of worksData) {

            const convertResp = await fetch(
              `https://kb-isand.ipu.ru/deliver/convert_id?id=${Number(work.id)}&source_id=account_db_b&target_id=prnd`
            );
            const convertData = await convertResp.json();
    
            const prnd_id = convertData?.prnd_id;
            if (!prnd_id) continue;
            const publResp = await fetch(
              `https://kb-isand.ipu.ru/api/v2.5/publications/search?prnd=${prnd_id}`
            );
            const publData = await publResp.json();
    
            const year = publData?.[0]?.year;
            if (year) yearsFetched.push(year);
          }
    
          setYears(yearsFetched);
        } catch (err) {
          console.error("Ошибка при получении годов публикаций", err);
        }
      };
    
      fetchYears();
    }, [worksData]);
    
    const minYear = years.length ? Math.min(...years) : undefined;
    const maxYear = years.length ? Math.max(...years) : undefined;
    

    
  

    const all_works_stub = { id: "Все работы", name: "Все работы" };

    useEffect(() => {
      if (selected_authors.length >= 1 && worksData && worksData.length > 0) {
        dispatch(setWorks([all_works_stub]));
      }
    }, [selected_authors, worksData]);

    useEffect(() => {
      if (minYear && maxYear) {
        dispatch(setTimeRange([minYear, maxYear]));
        dispatch(setInitialTimeRange({ min: minYear, max: maxYear }));
      }
    }, [minYear, maxYear]);

    const getTitle = () => {
      switch (entityType) {
        case 'profiles':
          return "Выбор автора и публикаций";
        case 'journals':
          return "Выбор журнала и публикаций";
        case 'conferences':
          return "Выбор конференций и публикаций";
        case 'cities':
          return "Выбор городов и публикаций";
        case 'organizations':
          return "Выбор организаций и публикаций";
        default:
          return "";
      }
    };

    const getPlaceholder = () => {
      switch (entityType) {
        case 'profiles':
          return "Выберите авторов";
        case 'journals':
          return "Выберите журналы";
        case 'conferences':
          return "Выберите конференции";
        case 'cities':
          return "Выберите города";
        case 'organizations':
          return "Выберите организации";
        default:
          return "";
      }
    };


    return (
      <Drawer
        anchor={"left"}
        open={openMenu}
        onClose={() => {
          setOpenMenu(false);
        }}
        keepMounted={false}
        ModalProps={{
          keepMounted: false,
          disableScrollLock: true
        }}
      >
        <Box sx={{ width: 350 }} role="presentation" onClick={() => {}}>
          <Stack sx={{ width: "100%", padding: "15px" }} spacing={2.7}>
            <Stack direction={"row"} justifyContent={"space-between"}>
              <Typography>{getTitle()}</Typography>
              <IconButton onClick={() => { setOpenMenu(false); }}>
                <CloseIcon />
              </IconButton>
            </Stack>
  
                      {/* <StyledAutocomplete value={selected_laboratories} onChange={(_, new_value) => {
                        dispatch(setLaboratories(new_value))
                    }} multiple={true}
                                        options={laboratories}
                                        placeholder={"Выберите лаборатории"}

                                        getOptionLabel={(option: Laboratory) => option.div_name}
                                        isOptionEqualToValue={(option: Laboratory, value: Laboratory) => {
                                            return option.div_id === value?.div_id
                                        }}
                                        fullWidth={true}
                    /> */}

            {/* Using StyledSelect for Authors */}
            <StyledSelect
              value={selected_authors}
              onChange={(new_value) => {
                dispatch(setAuthors(new_value));
                if (new_value.length >= 1 && worksData && worksData.length > 0) {
                  dispatch(setWorks([all_works_stub]));
                } else {
                  dispatch(setWorks([]));
                }
                
              }}
              multiple={true}
              options={authors}
              placeholder={getPlaceholder()}
            />
  
            {worksData && selected_authors.length > 0 && (
              <StyledSelect
                value={selected_works}
                onChange={(new_value: any[]) => {
                  if (new_value.find((item) => item.id === "Все работы")) {
                    if (selected_works.find((item) => item.id === "Все работы")) {
                      dispatch(setWorks(new_value.filter((item) => item.id !== "Все работы")));
                    } else {
                      dispatch(setWorks([all_works_stub]));
                    }
                  } else {
                    dispatch(setWorks(new_value));
                  }
                }}
                multiple={true}
                options={[all_works_stub, ...worksData]}
                placeholder={"Выберите работы"}
                
              />
              
            )}

          </Stack>
        </Box>
      </Drawer>
    );
  };
  
  export default AuthorsLaboratoriesMenu;