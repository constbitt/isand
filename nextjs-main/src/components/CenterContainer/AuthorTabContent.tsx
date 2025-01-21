// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Typography, Stack, Grid } from '@mui/material';
import ScienceObjectReview from '@/src/components/CenterContainer/ScienceObjectReview';
import { PublicationCard } from "@/src/components/Cards/PublicationCard";
import { JournalCard } from '@/src/components/Cards/JournalCard';
import { OrganisationCard } from '@/src/components/Cards/OrganisationCard';
import Link from 'next/link';
import router, { NextRouter, useRouter } from 'next/router';
import { useGetPublIsandInfoQuery } from '@/src/store/api/serverApiV2_5';
import PublicationModal from '@/src/components/Modals/PublicationModal';
import OrganisationModal from '@/src/components/Modals/OrganisationModal';
import JournalModal from '@/src/components/Modals/JournalModal';
import ConferenceModal from '@/src/components/Modals/ConferenceModal';


interface TabContentProps {
  index: number;
  author: any;
  isLoading: boolean;
  authorPosts: any[] | undefined;
  postsLoading: boolean;
  authorJournals: any[] | undefined;
  authorConferences: any[] | undefined;
  idAuthor: number;
  allOrganisations: any[];
}




const AuthorTabContent = ({ index, author, isLoading, authorPosts, postsLoading, authorJournals, authorConferences, idAuthor, allOrganisations }: TabContentProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPublicationId, setSelectedPublicationId] = useState<number | null>(null);
  const [selectedOrganisationId, setSelectedOrganisationId] = useState<number | null>(null);
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [isConferenceModalOpen, setIsConferenceModalOpen] = useState(false);
  const [selectedJournalId, setSelectedJournalId] = useState<number | null>(null);
  const [selectedConferenceId, setSelectedConferenceId] = useState<number | null>(null);

  const handleOpenPublicationModal = (id: number) => {
    setSelectedPublicationId(id);
    setIsModalOpen(true);
  };

  const handleClosePublicationModal = () => {
    setIsModalOpen(false);
    setSelectedPublicationId(null);
  };

  const handleOpenOrganisationModal = (id: number) => {
    setSelectedOrganisationId(id);
    setIsModalOpen(true);
  };

  const handleCloseOrganisationModal = () => {
    setIsModalOpen(false);
    setSelectedOrganisationId(null);
  };

  const handleOpenJournalModal = (id: number) => {
    setSelectedJournalId(id);
    setIsJournalModalOpen(true);
  };

  const handleCloseJournalModal = () => {
    setIsJournalModalOpen(false);
    setSelectedJournalId(null);
  };

  const handleOpenConferenceModal = (id: number) => {
    setSelectedConferenceId(id);
    setIsConferenceModalOpen(true);
  };

  const handleCloseConferenceModal = () => {
    setIsConferenceModalOpen(false);
    setSelectedConferenceId(null);
  };

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
                  <div onClick={() => handleOpenPublicationModal(post.id)} key={post.id} style={{ cursor: 'pointer' }}>
                    <PublicationCard post={post} />
                  </div>
                ))}
                <PublicationModal 
                  open={isModalOpen} 
                  handleClose={handleClosePublicationModal}
                  id={selectedPublicationId!}
                  isIsandId={false}
                />
              </Stack>
            ) : (
              <Typography>Публикации не найдены</Typography>
            )}
          </>
        );
    case 2:
      return (
        <>
          <Stack spacing={2}>
              {allOrganisations && allOrganisations.length > 0 ? (
                allOrganisations.map((organisation) => (
                  <div onClick={() => handleOpenOrganisationModal(organisation.org_isand_id)} key={organisation.org_isand_id} style={{ cursor: 'pointer' }}>
                    <OrganisationCard post={{ id: organisation.org_isand_id, name: organisation.org_name, ror: organisation.ror, avatar: organisation.avatar }} />
                  </div>
                ))
              ) : (
                <Typography>Организации не найдены</Typography>
              )}
          </Stack>
          <OrganisationModal 
            open={isModalOpen} 
            handleClose={handleCloseOrganisationModal}
            id={selectedOrganisationId!}
          />
        </>
      );
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
                  <div onClick={() => handleOpenJournalModal(journal.journal_isand_id)} key={journal.journal_isand_id} style={{ cursor: 'pointer' }}>
                    <JournalCard post={{ id: journal.journal_isand_id, name: journal.journal_name, avatar: journal.avatar }} />
                  </div>
                ))
              ) : (
                <Typography>Журналы не найдены</Typography>
              )}
            </Stack>
            <JournalModal 
              open={isJournalModalOpen} 
              handleClose={handleCloseJournalModal}
              id={selectedJournalId!}
            />
          </Grid>
          <Grid item xs={6}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
              Конференции
            </Typography>
            <Stack spacing={2}>
              {authorConferences && authorConferences.length > 0 ? (
                authorConferences.map((conference) => (
                  <div onClick={() => handleOpenConferenceModal(conference.conf_isand_id)} key={conference.conf_isand_id} style={{ cursor: 'pointer' }}>
                    <JournalCard post={{ id: conference.conf_isand_id, name: conference.conf_name, avatar: conference.avatar }} />
                  </div>
                ))
              ) : (
                <Typography>Конференции не найдены</Typography>
              )}
            </Stack>
            <ConferenceModal 
              open={isConferenceModalOpen} 
              handleClose={handleCloseConferenceModal}
              id={selectedConferenceId!}
            />
          </Grid>
        </Grid>
      );
    default:
      return null;
  }
};

export default AuthorTabContent;