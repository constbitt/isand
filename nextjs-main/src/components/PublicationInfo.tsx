import { useGetPublInfoQuery } from '@/src/store/api/serverApiV2_5';

export const PublicationInfo = () => {
    const { data, isLoading, error } = useGetPublInfoQuery('2122');
    
    if (isLoading) return <div>Загрузка...</div>;
    if (error) return <div>Произошла ошибка при загрузке данных</div>;
    if (!data) return null;
    
    return (
        <div>
            {data.map((publication) => (
                <div key={publication.publ_isand_id}>
                    <h2>{publication.publ_name}</h2>
                    <p>Авторы: {publication.author_fios}</p>
                    <p>Год: {publication.year}</p>
                    <p>Источник: {publication.ext_source}</p>
                </div>
            ))}
        </div>
    );
}; 