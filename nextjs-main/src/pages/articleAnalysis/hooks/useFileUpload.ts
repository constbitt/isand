import { useState, useRef } from 'react';

export const useFileUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfText, setPdfText] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
  };

  return {
    selectedFile,
    pdfUrl,
    pdfText,
    isDragOver,
    uploadError,
    fileInputRef,
    handleFile,
    handleFileUpload,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleClearFile,
    setUploadError,
    setPdfText,
  };
};