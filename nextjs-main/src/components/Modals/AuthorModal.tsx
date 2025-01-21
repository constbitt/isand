// @ts-nocheck
import { useGetAuthorByIsandIdQuery, useGetPublicationsByAuthorIdQuery, useGetOrgInfoQuery, useGetAuthorJournalsQuery, useGetAuthorConferencesQuery } from "@/src/store/api/serverApiV2_5";
import { Box, Container, Stack, Modal, Typography } from "@mui/material";
import AuthorPersonHatCard from '@/src/components/Cards/AuthorPersonHat';
import { FC, useEffect, useState } from "react";
//import AuthorOverviewTab from "@/src/components/Tabs/AuthorOverviewTab";
import PublicationsTab from "@/src/components/Tabs/PublicationsTab";
import TabsComponent from "../Tabs/TabsComponent";
import ScienceObjectReview from "../CenterContainer/ScienceObjectReview";
import { useDispatch } from "react-redux";
import { getAuthors } from "@/src/store/api/serverApi";
import { AppDispatch } from "@/src/store/store";
//import OrganisationsTab from "@/src/components/Tabs/OrganisationsTab";
import { useGetAuthorInfoQuery } from '@/src/store/api/serverApiV3';
import { useGetAuthorsPostsQuery } from "@/src/store/api/serverApi";
import AuthorOverviewTab from "@/src/components/Tabs/AuthorOverviewTab";
import { parseStringToArray } from '@/src/tools/parseStringToArray';
import { useInView } from "react-intersection-observer";
import OrganisationsTab from "../Tabs/OrganisationsTab";
import JournsConfsTab from "../Tabs/JournsConfsTab";


interface AuthorModalProps {
    open: boolean;
    handleClose: () => void;
    id: number;
}

const AuthorModal: FC<AuthorModalProps> = ({ open, handleClose, id }) => {
    const { data: author, isLoading } = useGetAuthorByIsandIdQuery(id, { skip: id < 0 });
    const { data: publications, isLoading: publicationsLoading } = useGetPublicationsByAuthorIdQuery(id, { skip: id < 0 });
    const dispatch = useDispatch<AppDispatch>();
    const [matchingAuthorId, setMatchingAuthorId] = useState<number | null>(null);

    const isand_ids = author ? parseStringToArray(author[0].org_isand_ids) : [];
    const [currentId, setCurrentId] = useState(0);
    const [allOrganisations, setallOrganisations] = useState<any[]>([]);
    const { data, error } = useGetOrgInfoQuery(isand_ids[currentId]);
    const { ref, inView } = useInView();

    const [hasModalBelow, setHasModalBelow] = useState(false);

    useEffect(() => {
        if (data && data.length > 0) {
            setallOrganisations(prev => [...prev, ...data]);
            setCurrentId(prev => prev + 1);
        }
    }, [data]);

    useEffect(() => {
        if (error) {
            //console.error("Ошибка получения организаций:", error);
            return;
        }

        if (inView && !isLoading) {
            setCurrentId(prev => prev + 1);
        }
    }, [inView, isLoading, error]);

    useEffect(() => {
        const fetchAuthors = async () => {
            const authorsResponse = await dispatch(getAuthors.initiate() as any);
            const fullName = author ? author[0].author_fio : '';
            const matchingAuthor = authorsResponse.data.find((authorItem: { id: string; value: string }) => authorItem.value === fullName);
            if (matchingAuthor) {
                setMatchingAuthorId(matchingAuthor.id);
            }
        };

        fetchAuthors();
    }, [dispatch, author]); 

    const { data: prndAuthor, isLoading: prndAuthorLoading } = useGetAuthorInfoQuery(matchingAuthorId, { skip: matchingAuthorId === null });

    const { data: authorJournals } = useGetAuthorJournalsQuery(id, { skip: !id });
    const { data: authorConferences } = useGetAuthorConferencesQuery(id, { skip: !id });
    const [tabIndex, setTabIndex] = useState(0);

    const handleTabChange = (newValue: number) => {
        setTabIndex(newValue);
    };

    const tabs = [
        { 
            label: "Обзор", 
            component: (
                <AuthorOverviewTab 
                    prndAuthor={prndAuthor} 
                    matchingAuthorId={matchingAuthorId} 
                    prndAuthorLoading={prndAuthorLoading} 
                />
            ) 
        },
        { 
            label: "Публикации", 
            component: <PublicationsTab publications={publications || []} isLoading={publicationsLoading} /> 
        },
        { label: "Организации", component: <OrganisationsTab organisations={allOrganisations || []} isLoading={isLoading} /> },
        { label: "Журналы и конференции", component: <JournsConfsTab journals={authorJournals || []} conferences={authorConferences || []} isLoading={isLoading} /> },
    ];

    useEffect(() => {
        setTimeout(() => {
            const modals = document.querySelectorAll('.MuiModal-root');
            if (modals.length > 1 && open) {
                setHasModalBelow(true);
            } else {
                setHasModalBelow(false);
            }
        }, 100);
    }, [open]);


    return (
        <>
            <Modal
                open={open}
                onClose={handleClose}
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    maxHeight: '100vh',
                    margin: '10px 0px',
                }}
                slotProps={{
                    backdrop: {
                        sx: {
                            backgroundColor: hasModalBelow ? 'transparent' : 'rgba(0, 21, 64, 0.75)',
                        },
                    },
                }}
            >
                
                <Box
                    sx={{
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        py: 3,
                        px: 4,
                        borderRadius: 2,
                        width: '80%',
                    }}
                >

                    {isLoading ? (
                        <Typography>Загрузка информации об авторе...</Typography>
                    ) : (
                        <>
                                
                                    {!isLoading && author && (
                                        <AuthorPersonHatCard
                                            author={{
                                                a_fio: author[0].author_fio,
                                                a_aff_org_name: author[0].org_names,
                                                avatar: author[0].avatar,
                                            }}
                                            sx={{
                                                '& .fio-text': { fontSize: '50px' },
                                            }}
                                        />
                                    )}
                              <Box sx={{ mt: 4 }}></Box>
                                <TabsComponent
                                    tabs={tabs.map((tab) => ({ label: tab.label, component: tab.component }))}
                                    onChange={handleTabChange}
                                    propsValue={tabIndex}
                                    fontSize={25}
                                />
                                <AuthorOverviewTab 
                                    prndAuthor={prndAuthor} 
                                    matchingAuthorId={matchingAuthorId} 
                                    prndAuthorLoading={prndAuthorLoading} 
                                />
                        </>
                    )}
                </Box>
            </Modal>
        </>
    );
};

export default AuthorModal;

