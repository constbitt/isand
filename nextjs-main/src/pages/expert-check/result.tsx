// pages/expert-check/result.tsx
import React, { useState, useRef, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  CircularProgress,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import DownloadIcon from '@mui/icons-material/Download';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAllAnalysisData } from '@/src/hooks/useAllAnalysisData';

type AnalysisMode = 'factors_terms' | 'subfactors_terms' | 'terms_occurrences' | 'factors_publs' | 'subfactors_publs' | 'unique_terms_publs';

interface TopicYearData {
  year: number;
  topics: { [topic: string]: number };
  terms: { [topic: string]: number };
  publicationCounts?: { [topic: string]: number };
  totalPublications?: number;
}

const CHART_MODES: { id: AnalysisMode; title: string; description: string }[] = [
  { id: 'factors_terms', title: 'Факторы (вхождения)', description: 'Общее количество вхождений факторов в публикациях по годам (Динамика употребления факторов)' },
  { id: 'subfactors_terms', title: 'Подфакторы (вхождения)', description: 'Общее количество вхождений подфакторов в публикациях по годам (Динамика употребления подфакторов)' },
  { id: 'terms_occurrences', title: 'Термины (вхождения)', description: 'Общее количество вхождений терминов в публикациях по годам (Динамика употребления терминов)' },
  { id: 'factors_publs', title: 'Факторы (публикации)', description: 'Количество публикаций, содержащих доминирующий фактор, по годам (Публикационная активность по факторам)' },
  { id: 'subfactors_publs', title: 'Подфакторы (публикации)', description: 'Количество публикаций, содержащих доминирующий подфактор, по годам (Публикационная активность по подфакторам)' },
  { id: 'unique_terms_publs', title: 'Термины (публикации)', description: 'Количество публикаций, содержащих доминирующий термин, по годам (Публикационная активность по терминам)' },
];

const COLORS = ['#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6'];

// Текстовые описания для каждой из 6 страниц отчёта 
const CHART_PAGE_DESCRIPTIONS: string[] = [
  'Данный график показывает количество вхождений топ-5 частоиспользуемых факторов в публикациях автора по годам. Сначала выделяется топ-5 используемых факторов за весь период научной деятельности и далее происходит рендеринг вхождений выбранных факторов в публикации по каждому году.\n.................................................................',
  'Данный график показывает количество вхождений топ-5 частоиспользуемых подфакторов в публикациях автора по годам. Сначала выделяется топ-5 используемых подфакторов за весь период научной деятельности и далее происходит рендеринг вхождений выбранных подфакторов в публикации по каждому году.\n.................................................................',
  'Данный график показывает количество вхождений топ-5 частоиспользуемых факторов в публикациях автора по годам. Сначала выделяется топ-5 используемых терминов за весь период научной деятельности и далее происходит рендеринг вхождений выбранных терминов в публикации по каждому году.\n.................................................................',
  'Данный график показывает долю публикаций автора по годам, в которых каждый из топ-5 факторов является доминирующим. Для каждой публикации определяются факторы с максимальным значением среди всех факторов в этой публикации. Затем считается количество публикаций за год, где фактор попал в число доминирующих, и отображается в процентах от общего числа публикаций за этот год.\n.................................................................',
  'Данный график показывает долю публикаций автора по годам, в которых каждый из топ-5 подфакторов является доминирующим. Для каждой публикации определяются подфакторы с максимальным значением среди всех подфакторов в этой публикации. Затем считается количество публикаций за год, где подфактор попал в число доминирующих, и отображается в процентах от общего числа публикаций за этот год.\n.................................................................',
  'Данный график показывает количество публикаций автора по годам, в которых встречается каждый из топ-5 терминов. В отличие от режима «Термины (вхождения)», здесь учитывается не общее количество употреблений термина, а сам факт его наличия в публикации — каждая публикация считается только один раз для каждого термина, независимо от того, сколько раз этот термин в ней упоминается.\n.................................................................',
];

