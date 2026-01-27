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
import { useExtractPdfTextMutation } from "@/src/store/api/serverApi";

const UploadPublicationContent: FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfText, setPdfText] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [step, setStep] = useState<'upload' | 'result'>('upload');


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
      const response = await extractPdfText(selectedFile).unwrap();
      setPdfText(response.text);
      setStep('result');
    } catch (e) {
      console.error(e);
      setUploadError('Ошибка анализа файла');
    }
  };


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

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
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
              <Typography variant="h4" component="h1" gutterBottom>
                Результаты анализа
              </Typography>

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

              <Button
                sx={{ mt: 3 }}
                onClick={handleClearFile}
              >
                Загрузить другой файл
              </Button>
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
