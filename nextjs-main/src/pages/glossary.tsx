import Head from "next/head";
import fs from 'fs';
import path from 'path';
import React, { useEffect, useState } from "react";
import { Stack, Fab } from "@mui/material";
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const alphabet = [
    'А','Б','В','Г','Д','Е','Ж','З','И','К','Л','М','Н','О','П','Р','С','Т','У','Ф','Х','Ц','Ч','Ш','Щ','Э','Ю','Я'
];

const GlossaryPage: React.FC<{ glossary: Record<string, { description: string }> }> = ({ glossary }) => {

    const [highlightLetter, setHighlightLetter] = useState<string | null>(null);
    const [showScrollTop, setShowScrollTop] = useState(false);

    // Группировка по первой букве
    const grouped = Object.entries(glossary).reduce((acc, [term, data]) => {
        const letter = term.charAt(0).toUpperCase();
        if (!acc[letter]) acc[letter] = [];
        acc[letter].push([term, data]);
        return acc;
    }, {} as Record<string, Array<[string, { description: string } ]>>);

    // Подсветка буквы при переходе
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.replace('#', '');
            if (alphabet.includes(hash)) {
                setHighlightLetter(hash);
                setTimeout(() => setHighlightLetter(null), 2000);
            }
        };
        window.addEventListener('hashchange', handleHashChange);
        handleHashChange();
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    // Появление кнопки "вверх"
    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <>
            <Head>
                <title>Глоссарий</title>
                <style>{`
                    .link { color: blue; text-decoration: none; }
                    .link:hover { text-decoration: underline; }

                    /* Навигация по буквам */
                    .letter-nav a {
                        margin-right: 12px;
                        font-size: 30px;
                        cursor: pointer;
                        color: #1b4597; /* синий */
                        font-weight: bold;
                        text-transform: uppercase; /* все буквы большие */
                    }
                    .letter-nav a:hover {
                        color: #163778; /* темнее при наведении */
                        text-decoration: underline;
                    }

                    /* Заголовки букв в таблице */
                    .letter-header {
                        color: #1b4597; /* синий */
                        font-weight: bold;
                        text-transform: uppercase;
                        font-size: 24px;
                    }

                    .highlight {
                        animation: highlightAnim 2s ease-out;
                        background-color: yellow;
                        transition: background-color 0.5s;
                        padding: 2px 6px;
                        border-radius: 4px;
                    }

                    @keyframes highlightAnim {
                        0% { background-color: yellow; }
                        100% { background-color: transparent; }
                    }
                `}</style>
            </Head>

            <Stack sx={{ width: '100%', alignItems: 'center', mt: 4 }}>
                {/* Навигация по алфавиту */}
                <div className="letter-nav" style={{ marginBottom: 30 }}>
                    {alphabet.map(letter => (
                        <a key={letter} href={`#${letter}`}>{letter}</a>
                    ))}
                </div>

                <table style={{ width: '70%', marginTop: 20 }}>
                    <thead>
                        <tr>
                            <th>Термин</th>
                            <th>Описание</th>
                        </tr>
                    </thead>

                    <tbody>
                        {alphabet.map(letter => (
                            grouped[letter] ? (
                                <React.Fragment key={letter}>
                                    {/* Заголовок буквы с подсветкой */}
                                    <tr>
                                        <td colSpan={2}>
                                            <h2
                                                id={letter}
                                                className={`letter-header ${highlightLetter === letter ? 'highlight' : ''}`}
                                            >
                                                {letter}
                                            </h2>
                                        </td>
                                    </tr>

                                    {grouped[letter].map(([term, { description }], index) => (
                                        <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                                            <td id={term}>{term}</td>
                                            <td>
                                                {description.split(/(<a[^>]*>.*?<\/a>)/g).map((part, i) => {
                                                    const match = part.match(/<a[^>]*>(.*?)<\/a>/);
                                                    if (match) {
                                                        const linkContent = match[1];
                                                        const href = match[0].match(/href="([^"]*)"/)?.[1];
                                                        return (
                                                            <a key={i} href={href} className="link" dangerouslySetInnerHTML={{ __html: linkContent }} />
                                                        );
                                                    }
                                                    return <span key={i} dangerouslySetInnerHTML={{ __html: part }} />;
                                                })}
                                            </td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ) : null
                        ))}
                    </tbody>
                </table>

                {/* Кнопка "вверх" */}
                {showScrollTop && (
                    <Fab
                        size="small"
                        onClick={scrollToTop}
                        sx={{
                            position: 'fixed',
                            bottom: 40,
                            right: 40,
                            bgcolor: '#1976d2', // синий
                            '&:hover': { bgcolor: '#115293' }, // темнее при наведении
                        }}
                    >
                        <KeyboardArrowUpIcon />
                    </Fab>
                )}
            </Stack>
        </>
    );
};

export const getStaticProps = async () => {
    const filePath = path.join(process.cwd(), 'src', 'assets', 'json', 'glossary.json');
    const jsonData = await fs.promises.readFile(filePath, 'utf-8');
    const glossary = JSON.parse(jsonData);

    return {
        props: { glossary }
    };
};

export default GlossaryPage;