const ExpertCheckResultPage: React.FC = () => {
  const router = useRouter();
  const { ids, name } = router.query;
  const authorId = Array.isArray(ids) ? ids[0] : ids || '';
  const authorName = decodeURIComponent((Array.isArray(name) ? name[0] : name) || '');

  const { data, loading, error, progress } = useAllAnalysisData(authorId);
  const chartRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tableRefs = useRef<(HTMLDivElement | null)[]>([]);
  const chartAndTableRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  const getChartDataForMode = (mode: AnalysisMode) => {
    const modeData = data[mode];
    if (!modeData?.chartData?.length || !modeData.topTopics?.length) return [];
    const displayTopics = modeData.topTopics;
    return modeData.chartData.map((item: TopicYearData) => {
      const flatData: Record<string, unknown> = { year: item.year };
      displayTopics.forEach((topic: string) => {
        flatData[`topics.${topic}`] = item.topics[topic] || 0;
        if (mode === 'factors_publs' || mode === 'subfactors_publs') {
          flatData[`counts.${topic}`] = item.publicationCounts?.[topic] || 0;
        }
      });
      if (mode === 'factors_publs' || mode === 'subfactors_publs') {
        flatData.totalPublications = item.totalPublications || 0;
      }
      return flatData;
    });
  };

  const getTableDataForMode = (mode: AnalysisMode) => {
    const modeData = data[mode];
    if (!modeData?.chartData?.length || !modeData.topTopics?.length) return { years: [], topics: [], yearRows: [] };
    const years = modeData.chartData.map((d) => d.year);
    const topics = modeData.topTopics;
    const yearRows = years.map((year) => {
      const d = modeData.chartData.find((x) => x.year === year)!;
      return {
        year,
        values: topics.map((topic) => d.topics[topic] ?? d.terms[topic] ?? 0),
      };
    });
    return { years, topics, yearRows };
  };

  const publicationCount = data.factors_terms?.publicationCount ?? 0;

  const createTitlePageElement = () => {
    const div = document.createElement('div');
    div.style.cssText = 'position:absolute;left:-9999px;top:0;width:210mm;padding:48px;background:#fff;font-family:Arial,sans-serif;';
    div.innerHTML = `
      <div style="text-align:center;font-size:36px;font-weight:bold;margin-bottom:32px;">Отчёт для экспертной проверки</div>
      <div style="text-align:center;font-size:24px;margin-bottom:28px;">Автор: ${authorName}</div>
      <div style="text-align:center;font-size:18px;margin-bottom:32px;">Всего проанализировано публикаций: ${publicationCount}</div>
      <div style="font-size:18px;font-weight:600;margin-bottom:12px;">Графики в отчёте:</div>
      ${CHART_MODES.map((m, i) => `<div style="font-size:16px;margin-left:12px;margin-bottom:6px;">${i + 1}. ${m.title}</div>`).join('')}
    `;
    document.body.appendChild(div);
    return div;
  };

  const handleDownloadPdf = useCallback(async () => {
    if (!authorName || publicationCount === 0) return;
    setPdfGenerating(true);
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
      ]);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;

      // Титульная страница — рендерим как HTML и захватываем (кириллица)
      const titleEl = createTitlePageElement();
      const titleCanvas = await html2canvas(titleEl, { scale: 2, backgroundColor: '#ffffff', logging: false });
      document.body.removeChild(titleEl);
      const titleImg = titleCanvas.toDataURL('image/png');
      const titleH = (titleCanvas.height * (pageWidth - margin * 2)) / titleCanvas.width;
      pdf.addImage(titleImg, 'PNG', margin, margin, pageWidth - margin * 2, Math.min(titleH, pageHeight - margin * 2));
      pdf.addPage();

      // 6 страниц: один скриншот блока «график + таблица» на каждую страницу
      for (let i = 0; i < 6; i++) {
        const blockEl = chartAndTableRefs.current[i];
        if (blockEl) {
          const canvas = await html2canvas(blockEl, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false,
          });
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = pageWidth - margin * 2;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          const h = Math.min(imgHeight, pageHeight - margin * 2);
          pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, h);
        }
        if (i < 5) pdf.addPage();
      }

      pdf.save(`ExpertCheck_${authorName.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('Ошибка генерации PDF:', err);
    } finally {
      setPdfGenerating(false);
    }
  }, [authorName, publicationCount, data]);

  const handleBack = () => router.push('/expert-check');

  if (!authorId) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography>Не указан автор. Вернитесь к выбору.</Typography>
        <Button onClick={handleBack} sx={{ mt: 2 }}>
          Назад
        </Button>
      </Box>
    );
  }

  return (
    <>
      <Head>
        <title>Отчёт экспертной проверки — {authorName || 'Автор'}</title>
      </Head>
      <main className="flex flex-col items-center">
        <Stack spacing={3} sx={{ width: '67.5vw', mt: '32px', mb: '40px' }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              bgcolor: '#1b4596',
              color: 'white',
              borderRadius: '16px',
              boxShadow: '0 4px 32px rgba(0,34,102,0.15)',
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Отчёт для экспертной проверки
                </Typography>
                <Typography variant="body1" sx={{ mt: 1, opacity: 0.95 }}>
                  {authorName || 'Загрузка...'}
                </Typography>
                {publicationCount > 0 && (
                  <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                    Проанализировано публикаций: {publicationCount}
                  </Typography>
                )}
              </Box>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadPdf}
                  disabled={loading || pdfGenerating || publicationCount === 0}
                  sx={{
                    bgcolor: 'white',
                    color: '#1b4596',
                    '&:hover': { bgcolor: '#e3f2fd' },
                  }}
                >
                  {pdfGenerating ? 'Генерация...' : 'Скачать PDF'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={handleBack}
                  sx={{ color: 'white', borderColor: 'white', '&:hover': { borderColor: '#e3f2fd', bgcolor: 'rgba(255,255,255,0.1)' } }}
                >
                  Назад
                </Button>
              </Stack>
            </Stack>
          </Paper>

          {loading ? (
            <Card sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <CircularProgress />
              <Typography>Загрузка данных... {progress}%</Typography>
            </Card>
          ) : error ? (
            <Card sx={{ p: 4 }}>
              <Typography color="error">{error}</Typography>
              <Button onClick={handleBack} sx={{ mt: 2 }}>
                Назад
              </Button>
            </Card>
          ) : (
            CHART_MODES.map((modeConfig, idx) => {
              const modeData = data[modeConfig.id];
              const chartData = getChartDataForMode(modeConfig.id);
              const displayTopics = modeData?.topTopics ?? [];
              const hasData = chartData.length > 0 && displayTopics.length > 0;

              return (
                <Card
                  key={modeConfig.id}
                  sx={{
                    bgcolor: '#FFFFFF',
                    borderRadius: '16px',
                    boxShadow: '0 4px 32px rgba(0,34,102,0.15)',
                    overflow: 'hidden',
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      ref={(el) => { chartAndTableRefs.current[idx] = el as HTMLDivElement | null; }}
                      sx={{ bgcolor: '#fff' }}
                    >
                      <Typography variant="h6" sx={{ color: '#1b4596', fontWeight: 600, mb: 1 }}>
                        {idx + 1}. {modeConfig.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#656565', mb: 2, fontSize: '13px' }}>
                        {modeConfig.description}
                      </Typography>

                    <Box
                      ref={(el) => { chartRefs.current[idx] = el as HTMLDivElement | null; }}
                      sx={{ width: '100%', height: 400, position: 'relative' }}
                    >
                      {hasData ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData}>
                            <defs>
                              {displayTopics.map((topic, i) => (
                                <linearGradient key={topic} id={`color-${idx}-${i}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.8} />
                                  <stop offset="95%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.1} />
                                </linearGradient>
                              ))}
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                            <XAxis dataKey="year" stroke="#1b4596" tick={{ fill: '#1b4596' }} />
                            <YAxis stroke="#656565" tick={false} axisLine={false} />
                            <Tooltip />
                            <Legend />
                            {displayTopics.map((topic, i) => (
                              <Area
                                key={topic}
                                type="monotone"
                                dataKey={`topics.${topic}`}
                                stroke={COLORS[i % COLORS.length]}
                                strokeWidth={2}
                                fill={`url(#color-${idx}-${i})`}
                                stackId="1"
                                name={topic}
                              />
                            ))}
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                          <Typography color="text.secondary">Нет данных для отображения</Typography>
                        </Box>
                      )}
                    </Box>

                    {hasData && (() => {
                      const { years, topics, yearRows } = getTableDataForMode(modeConfig.id);
                      return (
                        <Box sx={{ mt: 2, overflowX: 'auto' }} ref={(el) => { tableRefs.current[idx] = el as HTMLDivElement | null; }}>
                          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, fontSize: '12px' }}>
                            Поясняющая таблица
                          </Typography>
                          <Table
                            size="small"
                            sx={{
                              borderCollapse: 'separate',
                              borderSpacing: 0,
                              '& td, & th': {
                                border: '1px solid #e0e0e0',
                                borderColor: '#e0e0e0',
                                padding: '6px 8px',
                                fontSize: '10px',
                                minWidth: 0,
                                lineHeight: 1.3,
                              },
                            }}
                          >
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600, width: 40 }}>Год</TableCell>
                                {topics.map((topic) => (
                                  <TableCell key={topic} align="right" sx={{ fontSize: '9px', maxWidth: 56 }}>
                                    {topic.length > 16 ? topic.slice(0, 16) + '…' : topic}
                                  </TableCell>
                                ))}
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {yearRows.map((row) => (
                                <TableRow key={row.year}>
                                  <TableCell sx={{ fontWeight: 500 }}>{row.year}</TableCell>
                                  {row.values.map((v, i) => (
                                    <TableCell key={i} align="right">
                                      {v}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Box>
                      );
                    })()}

                      <Typography
                        component="div"
                        sx={{
                          mt: 2,
                          fontSize: '13px',
                          lineHeight: 1.6,
                          color: '#333',
                          whiteSpace: 'pre-line',
                        }}
                      >
                        {CHART_PAGE_DESCRIPTIONS[idx]}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              );
            })
          )}
        </Stack>
      </main>
    </>
  );
};

export default ExpertCheckResultPage;
