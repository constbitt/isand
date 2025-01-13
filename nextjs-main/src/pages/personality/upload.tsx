import { useLazyGetAccountApiIdUploadQuery, usePostAccountApiUploadCorrectPublMutation, usePostAccountApiUploadPublMutation } from "@/src/store/api/serverApiV6";
import { Card, Container, Typography, LinearProgress, Stack, Button } from "@mui/material";
import Head from "next/head";
import React, { useMemo, useRef, useState } from "react";
import PdfIconImg from "@/src/assets/images/upload/pdf_icon.svg"
import Image from "next/image";
import { Author, GrobidPubl } from "@/src/store/types/personalityTypes";
import CheckIcon from '@mui/icons-material/Check';
import SettingTextField from "@/src/components/TextField/SettingTextField";
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import { setAlert } from "@/src/store/slices/alertationSlice";
import { useTypedDispatch } from "@/src/hooks/useTypedDispatch";


interface EditGrobidSegmentsProps {
    grobidSegments: GrobidPubl | null, 
    onClick: () => void, 
    idUpload: number
}

const EditGrobidSegments: React.FC<EditGrobidSegmentsProps> = ({grobidSegments, onClick, idUpload}): React.ReactElement => {
    const dispatch = useTypedDispatch()

    const [title, setTitle] = useState<string>(grobidSegments?.title ?? '')    
    const [year, setYear] = useState<string>(grobidSegments?.year ?? '')   
    const [authors, setAuthors] = useState<Author[]>(grobidSegments?.authors ?? [])

    const [postAccountApiUploadCorrectPubl] = usePostAccountApiUploadCorrectPublMutation();

    const memoizedAuthors = useMemo(() => authors, [authors]);

    const handleAuthorChange = (index: number, field: keyof Author, value: string) => {
        const updatedAuthors = [...authors];
        updatedAuthors[index] = {
            ...updatedAuthors[index],
            [field]: value,
        };
        setAuthors(updatedAuthors);
    };

    const handleClick = async () => {
        try {
            await postAccountApiUploadCorrectPubl({
                title,
                year,
                authors,
                id_upload: idUpload,
            }).unwrap();
            dispatch(setAlert({
                message: 'Данные успешно обновлены',
                severity: 'success',
                open: true
            }));
        } catch (error) {
            console.error("Ошибка при отправке данных:", error);
        }
        onClick();
    };

    return (
        <Stack sx={{
            width: '100%',
            mt: 4,
        }}>
            <Typography alignSelf={'flex-start'} variant="h5" color='primary'>Проверьте данные о публикации</Typography>
            <Stack sx={{mt: 4,}} spacing={1}>
                <SettingTextField label="Название" value={title} onChange={e => setTitle(e.target.value)} sx={{mt: 8,}} />
                {memoizedAuthors.map((author, index) => <React.Fragment key={index}>
                        <SettingTextField
                            label="Автор"
                            value={author.a_fullname}
                            onChange={e => handleAuthorChange(index, 'a_fullname', e.target.value)}
                        />
                        <SettingTextField
                            label="Аффилиация"
                            value={author.a_affiliation}
                            onChange={e => handleAuthorChange(index, 'a_affiliation', e.target.value)}
                        />
                    </React.Fragment>
                )}
                <SettingTextField label="Год издания" value={year} onChange={e => setYear(e.target.value)} />
            </Stack>
            <Stack direction={'row'} sx={{
                width: '100%',
                justifyContent: 'space-between',
                mt: 4,
            }}>
                <Stack direction='row' alignItems={'center'} spacing={1}>
                    <Typography sx={{cursor: 'pointer'}} variant="body2" color={'primary'} fontWeight={'bold'}>Сообщить о проблеме</Typography>
                    <ReportProblemOutlinedIcon sx={{cursor: 'pointer'}} color="primary" fontSize="small" />
                </Stack>
                <Button type="submit" variant="contained" 
                    style={{ backgroundColor: '#1B4596' }}
                    onClick={handleClick}
                >Готово</Button>
            </Stack>
        </Stack>
    )
}

const allowedTypes = ['application/pdf', 'application/zip', 'application/x-rar-compressed', 'application/x-tar', 'application/x-zip-compressed'];

