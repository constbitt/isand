// @ts-nocheck
import React, {useState, useEffect} from "react";
import { useRouter } from 'next/router';
import { Box, CircularProgress, Typography } from '@mui/material';
import Head from 'next/head';
import InsightsOnePage from './one';
import InsightsTwoPage from './two';
import { wrapper } from '@/src/store/store';
import { getAuthors, getJournals, getConferences, getOrganizations, getCities, getRunningQueriesThunk as apiV1GetRunningQueriesThunk } from '@/src/store/api/serverApi';
import { ApiResponse } from '@/src/store/types/apiTypes';
import { Author } from '@/src/store/types/authorTypes';

type EntityType = 'authors' | 'journals' | 'conferences' | 'organizations' | 'cities';

const entityLabels: Record<EntityType, string> = {
  authors: 'авторов',
  journals: 'журналов',
  conferences: 'конференций',
  organizations: 'организаций',
  cities: 'городов',
};

interface InsightsResultPageProps {
  entitiesResponse: ApiResponse<Author[]>;
  entityType: EntityType;
}

const InsightsResultPage: React.FC<InsightsResultPageProps> = ({ entitiesResponse, entityType }): React.ReactElement => {
  const router = useRouter();
  const { ids } = router.query;

  // Пока query параметры не загружены
  if (!router.isReady) {
    return (
      <>
        <Head>
          <title>Загрузка...</title>
        </Head>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      </>
    );
  }

  // Парсим список сущностей из query параметра
  const entityIds = typeof ids === 'string' ? ids.split(',').filter(Boolean) : [];

  if (entityIds.length === 0) {
    return (
      <>
        <Head>
          <title>Ошибка</title>
        </Head>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Typography variant="h6" color="error">
            {entityLabels[entityType] ? `Не выбраны ${entityLabels[entityType]}` : 'Сущности не выбраны'}
          </Typography>
        </Box>
      </>
    );
  }

  // Роутинг в зависимости от количества сущностей
  if (entityIds.length === 1) {
    return <InsightsOnePage entityId={entityIds[0]} entitiesResponse={entitiesResponse} entityType={entityType} />;
  } else if (entityIds.length === 2) {
    return <InsightsTwoPage entityIds={[entityIds[0], entityIds[1]]} entitiesResponse={entitiesResponse} entityType={entityType} />;
  } else {
    return (
      <>
        <Head>
          <title>Ошибка</title>
        </Head>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Typography variant="h6" color="error">
            Выбрано слишком много {entityLabels[entityType] || 'сущностей'} (максимум 2)
          </Typography>
        </Box>
      </>
    );
  }
};

export const getServerSideProps = wrapper.getServerSideProps(
  (store) => async (context) => {
    const entityType = (context.query.entity as string) || 'authors';
    
    // Заглушка для загрузки данных в зависимости от типа сущности
    let entitiesResponse: ApiResponse<Author[]>;
    
    switch (entityType) {
      case 'authors':
        await store.dispatch(getAuthors.initiate());
        entitiesResponse = getAuthors.select()(store.getState());
        break;
      case 'journals':
        await store.dispatch(getJournals.initiate());
        entitiesResponse = getJournals.select()(store.getState());
        break;
      case 'conferences':
        await store.dispatch(getConferences.initiate());
        entitiesResponse = getConferences.select()(store.getState());
        break;
      case 'organizations':
        await store.dispatch(getOrganizations.initiate());
        entitiesResponse = getOrganizations.select()(store.getState());
        break;
      case 'cities':
        await store.dispatch(getCities.initiate());
        entitiesResponse = getCities.select()(store.getState());
        break;
      default:
        await store.dispatch(getAuthors.initiate());
        entitiesResponse = getAuthors.select()(store.getState());
    }
    
    await Promise.all(store.dispatch(apiV1GetRunningQueriesThunk()));

    return {
      props: {
        entitiesResponse,
        entityType: entityType as EntityType,
      },
    };
  }
);

export default InsightsResultPage;

