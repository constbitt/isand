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
    setWorks
} from "@/src/store/slices/profilesSlice";
import CloseIcon from '@mui/icons-material/Close';
//import StyledAutocomplete from "@/src/components/Fields/StyledAutocompleteField";
import StyledSelect from "@/src/components/Fields/StyledSelect";
import {Author, AuthorsPostsPreparedResponseItem, AuthorsPostsRequest} from "@/src/store/types/authorTypes";
import {Laboratory} from "@/src/store/types/laboratoryTypes";
import {useGetAuthorsPostsQuery, useGetJournalsPostsQuery, useGetConferencesPostsQuery} from "@/src/store/api/serverApi";
import {Work} from "@/src/store/types/workTypes";


const AuthorsLaboratoriesMenu = ({
    openMenu,
    setOpenMenu,
    authors,
    laboratories,
  }: {
    openMenu: boolean;
    setOpenMenu: React.Dispatch<React.SetStateAction<boolean>>;
    authors: Author[];
    laboratories: Laboratory[];
  }) => {
    const dispatch = useTypedDispatch();
  
    const selected_authors = useTypedSelector(selectAuthors);
    const selected_laboratories = useTypedSelector(selectLaboratories);
    const selected_works = useTypedSelector(selectWorks);
    const path = window.location.pathname; 
    const authorParams = {
      authors: selected_authors.map((item) => ({ author_id: item.id })),
  };
  const skipCondition = selected_authors.length === 0;

  const { data: authorsWorksData } = useGetAuthorsPostsQuery(authorParams, { 
      skip: skipCondition || !path.includes("profiles") 
  });
  const { data: journalsWorksData } = useGetJournalsPostsQuery(authorParams, { 
      skip: skipCondition || !path.includes("journals") 
  });
  const { data: conferencesWorksData } = useGetConferencesPostsQuery(authorParams, { 
      skip: skipCondition || !path.includes("conferences") 
  });

  const worksData = path.includes("profiles") 
      ? authorsWorksData 
      : path.includes("journals") 
      ? journalsWorksData 
      : path.includes("conferences") 
      ? conferencesWorksData 
      : [];
  
    const all_works_stub = { id: "Все работы", name: "Все работы" };

    useEffect(() => {
      if (selected_authors.length >= 1 && worksData && worksData.length > 0) {
        dispatch(setWorks([all_works_stub]));
      }
    }, [selected_authors, worksData]);


    const getTitle = () => {
      if (path.includes("profiles")) {
          return "Выбор автора и публикаций";
      } else if (path.includes("journals")) {
          return "Выбор журнала и публикаций";
      } else if (path.includes("conferences")) {
          return "Выбор конференций и публикаций";
      }
      return ""; 
    };

    const getPlaceholder = () => {
      if (path.includes("profiles")) {
          return "Выберите авторов";
      } else if (path.includes("journals")) {
          return "Выберите журналы";
      } else if (path.includes("conferences")) {
          return "Выберите конференции";
      }
      return ""; 
    };

    return (
      <Drawer
        anchor={"left"}
        open={openMenu}
        onClose={() => {
          setOpenMenu(false);
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