const UploadPage: React.FC = (): React.ReactElement => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [uploading, setUploading] = useState<boolean>(false);
    const [filename, setFilename] = useState<string>('');
    const [filesize, setFilesize] = useState<string>('');
    const [grobidSegments, setGrobidSegments] = useState<GrobidPubl | null>(null);
    const [success, setSeccess] = useState<boolean>(false);
    const [idUpload, setIdUpload] = useState<number>(-1)

    const [getIdUpload] = useLazyGetAccountApiIdUploadQuery();
    const [postAccountApiUploadPubl] = usePostAccountApiUploadPublMutation();

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files.length === 1) {
            if (allowedTypes.includes(files[0].type)) {
                const file = files[0];
                await initiateUpload(file);
            }
        }
    };

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length && allowedTypes.includes(e.target.files[0].type)) {
            const file = e.target.files[0];

            await initiateUpload(file);

            e.target.value = ''
        }
    };

    const handleClick = (): void => {
        setUploading(false);
        setSeccess(false);
        setUploadProgress(0);
        setFilename('');
        setFilesize('');
        setGrobidSegments(null);
    };

    const uploadChunks = async (file: File, idUpload: number) => {
        const chunkSize = 10 * 1024 * 1024;
        const numChunks = Math.ceil(file.size / chunkSize);
        setUploading(true);
        setFilename(file.name);
        setFilesize((file.size / 1048576).toFixed(2));

        for (let i = 0; i < numChunks; i++) {
            const offset = i * chunkSize;
            const chunk = file.slice(offset, offset + chunkSize);
            const formData = new FormData();

            formData.append('file', chunk, file.name);
            formData.append('pnum', i.toString());
            formData.append('id_upload', idUpload.toString());
            formData.append('is_complete', i === (numChunks - 1) ? '1' : '0');

            try {
                const response = await postAccountApiUploadPubl(formData).unwrap();

                setUploadProgress(((i + 1) / numChunks) * 100);

                if (i === numChunks - 1 && response) {
                    setGrobidSegments(response)
                }
            } catch (error) {
                console.error("Ошибка при загрузке файла:", error);
                break;
            }
        }
        setSeccess(true)
    };

    const initiateUpload = async (file: File) => {
        try {
            const response = await getIdUpload().unwrap();
            setIdUpload(response)

            if (response) {
                uploadChunks(file, response);
            } else {
                console.error("Ошибка при получении idUpload");
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <>
            <Head><title>Загрузка публикаций</title></Head>
            <Container sx={{ width: '100%', minHeight: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                <Card
                    sx={{
                        width: '80%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: !uploading ? 'pointer' : 'default',
                        boxShadow: '0 0 16px rgb(0, 0, 0, 0.25)',
                        p: 4
                    }}
                    onClick={() => { if (!uploading) fileInputRef.current?.click() }}
                    onDragOver={(e: React.DragEvent) => { e.preventDefault() }}
                    onDrop={handleDrop}
                >
                    {uploading 
                        ? <Stack direction="row" width='100%' spacing={1} alignItems="center">
                            <Image src={PdfIconImg} alt="" />
                            <Stack spacing={2} justifyContent={'space-between'}>
                                <Typography variant="body2" color="primary">{filename.length > 15 ? filename.slice(0, 12) + '...' : filename}</Typography>
                                <Typography variant="body2" alignSelf={'flex-start'} color="textSecondary">{filesize} МБ</Typography>
                            </Stack>
                            <LinearProgress variant="determinate" sx={{width: '100%'}} value={uploadProgress} />
                            <Typography variant="body2" color="textSecondary">{`${Math.round(uploadProgress)}%`}</Typography>
                            <CheckIcon color='primary' fontSize="small" sx={{visibility: success ? 'visible' : 'hidden'}} />
                        </Stack>
                        : <Stack>
                            <Typography variant="h6" fontWeight={700} color='primary'>Нажмите, чтобы загрузить файл</Typography>
                            <Typography color='gray'>или перетащите файл на эту область</Typography>
                        </Stack>
                    }
                </Card>
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept={allowedTypes.join(', ')}
                    onChange={handleChange}
                />
                {success && <EditGrobidSegments grobidSegments={grobidSegments} onClick={handleClick} idUpload={idUpload} />}
            </Container>
        </>
    );
};

export default UploadPage;
