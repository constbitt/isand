import { FC, useState, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Alert
} from '@mui/material';
import Head from 'next/head';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ClearIcon from '@mui/icons-material/Clear';
import DownloadIcon from '@mui/icons-material/Download';
import { useExtractPdfTextMutation } from "@/src/store/api/serverApi";

const UploadPublicationContent: FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfText, setPdfText] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [step, setStep] = useState<'upload' | 'result'>('upload');
  const [visiblePublications, setVisiblePublications] = useState(3);

  const [extractPdfText, { isLoading }] = useExtractPdfTextMutation();

  const handleFile = (file: File) => {
    if (file.type !== 'application/pdf') {
      setUploadError('Пожалуйста, выберите PDF-файл');
      return;
    }

    setUploadError(null);
    setSelectedFile(file);

    const url = URL.createObjectURL(file);
    setPdfUrl(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setPdfText(null);
    setUploadError(null);

    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setStep('upload');
  };

  const handleStartAnalysis = async () => {
    if (!selectedFile) {
      setUploadError('Сначала выберите файл');
      return;
    }

    setUploadError(null);

    try {
      // пока запрос терминов не работает
      //const response = await extractPdfText(selectedFile).unwrap();
      //setPdfText(response.text);
      setStep('result');
    } catch (e) {
      console.error(e);
      setUploadError('Ошибка анализа файла');
    }
  };

  const handleDownloadReport = () => {
    if (selectedFile) {
      const link = document.createElement('a');
      link.href = pdfUrl || URL.createObjectURL(selectedFile);
      link.download = `report_${selectedFile.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const reportContent = generateMockReport();
      const blob = new Blob([reportContent], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'analysis_report.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleShowMore = () => {
    setVisiblePublications(prev => prev + 3);
  };

  const generateMockReport = () => {
    const report = `
      ОТЧЕТ ОБ АНАЛИЗЕ ПУБЛИКАЦИИ
      
      Извлеченные термины:
      ${mockTerms.map(t => `- ${t.term} (частота: ${t.freq})`).join('\n')}
      
      Распределение по категориям:
      ${mockCategories.map(c => `- ${c.name}: ${c.value}%`).join('\n')}
      
      Похожие публикации:
      ${mockSimilarPublications.map(p => `- ${p.title} (${p.authors}, ${p.year}) - сходство: ${p.similarity * 100}%`).join('\n')}
    `;
    return report;
  };

  const mockTerms = [
    { term: 'machine learning', freq: 42 },
    { term: 'neural network', freq: 35 },
    { term: 'named entity recognition', freq: 27 },
    { term: 'term extraction', freq: 22 },
    { term: 'language model', freq: 18 },
  ];

  const mockCategories = [
    { name: 'ML / AI', value: 55 },
    { name: 'NLP', value: 30 },
    { name: 'Statistics', value: 15 },
  ];

  const mockSimilarPublications = [
    {
      title: 'Automatic Term Extraction Using Neural Language Models',
      authors: 'Zhang et al.',
      year: 2023,
      similarity: 0.87,
      reason: 'Совпадение ключевых терминов и контекстных представлений'
    },
    {
      title: 'A Survey on Keyword and Term Extraction Methods',
      authors: 'Kumar, Singh',
      year: 2022,
      similarity: 0.81,
      reason: 'Общий предмет исследования и пересекающиеся категории'
    },
    {
      title: 'LLM-based Approaches for Scientific Text Mining',
      authors: 'Fernandez et al.',
      year: 2024,
      similarity: 0.76,
      reason: 'Использование LLM и методы обработки научных текстов'
    },
    {
      title: 'Deep Learning for Scientific Document Analysis',
      authors: 'Chen et al.',
      year: 2023,
      similarity: 0.72,
      reason: 'Применение глубокого обучения для анализа научных документов'
    },
    {
      title: 'Knowledge Graph Construction from Research Papers',
      authors: 'Wilson, Brown',
      year: 2022,
      similarity: 0.68,
      reason: 'Построение графов знаний на основе научных публикаций'
    },
    {
      title: 'Automated Taxonomy Generation in Scientific Domains',
      authors: 'Martinez et al.',
      year: 2023,
      similarity: 0.65,
      reason: 'Автоматическая генерация таксономий в научных областях'
    },
    {
      title: 'Cross-Domain Term Alignment Methods',
      authors: 'Thompson, Lee',
      year: 2021,
      similarity: 0.59,
      reason: 'Методы выравнивания терминов между различными доменами'
    },
    {
      title: 'Semantic Similarity in Scientific Literature',
      authors: 'Garcia et al.',
      year: 2022,
      similarity: 0.54,
      reason: 'Оценка семантической близости в научной литературе'
    },
    {
      title: 'Topic Modeling for Research Trend Analysis',
      authors: 'Patel, Kumar',
      year: 2023,
      similarity: 0.48,
      reason: 'Тематическое моделирование для анализа трендов исследований'
    }
  ];

  return (
    <>
      <Head>
        <title>Загрузка публикации</title>
      </Head>

      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          {step === 'upload' && (
            <>
              <Typography variant="h4" component="h1" gutterBottom>
                Загрузка публикации
              </Typography>
              <Box
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                sx={{
                  mt: 3,
                  height: 220,
                  border: '2px dashed',
                  borderColor: isDragOver ? '#1B4596' : '#ccc',
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  cursor: 'pointer',
                  backgroundColor: isDragOver
                    ? 'rgba(27,69,150,0.05)'
                    : 'transparent',
                  transition: '0.2s ease',
                  '&:hover': {
                    borderColor: '#1B4596',
                    backgroundColor: 'rgba(27,69,150,0.05)',
                  }
                }}
                
              >
              <input
                ref={fileInputRef}
                type="file"
                hidden
                accept="application/pdf"
                onChange={handleFileUpload}
              />
              <Box
                component="img"
                src={
                  uploadError
                    ? "/images/common/file-error.svg"
                    : selectedFile
                      ? "/images/common/file.svg"
                      : "/images/common/upload.svg"
                }
                alt="Upload"
                sx={{
                  width: 64,
                  height: 64,
                  opacity: 0.9
                }}
              />

              <Typography
                sx={{
                  color: uploadError
                    ? 'error.main'
                    : selectedFile
                      ? '#1B4596'
                      : 'text.secondary',
                  fontWeight: 500,
                }}
              >
                {uploadError
                  ? 'Ошибка загрузки публикации, попробуйте ещё раз!'
                  : selectedFile
                    ? 'Файл загружен! Выберите другой или начните анализ'
                    : 'Нажмите или перетащите файл сюда'}
              </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
            <Button
              variant="contained"
              component="label"
              sx={{
                backgroundColor: '#1B4596',
                '&:hover': { backgroundColor: '#1B4596', opacity: 0.9 },
                textTransform: 'none',
                fontSize: '16px'
              }}
              disabled={!selectedFile || isLoading}
              onClick={handleStartAnalysis}
            >
              {isLoading ? 'Анализ...' : 'Начать анализ'}
            </Button>
          </Box>

            </>
          )}

          {step === 'result' && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" component="h1">
                  Результаты анализа
                </Typography>
              </Box>

              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Извлечённые термины
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {mockTerms.map((t) => (
                    <Paper
                      key={t.term}
                      sx={{
                        px: 2,
                        py: 1,
                        display: 'flex',
                        gap: 1,
                        alignItems: 'center'
                      }}
                    >
                      <Typography fontWeight={500}>
                        {t.term}
                      </Typography>
                      <Typography color="text.secondary">
                        {t.freq}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              </Box>

              <Box sx={{ mt: 5 }}>
                <Typography variant="h6" gutterBottom>
                  Распределение терминов по категориям
                </Typography>

                {mockCategories.map((c) => (
                  <Box key={c.name} sx={{ mb: 2 }}>
                    <Typography>
                      {c.name} — {c.value}%
                    </Typography>
                    <Box
                      sx={{
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: '#E0E0E0',
                        overflow: 'hidden'
                      }}
                    >
                      <Box
                        sx={{
                          height: '100%',
                          width: `${c.value}%`,
                          backgroundColor: '#1B4596'
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>

              <Box sx={{ mt: 6 }}>
                <Typography variant="h6" gutterBottom>
                  Похожие публикации
                </Typography>

                {mockSimilarPublications.slice(0, visiblePublications).map((pub) => (
                  <Paper
                    key={pub.title}
                    variant="outlined"
                    sx={{ p: 2, mb: 2 }}
                  >
                    <Typography fontWeight={600}>
                      {pub.title}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      {pub.authors}, {pub.year}
                    </Typography>

                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {pub.reason}
                    </Typography>

                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption">
                        Similarity score
                      </Typography>
                      <Box
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: '#E0E0E0',
                          overflow: 'hidden'
                        }}
                      >
                        <Box
                          sx={{
                            height: '100%',
                            width: `${pub.similarity * 100}%`,
                            backgroundColor: '#1B4596'
                          }}
                        />
                      </Box>
                    </Box>
                  </Paper>
                ))}

                {visiblePublications < mockSimilarPublications.length && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={handleShowMore}
                      sx={{
                        borderColor: '#1B4596',
                        color: '#1B4596',
                        textTransform: 'none',
                        fontSize: '16px',
                        '&:hover': {
                          borderColor: '#1B4596',
                          backgroundColor: 'rgba(27,69,150,0.05)',
                        }
                      }}
                    >
                      Показать еще
                    </Button>
                  </Box>
                )}
              </Box>

              <Paper
                variant="outlined"
                sx={{
                  mt: 3,
                  p: 3,
                  maxHeight: 500,
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'monospace'
                }}
              >
                {pdfText}
              </Paper>

              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={handleClearFile}
                >
                  Загрузить другой файл
                </Button>
                <Button
                  variant="contained"
                  component="label"
                  sx={{
                    backgroundColor: '#1B4596',
                    '&:hover': { backgroundColor: '#1B4596', opacity: 0.9 },
                    textTransform: 'none',
                    fontSize: '16px'
                  }}
                  onClick={handleDownloadReport}
                >
                  Загрузить отчет
                </Button>
              </Box>
            </>
          )}

          {selectedFile && (
            <Alert
              severity="info"
              sx={{
                mt: 3,
                display: 'flex',
                alignItems: 'center',
                '& .MuiAlert-message': { flex: 1 }
              }}
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={handleClearFile}
                  startIcon={<ClearIcon />}
                >
                  Удалить
                </Button>
              }
            >
              {selectedFile.name} (
              {(selectedFile.size / 1024 / 1024).toFixed(2)} МБ)
            </Alert>
          )}

          {pdfUrl && (
            <Box sx={{ mt: 4 }}>
              <iframe
                src={pdfUrl}
                width="100%"
                height="600px"
                style={{ border: '1px solid #ccc' }}
              />
            </Box>
          )}
        </Paper>
      </Container>
    </>
  );
};

const UploadPublicationPage: FC = () => {
  return <UploadPublicationContent />;
};

export default UploadPublicationPage;