// @ts-nocheck
import React from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import {
  Box,
  Card,
  CardContent,
  InputLabel,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { wrapper } from '@/src/store/store';
import { getAuthors, getJournals, getConferences, getOrganizations, getCities, getRunningQueriesThunk as apiV1GetRunningQueriesThunk } from '@/src/store/api/serverApi';
import { ApiResponse } from '@/src/store/types/apiTypes';
import { Author } from '@/src/store/types/authorTypes';

type EntityType = 'authors' | 'journals' | 'conferences' | 'organizations' | 'cities';

const entityLabels: Record<EntityType, { singular: string; plural: string; pluralGenitive: string; selectLabel: string }> = {
  authors: { singular: 'автора', plural: 'авторов', pluralGenitive: 'авторов', selectLabel: 'Выберите одного или двух авторов' },
  journals: { singular: 'журнал', plural: 'журналов', pluralGenitive: 'журналов', selectLabel: 'Выберите один или два журнала' },
  conferences: { singular: 'конференцию', plural: 'конференций', pluralGenitive: 'конференций', selectLabel: 'Выберите одну или две конференции' },
  organizations: { singular: 'организацию', plural: 'организаций', pluralGenitive: 'организаций', selectLabel: 'Выберите одну или две организации' },
  cities: { singular: 'город', plural: 'городов', pluralGenitive: 'городов', selectLabel: 'Выберите один или два города' },
};

const entityNotFoundMessages: Record<EntityType, string> = {
  authors: 'Авторы не найдены',
  journals: 'Журналы не найдены',
  conferences: 'Конференции не найдены',
  organizations: 'Организации не найдены',
  cities: 'Города не найдены',
};

interface InsightsSelectPageProps {
  entitiesResponse: ApiResponse<Author[]>;
  entityType: EntityType;
}

const InsightsSelectPage: React.FC<InsightsSelectPageProps> = ({ entitiesResponse, entityType }): React.ReactElement => {
  const router = useRouter();
  const [selectedEntityIds, setSelectedEntityIds] = React.useState<string[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  
  // Получаем сущности из пропса
  const entities = React.useMemo(() => {
    return entitiesResponse.data || [];
  }, [entitiesResponse.data]);
  
  const loading = entitiesResponse.isLoading;
  const labels = entityLabels[entityType];
  
  const sortedAndFilteredEntities = React.useMemo(() => {
    let candidates = entities;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      candidates = entities.filter((e) => e.value.toLowerCase().includes(q));
    }
    // Сортируем ВСЕ кандидаты по алфавиту (с учётом кириллицы)
    const sortedCandidates = [...candidates].sort((a, b) =>
      a.value.localeCompare(b.value, 'ru')
    );
    const selected = candidates.filter((e) => selectedEntityIds.includes(e.id));
    const others = candidates.filter((e) => !selectedEntityIds.includes(e.id));
    return [...selected, ...others];
  }, [entities, selectedEntityIds, searchQuery]);

  const handleEntityClick = (id: string) => {
    if (selectedEntityIds.includes(id)) {
      setSelectedEntityIds((prev) => prev.filter((entityId) => entityId !== id));
    } else if (selectedEntityIds.length < 2) {
      setSelectedEntityIds((prev) => [...prev, id]);
    }
  };

  const handleProceed = () => {
    const query = selectedEntityIds.join(',');
    router.push(`/insights/result?entity=${entityType}&ids=${query}`);
  };

  const handleExpertCheck = () => {
    // Переход на страницу экспертной проверки/отчёта
    router.push('/expert-check'); // или другой URL, который вы выберете
  };

  const isButtonDisabled = selectedEntityIds.length === 0;
  
  // Определяем, показывать ли кнопку "Экспертная проверка"
  const showExpertButton = entityType === 'authors';
  
  // Ширина для поля ввода и карточки
  const fieldAndCardWidth = showExpertButton 
    ? { xs: '100%', lg: 'calc(100% - 106px - 100px - 20px)' } // Две кнопки: 106px + 100px + отступы
    : { xs: '100%', lg: 'calc(100% - 106px - 20px)' }; // Одна кнопка: 106px + отступы

  return (
    <>
      <Head>
        <title>Эволюция и прогноз интересов</title>
      </Head>
      <main className="flex flex-col items-center">
        <Stack spacing={3} sx={{ width: '67.5vw', mt: '32px', position: 'relative' }}>
          <Stack
            direction={{ xs: 'column', lg: 'row' }}
            spacing={4}
            sx={{
              alignItems: { xs: 'stretch', lg: 'flex-start' },
              justifyContent: { lg: 'space-between' },
              position: 'relative',
            }}
          >
            <Stack spacing={2} sx={{ flex: { lg: '0 0 520px' }, width: { xs: '100%', lg: 520 }, minWidth: 0 }}>
              {/* Надпись */}
              <InputLabel
                sx={{
                  fontSize: '16px',
                  color: '#1b4596',
                  fontWeight: 'normal',
                  mb: '4px',
                  transform: 'none',
                  position: 'static',
                  pointerEvents: 'none',
                }}
              >
                {labels.selectLabel}
              </InputLabel>

              {/* Поле + кнопка — модифицированный блок */}
              <Stack
                direction="row"
                spacing={2}
                sx={{
                  alignItems: 'center',
                  position: 'sticky',
                  top: 16,
                  zIndex: 10,
                  backgroundColor: '#FCFCFC',
                }}
              >
                <TextField
                  sx={{
                    width: fieldAndCardWidth,
                    '& .MuiOutlinedInput-root': {
                      height: 48,
                      borderRadius: '12px',
                    },
                  }}
                  placeholder="Введите запрос"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                
                {/* Контейнер для кнопок */}
                <Stack direction="row" spacing={1.5}>
                  {/* Кнопка "Найти" - оригинальный размер */}
                  <button
                    onClick={isButtonDisabled ? undefined : handleProceed}
                    disabled={isButtonDisabled}
                    style={{
                      width: '106px', // ОРИГИНАЛЬНАЯ ШИРИНА
                      height: '48px',
                      borderRadius: '12px',
                      fontWeight: '500',
                      fontSize: '14px',
                      textTransform: 'none',
                      border: 'none',
                      cursor: isButtonDisabled ? 'not-allowed' : 'pointer',
                      backgroundColor: isButtonDisabled ? '#D1D1D1' : '#1b4596',
                      color: isButtonDisabled ? '#757575' : '#FFFFFF',
                      opacity: 1,
                      pointerEvents: 'all',
                      outline: 'none',
                      boxShadow: 'none',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    Найти
                  </button>
                  
                  {/* Кнопка "Экспертная проверка" - только для авторов */}
                  {showExpertButton && (
                    <button
                      onClick={handleExpertCheck}
                      style={{
                        width: '100px', // УЗКАЯ кнопка (на 6px уже чем "Найти")
                        height: '48px',
                        borderRadius: '12px',
                        fontWeight: '500',
                        fontSize: '12px', // Меньший шрифт для двух строк
                        textTransform: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: '#2E7D32',
                        color: '#FFFFFF',
                        opacity: 1,
                        pointerEvents: 'all',
                        outline: 'none',
                        boxShadow: 'none',
                        WebkitTapHighlightColor: 'transparent',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        lineHeight: 1.1,
                        padding: '4px 2px',
                        textAlign: 'center',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#1B5E20';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#2E7D32';
                      }}
                    >
                      <span>Экспертная</span>
                      <span>проверка</span>
                    </button>
                  )}
                </Stack>
              </Stack>

              {/* Карточка */}
              <Card
                sx={{
                  width: fieldAndCardWidth,
                  bgcolor: '#F5F5F6',
                  borderRadius: '16px',
                  boxShadow: '0 4px 32px rgba(0,34,102,0.15)',
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  {loading ? (
                    <Typography sx={{ p: 2, textAlign: 'center' }}>Загрузка...</Typography>
                  ) : (
                    <Box
                      sx={{
                        maxHeight: 420,
                        overflowY: 'auto',
                        p: 2,
                        pr: 3,
                        '&::-webkit-scrollbar': { width: 6 },
                        '&::-webkit-scrollbar-thumb': { backgroundColor: '#1b4596', borderRadius: 8 },
                        '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
                      }}
                    >
                      <Stack>
                        {sortedAndFilteredEntities.length === 0 ? (
                          <Typography sx={{ py: 1.2, color: '#656565' }}>
                            {entityNotFoundMessages[entityType]}
                          </Typography>
                        ) : (
                          sortedAndFilteredEntities.map((entity) => (
                            <Box
                              key={entity.id}
                              onClick={() => handleEntityClick(entity.id)}
                              sx={{
                                py: 1.2,
                                cursor: 'pointer',
                                userSelect: 'none',
                                color: selectedEntityIds.includes(entity.id) ? '#656565' : '#1b4596',
                                fontWeight: selectedEntityIds.includes(entity.id) ? 'bold' : 'normal',
                                textAlign: 'left',
                                '&:hover': {
                                  backgroundColor: 'rgba(27,69,150,0.06)',
                                  borderRadius: '8px',
                                },
                              }}
                            >
                              {entity.value}
                            </Box>
                          ))
                        )}
                      </Stack>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Stack>

            <Box
              sx={{
                display: { xs: 'none', lg: 'block' },
                width: 440,
                height: 760,
                position: 'absolute',
                top: -90,
                right: -220,
                overflow: 'hidden',
                pointerEvents: 'none',
              }}
            >
              <Image
                src="/images/presentation/1.jpg"
                alt="crystals"
                fill
                style={{
                  objectFit: 'cover',
                  objectPosition: 'left center',
                  opacity: 0.3,
                  transform: 'scale(1.1)',
                }}
                priority
              />
            </Box>
          </Stack>
        </Stack>
      </main>
    </>
  );
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
    
    // Сортируем данные по алфавиту перед отправкой в компонент
    if (entitiesResponse?.data) {
      entitiesResponse = {
        ...entitiesResponse,
        data: [...entitiesResponse.data].sort((a, b) =>
          a.value.localeCompare(b.value, 'ru')
        ),
      };
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

export default InsightsSelectPage;