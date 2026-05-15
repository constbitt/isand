import { FC, RefObject } from 'react';
import { Box, Typography, Button } from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';

interface UploadAreaProps {
  selectedFile: File | null;
  uploadError: string | null;
  isDragOver: boolean;
  isLoading: boolean;
  fileInputRef: RefObject<HTMLInputElement>;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onStartAnalysis: () => void;
}

export const UploadArea: FC<UploadAreaProps> & {
  FileInfo: FC<{ selectedFile: File; onClearFile: () => void }>;
  PdfViewer: FC<{ pdfUrl: string }>;
} = ({
  selectedFile,
  uploadError,
  isDragOver,
  isLoading,
  fileInputRef,
  onFileUpload,
  onDragOver,
  onDragLeave,
  onDrop,
  onStartAnalysis,
}) => {
  return (
    <>
      <Typography variant="h4" component="h1" gutterBottom>
        Загрузка публикации
      </Typography>
      
      <Box
        onClick={() => fileInputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
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
          onChange={onFileUpload}
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
          onClick={onStartAnalysis}
        >
          {isLoading ? 'Анализ...' : 'Начать анализ'}
        </Button>
      </Box>
    </>
  );
};

UploadArea.FileInfo = ({ selectedFile, onClearFile }) => {
  return (
    <Box
      sx={{
        mt: 3,
        p: 2,
        bgcolor: '#e3f2fd',
        borderRadius: 1,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AttachFileIcon sx={{ color: '#1B4596' }} />
        <Typography>
          {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} МБ)
        </Typography>
      </Box>
      <Button size="small" onClick={onClearFile} color="error">
        Удалить
      </Button>
    </Box>
  );
};

UploadArea.PdfViewer = ({ pdfUrl }) => {
  return (
    <Box sx={{ mt: 4 }}>
      <iframe
        src={pdfUrl}
        width="100%"
        height="600px"
        style={{ border: '1px solid #ccc' }}
        title="PDF Preview"
      />
    </Box>
  );
};