import { FC, useState } from 'react';
import { Box, Container, Typography, Button, TextField, Paper, Alert, Snackbar } from '@mui/material';
import Head from 'next/head';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ClearIcon from '@mui/icons-material/Clear';

const UploadPublicationContent: FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [authors, setAuthors] = useState('');
  const [annotation, setAnnotation] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      console.log('Загружен файл:', file.name);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
  };

  const handleUpload = () => {
    // Проверка на существующую публикацию
    if (title.trim() === 'ИСАНД' && authors.trim() === 'Новиков Д.А.') {
      setShowError(true);
      return;
    }

    // Здесь будет логика отправки данных на сервер
    console.log('Отправка данных:', {
      title,
      authors,
      annotation,
      file: selectedFile
    });
    
    // Показываем уведомление об успехе
    setShowSuccess(true);
    
    // Очищаем все поля
    setTitle('');
    setAuthors('');
    setAnnotation('');
    setSelectedFile(null);
  };

  const handleCloseSnackbar = (type: 'success' | 'error') => {
    if (type === 'success') {
      setShowSuccess(false);
    } else {
      setShowError(false);
    }
  };

  return (
    <>
      <Head>
        <title>Загрузка публикации</title>
      </Head>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Загрузка публикации
          </Typography>
          
          <Box component="form" sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label="Название публикации"
              variant="outlined"
              margin="normal"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            
            <TextField
              fullWidth
              label="Авторы"
              variant="outlined"
              margin="normal"
              required
              multiline
              rows={2}
              helperText="Введите авторов через запятую (,)"
              value={authors}
              onChange={(e) => setAuthors(e.target.value)}
            />
            
            <TextField
              fullWidth
              label="Аннотация"
              variant="outlined"
              margin="normal"
              multiline
              rows={4}
              value={annotation}
              onChange={(e) => setAnnotation(e.target.value)}
            />

            <Box sx={{ mt: 2, mb: 2 }}>
              <Button
                variant="contained"
                component="label"
                startIcon={<AttachFileIcon />}
                sx={{
                  backgroundColor: '#1B4596',
                  '&:hover': {
                    backgroundColor: '#1B4596',
                    opacity: 0.9
                  },
                  textTransform: 'none',
                  fontSize: '16px'
                }}
              >
                Выбрать файл
                <input
                  type="file"
                  hidden
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileUpload}
                />
              </Button>

              {selectedFile && (
                <Alert 
                  severity="info" 
                  sx={{ 
                    mt: 2,
                    display: 'flex',
                    alignItems: 'center',
                    '& .MuiAlert-message': {
                      flex: 1
                    }
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
                  <Typography variant="body2">
                    Выбранный файл: {selectedFile.name}
                    <br />
                    Размер: {(selectedFile.size / 1024 / 1024).toFixed(2)} МБ
                  </Typography>
                </Alert>
              )}
            </Box>

            <Button
              fullWidth
              variant="contained"
              component="label"
              disabled={!selectedFile || !title || !authors}
              onClick={handleUpload}
              sx={{
                mt: 3,
                backgroundColor: '#1B4596',
                '&:hover': {
                  backgroundColor: '#1B4596',
                  opacity: 0.9
                },
                textTransform: 'none',
                fontSize: '16px'
              }}
            >
              Загрузить публикацию
            </Button>
          </Box>
        </Paper>
      </Container>

      <Snackbar
        open={showSuccess}
        autoHideDuration={4000}
        onClose={() => handleCloseSnackbar('success')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => handleCloseSnackbar('success')} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          Публикация успешно загружена!
        </Alert>
      </Snackbar>

      <Snackbar
        open={showError}
        autoHideDuration={4000}
        onClose={() => handleCloseSnackbar('error')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => handleCloseSnackbar('error')} 
          severity="error" 
          sx={{ width: '100%' }}
        >
          Такая публикация уже существует в системе
        </Alert>
      </Snackbar>
    </>
  );
};

const UploadPublicationPage: FC = () => {
  return <UploadPublicationContent />;
};

export default UploadPublicationPage; 