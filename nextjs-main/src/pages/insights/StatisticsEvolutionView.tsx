// Шесть графиков эволюции (как на вкладке «Эволюция») + PDF — только контент под тремя кнопками insights/one
import React, { useState, useRef, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  CircularProgress,
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
import {
  useAllAnalysisData,
  type AnalysisEntityType,
} from '@/src/hooks/useAllAnalysisData';

type AnalysisMode =
  | 'factors_terms'
  | 'subfactors_terms'
  | 'terms_occurrences'
  | 'factors_publs'
  | 'subfactors_publs'
  | 'unique_terms_publs';

interface TopicYearData {
  year: number;
  topics: { [topic: string]: number };
  terms: { [topic: string]: number };
  publicationCounts?: { [topic: string]: number };
  totalPublications?: number;
}

const CHART_MODES: { id: AnalysisMode; title: string; description: string }[] = [
  {
    id: 'factors_terms',
    title: 'Факторы (вхождения)',
    description:
      'Общее количество вхождений факторов в публикациях по годам (Динамика употребления факторов)',
  },
  {
    id: 'subfactors_terms',
    title: 'Подфакторы (вхождения)',
    description:
      'Общее количество вхождений подфакторов в публикациях по годам (Динамика употребления подфакторов)',
  },
  {
    id: 'terms_occurrences',
    title: 'Термины (вхождения)',
    description:
      'Общее количество вхождений терминов в публикациях по годам (Динамика употребления терминов)',
  },
  {
    id: 'factors_publs',
    title: 'Факторы (публикации)',
    description:
      'Количество публикаций, содержащих доминирующий фактор, по годам (Публикационная активность по факторам)',
  },
  {
    id: 'subfactors_publs',
    title: 'Подфакторы (публикации)',
    description:
      'Количество публикаций, содержащих доминирующий подфактор, по годам (Публикационная активность по подфакторам)',
  },
  {
    id: 'unique_terms_publs',
    title: 'Термины (публикации)',
    description:
      'Количество публикаций, содержащих доминирующий термин, по годам (Публикационная активность по терминам)',
  },
];

const COLORS = ['#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6'];

const ENTITY_LABEL: Record<AnalysisEntityType, string> = {
  authors: 'Автор',
  journals: 'Журнал',
  conferences: 'Конференция',
  organizations: 'Организация',
  cities: 'Город',
};

const CHART_PAGE_DESCRIPTIONS: string[] = [
  'Данный график показывает количество вхождений топ-5 частоиспользуемых факторов в публикациях, связанных с сущностью, по годам. Сначала выделяется топ-5 используемых факторов за весь анализируемый период и далее отображаются вхождения по каждому году.\n.................................................................',
  'Данный график показывает количество вхождений топ-5 подфакторов в публикациях, связанных с сущностью, по годам.\n.................................................................',
  'Данный график показывает количество вхождений топ-5 терминов в публикациях, связанных с сущностью, по годам.\n.................................................................',
  'Данный график показывает долю публикаций по годам, в которых каждый из топ-5 факторов является доминирующим.\n.................................................................',
  'Данный график показывает долю публикаций по годам, в которых каждый из топ-5 подфакторов является доминирующим.\n.................................................................',
  'Данный график показывает количество публикаций по годам, в которых встречается каждый из топ-5 терминов (по факту наличия в публикации).\n.................................................................',
];

export interface StatisticsEvolutionViewProps {
  entityId: string;
  entityType: AnalysisEntityType;
  entityName: string;
}

export const StatisticsEvolutionView: React.FC<StatisticsEvolutionViewProps> = ({
  entityId,
  entityType,
  entityName,
}) => {
  const { data, loading, error, progress } = useAllAnalysisData(entityId, entityType);
  const chartAndTableRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [pdfDownloadHover, setPdfDownloadHover] = useState(false);

  const entityTypeLabel = ENTITY_LABEL[entityType];
  const displayName = entityName || `${entityTypeLabel} (id ${entityId || '—'})`;

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
    if (!modeData?.chartData?.length || !modeData.topTopics?.length) {
      return { topics: [] as string[], yearRows: [] as { year: number; values: number[] }[] };
    }
    const years = modeData.chartData.map((d) => d.year);
    const topics = modeData.topTopics;
    const yearRows = years.map((year) => {
      const d = modeData.chartData.find((x) => x.year === year)!;
      return {
        year,
        values: topics.map((topic) => d.topics[topic] ?? d.terms[topic] ?? 0),
      };
    });
    return { topics, yearRows };
  };

  const publicationCount = data.factors_terms?.publicationCount ?? 0;

  const createTitlePageElement = useCallback(() => {
    const div = document.createElement('div');
    div.style.cssText =
      'position:absolute;left:-9999px;top:0;width:210mm;padding:48px;background:#fff;font-family:Arial,sans-serif;';
    const safe = (s: string) =>
      s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    div.innerHTML = `
      <div style="text-align:center;font-size:32px;font-weight:bold;margin-bottom:24px;">Отчёт по эволюции тематик</div>
      <div style="text-align:center;font-size:22px;margin-bottom:20px;">${entityTypeLabel}: ${safe(displayName)}</div>
      <div style="text-align:center;font-size:16px;margin-bottom:28px;">Всего проанализировано публикаций: ${publicationCount}</div>
      <div style="font-size:16px;font-weight:600;margin-bottom:10px;">Графики в отчёте:</div>
      ${CHART_MODES.map(
        (m, i) =>
          `<div style="font-size:15px;margin-left:12px;margin-bottom:5px;">${i + 1}. ${safe(m.title)}</div>`
      ).join('')}
    `;
    document.body.appendChild(div);
    return div;
  }, [displayName, entityTypeLabel, publicationCount]);

  const handleDownloadPdf = useCallback(async () => {
    if (!entityId || publicationCount === 0) return;
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

      const titleEl = createTitlePageElement();
      const titleCanvas = await html2canvas(titleEl, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
      });
      document.body.removeChild(titleEl);
      const titleImg = titleCanvas.toDataURL('image/png');
      const titleH = (titleCanvas.height * (pageWidth - margin * 2)) / titleCanvas.width;
      pdf.addImage(
        titleImg,
        'PNG',
        margin,
        margin,
        pageWidth - margin * 2,
        Math.min(titleH, pageHeight - margin * 2)
      );
      pdf.addPage();

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

      const fileBase = displayName.replace(/[/\\?%*:|"<>]/g, '_').replace(/\s+/g, '_') || 'report';
      pdf.save(`Statistics_${fileBase}.pdf`);
    } catch (err) {
      console.error('Ошибка генерации PDF:', err);
    } finally {
      setPdfGenerating(false);
    }
  }, [entityId, publicationCount, createTitlePageElement, displayName]);

  if (!entityId) {
    return null;
  }

  const pdfDisabled = loading || pdfGenerating || publicationCount === 0;
  const pdfButtonBg = pdfDisabled
    ? 'rgba(27, 69, 150, 0.5)'
    : pdfDownloadHover
      ? '#153a7d'
      : '#1b4596';

  return (
    <Stack spacing={3} sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={pdfDisabled}
          onMouseEnter={() => setPdfDownloadHover(true)}
          onMouseLeave={() => setPdfDownloadHover(false)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            backgroundColor: pdfButtonBg,
            color: '#ffffff',
            border: '2px solid #0f2f66',
            borderRadius: 12,
            padding: '10px 22px',
            fontSize: '0.95rem',
            fontWeight: 600,
            fontFamily: 'inherit',
            lineHeight: 1.2,
            cursor: pdfDisabled ? 'not-allowed' : 'pointer',
            boxShadow: pdfDisabled
              ? 'none'
              : '0 2px 10px rgba(27, 69, 150, 0.45)',
            WebkitFontSmoothing: 'antialiased',
          }}
        >
          <DownloadIcon
            style={{
              color: '#ffffff',
              width: 22,
              height: 22,
              flexShrink: 0,
            }}
            aria-hidden
          />
          {pdfGenerating ? 'Генерация PDF...' : 'Скачать PDF'}
        </button>
        {!loading && publicationCount > 0 && (
          <Typography
            variant="body2"
            sx={{ color: '#1b4596', fontWeight: 500 }}
          >
            Проанализировано публикаций: {publicationCount}
          </Typography>
        )}
        {loading && (
          <Typography
            variant="body2"
            sx={{ color: '#1b4596', fontWeight: 500 }}
          >
            Загрузка: {progress}%
          </Typography>
        )}
      </Box>

      {loading ? (
        <Card
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            borderRadius: '16px',
            boxShadow: '0 4px 32px rgba(0,34,102,0.15)',
          }}
        >
          <CircularProgress />
          <Typography>Загрузка данных по всем режимам... {progress}%</Typography>
        </Card>
      ) : error ? (
        <Card sx={{ p: 4, borderRadius: '16px' }}>
          <Typography color="error">{error}</Typography>
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
                  ref={(el) => {
                    chartAndTableRefs.current[idx] = el as HTMLDivElement | null;
                  }}
                  sx={{ bgcolor: '#fff' }}
                >
                  <Typography variant="h6" sx={{ color: '#1b4596', fontWeight: 600, mb: 1 }}>
                    {idx + 1}. {modeConfig.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#656565', mb: 2, fontSize: '13px' }}>
                    {modeConfig.description}
                  </Typography>

                  <Box sx={{ width: '100%', height: 400, position: 'relative' }}>
                    {hasData ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            {displayTopics.map((topic, i) => (
                              <linearGradient
                                key={topic}
                                id={`st-ev-${modeConfig.id}-${i}`}
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="5%"
                                  stopColor={COLORS[i % COLORS.length]}
                                  stopOpacity={0.8}
                                />
                                <stop
                                  offset="95%"
                                  stopColor={COLORS[i % COLORS.length]}
                                  stopOpacity={0.1}
                                />
                              </linearGradient>
                            ))}
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                          <XAxis
                            dataKey="year"
                            stroke="#1b4596"
                            tick={{ fill: '#1b4596', fontWeight: 600 }}
                            style={{ fontSize: '14px' }}
                          />
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
                              fillOpacity={0.9}
                              fill={`url(#st-ev-${modeConfig.id}-${i})`}
                              stackId="1"
                              name={topic}
                            />
                          ))}
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        height="100%"
                      >
                        <Typography color="text.secondary">Нет данных для отображения</Typography>
                      </Box>
                    )}
                  </Box>

                  {hasData &&
                    (() => {
                      const { topics, yearRows } = getTableDataForMode(modeConfig.id);
                      return (
                        <Box sx={{ mt: 2, overflowX: 'auto' }}>
                          <Typography
                            variant="subtitle2"
                            sx={{ mb: 1, fontWeight: 600, fontSize: '12px' }}
                          >
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
                                  <TableCell
                                    key={topic}
                                    align="right"
                                    sx={{ fontSize: '9px', maxWidth: 56 }}
                                  >
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
  );
};
