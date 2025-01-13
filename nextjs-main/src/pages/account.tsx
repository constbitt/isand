import React, { FC, useEffect, useState } from "react";
import { Box, Typography, Container, Stack, Card, CardContent, Grid, IconButton, MenuItem } from "@mui/material";
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Head from "next/head";
import TabsComponent from "@/src/components/Tabs/TabsComponent";
import { useGetAuthorInfoQuery } from '@/src/store/api/serverApiV3';
import ScienceObjectReview from '@/src/components/CenterContainer/ScienceObjectReview';
import AuthorPersonHatCard from '@/src/components/Cards/AuthorPersonHat';
import { NextRouter, useRouter } from 'next/router';
import { useGetAuthorsPostsQuery } from "@/src/store/api/serverApi";
import { PublicationCard } from "@/src/components/PublicationCard";
import { useGetAuthorJournalsQuery } from "@/src/store/api/serverApiV2_5";
import { useGetAuthorConferencesQuery } from "@/src/store/api/serverApiV2_5";
import { JournalCard } from '@/src/components/JournalCard';

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

const AccountPage: FC = () => {
  const idAuthor = 528;
  const router: NextRouter = useRouter();
  const { data: author, isLoading } = useGetAuthorInfoQuery(idAuthor, { skip: idAuthor < 0 });
  const { data: authorJournals } = useGetAuthorJournalsQuery(idAuthor);
  const { data: authorConferences } = useGetAuthorConferencesQuery(idAuthor);

  const [expanded, setExpanded] = useState(false); 
  const toggleExpansion = () => {
    setExpanded(!expanded);
  };

  useEffect(() => {}, [authorJournals, authorConferences]);

  const { data: authorPosts, isLoading: postsLoading } = useGetAuthorsPostsQuery({
    authors: [{ author_id: idAuthor.toString() }]
  });

  const renderTabContent = (index: number) => {
    switch (index) {
      case 0:
        return (
          <>
            {isLoading ? (
              <Typography></Typography>
            ) : author ? (
              <ScienceObjectReview
                idAuthor={idAuthor}
                citations={author.citations || []}
                publications={author.publications || []}
                description={author.description || ""}
                geoposition={author.geoposition || ""}
                ids={author.ids || []}
                objectType="authors"
              />
            ) : (
              <Typography>Автор не найден</Typography>
            )}
          </>
        );
      case 1:
        return (
          <>
            {postsLoading ? (
              <Typography>Загрузка публикаций...</Typography>
            ) : authorPosts && authorPosts.length > 0 ? (
              <Stack spacing={2}>
                {authorPosts.map((post) => (
                  <PublicationCard key={post.id} post={post} />
                ))}
              </Stack>
            ) : (
              <Typography>Публикации не найдены</Typography>
            )}
          </>
        );
      case 2:
        return <Typography>Информация об организации.</Typography>;
      case 3:
        return (
          <Grid container spacing={2} sx={{ pl: 13 }}>
            <Grid item xs={6}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
                Журналы
              </Typography>
              <Stack spacing={2}>
                {authorJournals && authorJournals.length > 0 ? (
                  authorJournals.map((journal) => (
                    <JournalCard key={journal.journal_isand_id} post={{ id: journal.journal_isand_id, name: journal.journal_name, avatar: journal.avatar }} />
                  ))
                ) : (
                  <Typography>Журналы не найдены</Typography>
                )}
              </Stack>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
                Конференции
              </Typography>
              <Stack spacing={2}>
                {authorConferences && authorConferences.length > 0 ? (
                  authorConferences.map((conference) => (
                    <JournalCard key={conference.conf_isand_id} post={{ id: conference.conf_isand_id, name: conference.conf_name, avatar: conference.avatar }} />
                  ))
                ) : (
                  <Typography>Конференции не найдены</Typography>
                )}
              </Stack>
            </Grid>
          </Grid>
        );
      default:
        return null;
    }
  };

  const tabs = [
    { label: "Обзор", component: renderTabContent(0) },
    { label: "Публикации", component: renderTabContent(1) },
    { label: "Организация", component: renderTabContent(2) },
    { label: "Журналы и конференции", component: renderTabContent(3) },
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
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
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
            {expanded && (
              <Box
                sx={{
                  marginTop: 6,
                  position: 'absolute',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  padding: 1,
                  maxWidth: '150px',
                  height: '100px',
                  right: 0,
                }}
              >
                  <Stack spacing={0}> 
                    <MenuItem sx={{ fontSize: '0.675rem', padding: '0px 4px' }}>Уведомления</MenuItem> 
                    <MenuItem sx={{ fontSize: '0.675rem', padding: '0px 4px' }}>Изменение страниц</MenuItem> 
                    <MenuItem sx={{ fontSize: '0.675rem', padding: '0px 4px' }}>Настройки аккаунта</MenuItem>
                    <MenuItem sx={{ fontSize: '0.675rem', padding: '0px 4px' }}>Меню администратора</MenuItem> 
                    <MenuItem sx={{ fontSize: '0.675rem', padding: '0px 4px', color: '#AA0000' }}>Выход</MenuItem> 
                  </Stack>
              </Box>
            )}
          </Stack>
        )}
      </Container>
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

export default AccountPage;
