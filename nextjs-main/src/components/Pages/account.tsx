import React, { FC, useEffect, useState, useMemo } from "react";
import { Box, Typography, Container, Stack, IconButton, MenuItem, Dialog } from "@mui/material";
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Head from "next/head";
import TabsComponent from "@/src/components/Tabs/TabsComponent";
import { useGetAuthorInfoQuery } from '@/src/store/api/serverApiV3';
import AuthorPersonHatCard from '@/src/components/Cards/AuthorPersonHat';
import { NextRouter, useRouter } from 'next/router';
import { useGetAuthorsPostsQuery } from "@/src/store/api/serverApi";
import { useGetAuthorJournalsQuery, useGetAuthorConferencesQuery, useGetAuthorByPrndQuery, useGetOrgInfoQuery, useGetPublicationsByAuthorIdQuery } from "@/src/store/api/serverApiV2_5";
import AuthorTabContent from '@/src/components/CenterContainer/AuthorTabContent';
import { parseStringToArray } from '@/src/tools/parseStringToArray';
import { useInView } from "react-intersection-observer";
import AuthorOverviewTab from "../Tabs/AuthorOverviewTab";
import PublicationsTab from "../Tabs/PublicationsTab";
import JournsConfsTab from "../Tabs/JournsConfsTab";
import OrganisationsTab from "../Tabs/OrganisationsTab";

const formatAuthorName = (authorString: string) => {
  return authorString.split(';').map(author => {
    const words = author.trim().split(' ');
    const surname = words[0];
    const initials = words.slice(1)
      .map(word => `${word[0]}.`)
      .join(' ');
    return `${surname} ${initials}`;
  }).join('; ');
};

