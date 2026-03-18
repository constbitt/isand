// pages/expert-check/index.tsx
import React, { useState, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  TextField,
  Avatar,
  Paper,
  Chip,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import ScienceIcon from '@mui/icons-material/Science';
import { wrapper } from '@/src/store/store';
import { getAuthors, getRunningQueriesThunk as apiV1GetRunningQueriesThunk } from '@/src/store/api/serverApi';
import { ApiResponse } from '@/src/store/types/apiTypes';
import { Author } from '@/src/store/types/authorTypes';

// Список авторов для экспертной проверки
const EXPERT_AUTHORS = [
  "Арутюнов Арам Владимирович",
  "Барабанова Елизавета Александровна",
  "Балабанов Андрей Валерьевич",
  "Бахтадзе Наталья Николаевна",
  "Вишневский Владимир Миронович",
  "Вересников Георгий Сергеевич",
  "Галяев Андрей Алексеевич",
  "Губанов Дмитрий Алексеевич",
  "Дранко Олег Иванович",
  "Жилякова Людмила Юрьевна",
  "Чхартишвили Александр Гедеванович",
  "Иванов Владимир Петрович",
  "Искаков Алексей Борисович",
  "Калашников Андрей Олегович",
  "Каршаков Евгений Владимирович",
  "Кузнецов Александр Владимирович",
  "Кушнер Алексей Гурьевич",
  "Лазарев Александр Алексеевич",
  "Макаренко Андрей Викторович",
  "Мешков Дмитрий Олегович",
  "Мещеряков Роман Валерьевич",
  "Нижегородцев Роберт Михайлович",
  "Пащенко Александр Федорович",
  "Полетыкин Алексей Григорьевич",
  "Толок Алексей Вячеславович",
  "Уткин Антон Викторович",
  "Уткин Виктор Анатольевич",
  "Фархадов Маис Паша Оглы",
  "Филимонюк Леонид Юрьевич",
  "Хлебников Михаил Владимирович",
  "Чернов Игорь Викторович",
  "Новиков Дмитрий Александрович"
].sort((a, b) => a.localeCompare(b, 'ru'));

// Сопоставление имён экспертов с ID из API (тот же источник, что и insights/select)
const buildNameToIdMap = (authors: Author[]): Map<string, string> => {
  const map = new Map<string, string>();
  const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');
  for (const expert of EXPERT_AUTHORS) {
    const expertNorm = normalize(expert);
    const found = authors.find((a) => {
      const valNorm = normalize(a.value);
      return valNorm === expertNorm || valNorm.includes(expertNorm) || expertNorm.includes(valNorm);
    });
    if (found) map.set(expert, found.id);
  }
  return map;
};

interface ExpertCheckSelectPageProps {
  authorsResponse: ApiResponse<Author[]>;
}

const ExpertCheckSelectPage: React.FC<ExpertCheckSelectPageProps> = ({ authorsResponse }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);

  const authors = useMemo(() => authorsResponse?.data ?? [], [authorsResponse?.data]);
  const nameToId = useMemo(() => buildNameToIdMap(authors), [authors]);

  const authorsWithIds = useMemo(() => EXPERT_AUTHORS.filter((name) => nameToId.has(name)), [nameToId]);

  const filteredAuthors = useMemo(() => {
    if (!searchQuery.trim()) return authorsWithIds;
    const q = searchQuery.toLowerCase();
    return authorsWithIds.filter(name => name.toLowerCase().includes(q));
  }, [searchQuery, authorsWithIds]);

  const handleAuthorClick = (authorName: string) => {
    setSelectedAuthor(authorName);
  };

  const handleProceed = () => {
    if (selectedAuthor) {
      const authorId = nameToId.get(selectedAuthor);
      if (authorId) {
        router.push(`/expert-check/result?ids=${authorId}&name=${encodeURIComponent(selectedAuthor)}`);
      }
    }
  };

  return (
    <>
      <Head>
        <title>Экспертная проверка - выбор автора</title>
      </Head>
      <main className="flex flex-col items-center">
        <Stack spacing={3} sx={{ width: '67.5vw', mt: '32px' }}>
          {/* Заголовок */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              bgcolor: '#1b4596', 
              color: 'white',
              borderRadius: '16px',
              boxShadow: '0 4px 32px rgba(0,34,102,0.15)'
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <ScienceIcon sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Экспертная проверка
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                  Выберите автора для детального анализа и верификации терминов
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Поле поиска */}
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              fullWidth
              placeholder="Поиск автора..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  height: 48,
                  borderRadius: '12px',
                  bgcolor: 'white',
                },
              }}
            />
            
            <button
              onClick={handleProceed}
              disabled={!selectedAuthor || !nameToId.has(selectedAuthor)}
              style={{
                width: '120px',
                height: '48px',
                borderRadius: '12px',
                fontWeight: 500,
                fontSize: '14px',
                textTransform: 'none',
                border: 'none',
                cursor: selectedAuthor ? 'pointer' : 'not-allowed',
                backgroundColor: selectedAuthor ? '#1b4596' : '#D1D1D1',
                color: selectedAuthor ? '#FFFFFF' : '#757575',
                outline: 'none',
              }}
            >
              Анализировать
            </button>
          </Stack>

          {/* Информация о выборе */}
          {selectedAuthor && (
            <Chip
              icon={<PersonIcon />}
              label={`Выбран: ${selectedAuthor}`}
              onDelete={() => setSelectedAuthor(null)}
              sx={{
                bgcolor: '#1b4596',
                color: 'white',
                '& .MuiChip-deleteIcon': {
                  color: 'white',
                  '&:hover': { color: '#ffcdd2' }
                }
              }}
            />
          )}

          {/* Список авторов */}
          <Card
            sx={{
              bgcolor: '#F5F5F6',
              borderRadius: '16px',
              boxShadow: '0 4px 32px rgba(0,34,102,0.15)',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ color: '#1b4596', fontWeight: 600, mb: 2 }}>
                Авторы для экспертной проверки ({filteredAuthors.length})
              </Typography>

              <Box
                sx={{
                  maxHeight: 500,
                  overflowY: 'auto',
                  pr: 2,
                  '&::-webkit-scrollbar': { width: 6 },
                  '&::-webkit-scrollbar-thumb': { 
                    backgroundColor: '#1b4596', 
                    borderRadius: 8 
                  },
                  '&::-webkit-scrollbar-track': { 
                    backgroundColor: 'transparent' 
                  },
                }}
              >
                {filteredAuthors.length === 0 ? (
                  <Typography sx={{ py: 3, color: '#656565', textAlign: 'center' }}>
                    {authors.length === 0
                      ? 'Список авторов загружается...'
                      : 'Среди загруженных авторов нет совпадений с экспертами. Проверьте доступность API.'}
                  </Typography>
                ) : (
                <Stack spacing={1}>
                  {filteredAuthors.map((author) => (
                    <Box
                      key={author}
                      onClick={() => handleAuthorClick(author)}
                      sx={{
                        p: 2,
                        borderRadius: '12px',
                        cursor: 'pointer',
                        bgcolor: selectedAuthor === author ? '#1b4596' : 'white',
                        color: selectedAuthor === author ? 'white' : '#1b4596',
                        border: '1px solid',
                        borderColor: selectedAuthor === author ? '#1b4596' : '#e0e0e0',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: selectedAuthor === author ? '#153d7a' : '#e3f2fd',
                          borderColor: '#1b4596',
                        },
                      }}
                    >
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar 
                          sx={{ 
                            bgcolor: selectedAuthor === author ? 'white' : '#1b4596',
                            color: selectedAuthor === author ? '#1b4596' : 'white',
                            width: 32,
                            height: 32,
                            fontSize: '14px',
                          }}
                        >
                          {author.charAt(0)}
                        </Avatar>
                        <Typography sx={{ fontWeight: 500 }}>
                          {author}
                        </Typography>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Подсказка */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              bgcolor: '#e8f0fe', 
              borderRadius: '12px',
              border: '1px solid #1b4596'
            }}
          >
            <Typography variant="body2" sx={{ color: '#1b4596' }}>
              <strong>ℹ️ Экспертная проверка</strong> - вы сможете проанализировать 
              все графики эволюции интересов для выбранного автора и верифицировать 
              присвоенные термины на каждом уровне иерархии.
            </Typography>
          </Paper>
        </Stack>
      </main>
    </>
  );
};

export const getServerSideProps = wrapper.getServerSideProps((store) => async () => {
  // @ts-expect-error RTK Query initiate
  await store.dispatch(getAuthors.initiate());
  const authorsResponse = getAuthors.select()(store.getState());
  // @ts-expect-error RTK Query getRunningQueriesThunk
  await Promise.all(store.dispatch(apiV1GetRunningQueriesThunk()));
  return {
    props: {
      authorsResponse: authorsResponse ?? { data: [], isLoading: false, isError: false },
    },
  };
});

export default ExpertCheckSelectPage;