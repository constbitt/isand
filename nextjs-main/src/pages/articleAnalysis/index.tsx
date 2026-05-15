import { FC, useState } from 'react';
import { Container, Paper } from '@mui/material';
import Head from 'next/head';
import { useExtractPdfTextMutation, useGetPublicationTermsQuery, useGetPublicationCategoriesQuery, useGetSimilarPublicationsQuery, useGetPublicationAuthorsQuery, useGetPublicationInfoQuery } from "@/src/store/api/serverApi";
import { useFileUpload } from './hooks/useFileUpload';
import { UploadArea } from './components/UploadArea';
import { AnalysisResult } from './components/AnalysisResult';

const UploadPublicationContent: FC = () => {
  const [step, setStep] = useState<'upload' | 'result'>('upload');
  
  const {
    selectedFile,
    pdfUrl,
    uploadError,
    isDragOver,
    fileInputRef,
    handleFile,
    handleFileUpload,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleClearFile,
    setUploadError
  } = useFileUpload();

  const [extractPdfText, { isLoading }] = useExtractPdfTextMutation();
  const { data: terms = [] } = useGetPublicationTermsQuery({ publicationId: 22390 });
  const { data: categories = [] } = useGetPublicationCategoriesQuery({ publicationId: 22390 });
  const { data: similarPublications = [] } = useGetSimilarPublicationsQuery({ publicationId: 22390 });
  const { data: authors = [] } = useGetPublicationAuthorsQuery({ publicationId: 22390 });
  const { data: publicationInfo } = useGetPublicationInfoQuery({ publicationId: 22390 });

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

  return (
    <>
      <Head>
        <title>Загрузка публикации</title>
      </Head>

      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          {step === 'upload' && (
            <UploadArea
              selectedFile={selectedFile}
              uploadError={uploadError}
              isDragOver={isDragOver}
              isLoading={isLoading}
              fileInputRef={fileInputRef}
              onFileUpload={handleFileUpload}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onStartAnalysis={handleStartAnalysis}
            />
          )}

          {step === 'result' && (
            <AnalysisResult
              publicationInfo={publicationInfo}
              authors={authors}
              terms={terms}
              categories={categories}
              similarPublications={similarPublications}
              selectedFile={selectedFile}
              pdfUrl={pdfUrl}
              onClearFile={handleClearFile}
            />
          )}

          {selectedFile && step === 'upload' && (
            <UploadArea.FileInfo
              selectedFile={selectedFile}
              onClearFile={handleClearFile}
            />
          )}

          {pdfUrl && step === 'result' && (
            <UploadArea.PdfViewer pdfUrl={pdfUrl} />
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