const AccountPageContent: FC = () => {
    const idAuthor = 528;
    const router: NextRouter = useRouter();
    const { data: author, isLoading } = useGetAuthorInfoQuery(idAuthor, { skip: idAuthor < 0 });
    const { data: authorByPrnd } = useGetAuthorByPrndQuery(idAuthor, { skip: idAuthor < 0 });
    const authorIsandId = authorByPrnd ? authorByPrnd[0].author_isand_id : null;
    const { data: authorJournals } = useGetAuthorJournalsQuery(authorIsandId, { skip: !authorIsandId });
    const { data: authorConferences } = useGetAuthorConferencesQuery(authorIsandId, { skip: !authorIsandId });

  
    const [expanded, setExpanded] = useState(false); 
    const toggleExpansion = () => {
      setExpanded(!expanded);
    };
  
    useEffect(() => {}, [authorJournals, authorConferences]);
  
    const { data: authorPosts, isLoading: postsLoading } = useGetAuthorsPostsQuery({
      authors: [{ author_id: idAuthor.toString() }]
    });
    const { data: publications, isLoading: publicationsLoading } = useGetPublicationsByAuthorIdQuery(authorIsandId, { skip: authorIsandId < 0 });
    const isand_ids = authorByPrnd ? parseStringToArray(authorByPrnd[0].org_isand_ids) : [];
    const { ref, inView } = useInView();
    const [currentId, setCurrentId] = useState(0);
    const [allOrganisations, setallOrganisations] = useState<any[]>([]);
    const { data, error } = useGetOrgInfoQuery(isand_ids[currentId]);
    useEffect(() => {
        if (data && data.length > 0 && allOrganisations.length < isand_ids.length) {
            setallOrganisations(prev => [...prev, ...data]);
            setCurrentId(prev => prev + 1);
        }
    }, [data]);

    useEffect(() => {
        if (inView && !isLoading) {
            setCurrentId(prev => prev + 1);
        }
    }, [inView, isLoading]);

    const handleEditPage = () => {
        router.push('/account/edit_page');
    };

    const overviewTab = useMemo(() => (
        <AuthorOverviewTab 
            prndAuthor={author} 
            matchingAuthorId={idAuthor} 
            prndAuthorLoading={isLoading} 
        />
    ), [author, idAuthor, isLoading]);

    const tabs = [
        { 
            label: "Обзор", 
            component: overviewTab
        },
        { 
            label: "Публикации", 
            component: <PublicationsTab publications={publications || []} isLoading={publicationsLoading} /> 
        },
        { label: "Организации", component: <OrganisationsTab organisations={allOrganisations || []} isLoading={isLoading} /> },
        { label: "Журналы и конференции", component: <JournsConfsTab journals={authorJournals || []} conferences={authorConferences || []} isLoading={isLoading} /> },
    ];
  

  return (
    <>
      <Head>
        <title>Личная страница</title>
      </Head>
      <Container
        sx={{
          position: 'absolute',
          top: 20,
          right: 16,
          zIndex: 10,
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: 1,
          maxWidth: '300px',
          width: 'auto',
          maxHeight: '100px',
        }}
      >
        {!isLoading && author && (
          <Stack direction="row" spacing={0} alignItems="flex-start">
            <AuthorPersonHatCard
              author={{
                a_fio: author.fio,
                a_aff_org_name: author.affiliation,
                avatar: author.avatar,
              }}
              sx={{
                width: 'auto',
                display: 'flex',
                alignItems: 'flex-start',
                '& .MuiAvatar-root': { 
                  width: 48, 
                  height: 48,
                  fontSize: '16px', 
                  margin: 0,
                },
                '& .fio-text': { 
                  display: 'none',
                },
                '& .aff-text': {
                  display: 'none'
                },
                '& .MuiStack-root': {
                  margin: 0,
                  padding: 0,
                  gap: 0
                },
                '& > .MuiStack-root': {
                  gap: 0
                }
              }}
            />
            <Stack direction="row" alignItems="center">
              <Typography
                sx={{
                  alignSelf: 'flex-start',
                  marginLeft: -11,
                  marginTop: 1.5,
                  padding: 0,
                }}
              >
                {formatAuthorName(author.fio)}
              </Typography>
              <IconButton
                sx={{
                  padding: 0,
                  marginLeft: 1,
                  marginTop: 1,
                }}
                onClick={toggleExpansion}
              >
                {expanded ? (
                  <ExpandMoreIcon sx={{ fontSize: 30, color: '#1B4596'}} />
                ) : (
                  <ExpandLessIcon sx={{ fontSize: 30, color: '#1B4596'}} />
                )}
              </IconButton>
            </Stack>
          </Stack>
        )}
      </Container>
      <Dialog
        open={expanded}
        onClose={toggleExpansion}
        hideBackdrop
        disablePortal
        PaperProps={{
          sx: {
            position: 'absolute',
            top: '80px',
            right: '16px',
            margin: 0,
            maxWidth: '150px',
            height: '100px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            padding: 1,
          }
        }}
      >
        <Stack spacing={0}> 
          <MenuItem sx={{ fontSize: '0.675rem', padding: '0px 4px' }}>Уведомления</MenuItem> 
          <MenuItem 
            onClick={handleEditPage}
            sx={{ fontSize: '0.675rem', padding: '0px 4px' }}
          >
            Изменение страниц
          </MenuItem> 
          <MenuItem sx={{ fontSize: '0.675rem', padding: '0px 4px' }}>Настройки аккаунта</MenuItem>
          <MenuItem sx={{ fontSize: '0.675rem', padding: '0px 4px' }}>Меню администратора</MenuItem> 
          <MenuItem sx={{ fontSize: '0.675rem', padding: '0px 4px', color: '#AA0000' }}>Выход</MenuItem> 
        </Stack>
      </Dialog>
      <Box sx={{ padding: 4, position: 'relative' }}> 
        <Container>
          <Stack spacing={2} sx={{ mt: "60px", justifyContent: "center", width: "100%" }}>
            {!isLoading && author && (
              <>
                <AuthorPersonHatCard
                  author={{
                    a_fio: author.fio,
                    a_aff_org_name: author.affiliation,
                    avatar: author.avatar,
                  }}
                  sx={{
                    '& .fio-text': { fontSize: '50px' },
                  }}
                />
              </>
            )}
          </Stack>
        </Container>
        <Box sx={{ mt: 6 }}>
          <Container>
            <TabsComponent tabs={tabs} fontSize={25} />
          </Container>
        </Box>
      </Box>
    </>
  );
};

export default AccountPageContent;



