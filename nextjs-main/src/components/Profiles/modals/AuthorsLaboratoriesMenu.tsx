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
import {useGetAuthorsPostsQuery, useGetJournalsPostsQuery, useGetConferencesPostsQuery} from "@/src/store/api/serverApi";
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
    entityType: 'profiles' | 'journals' | 'conferences';
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

    const worksData = entityType === 'profiles'
        ? authorsWorksData
        : entityType === 'journals'
        ? journalsWorksData
        : entityType === 'conferences'
        ? conferencesWorksData
        : [];

    const { data: publicationInfoStart} = useGetPublInfoQuery(worksData?.[0]?.id!, {
        skip: !worksData?.[0]?.id
    });
    const { data: publicationInfoEnd} = useGetPublInfoQuery(worksData?.[worksData?.length - 1]?.id!, {
      skip: !worksData?.[worksData?.length - 1]?.id
    });

    const min = publicationInfoStart?.[0]?.year;
    const max = publicationInfoEnd?.[0]?.year;
  

    const all_works_stub = { id: "Все работы", name: "Все работы" };

    useEffect(() => {
      if (selected_authors.length >= 1 && worksData && worksData.length > 0) {
        dispatch(setWorks([all_works_stub]));
      }
    }, [selected_authors, worksData]);

    useEffect(() => {
      if (min && max) {
        dispatch(setTimeRange([min, max]));
        dispatch(setInitialTimeRange({ min, max }));
      }
    }, [min, max]);

    const getTitle = () => {
      switch (entityType) {
        case 'profiles':
          return "Выбор автора и публикаций";
        case 'journals':
          return "Выбор журнала и публикаций";
        case 'conferences':
          return "Выбор конференций и публикаций";
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