import Head from "next/head";
import fs from 'fs';
import path from 'path';
import React from "react";
import { Stack } from "@mui/material";

const GlossaryPage: React.FC<{ glossary: { _: { description: string } } }> = ({ glossary }) => {
    return (
        <>
            <Head>
                <title>Глоссарий</title>
                <style>
                    {`
                        .link {
                            color: blue; /* Set link color to blue */
                            text-decoration: none; /* Remove underline */
                        }
                        .link:hover {
                            text-decoration: underline; /* Add underline on hover */
                        }
                    `}
                </style>
            </Head>
            <Stack sx={{ width: '100%', alignItems: 'center', mt: 4 }}>
                <table style={{ width: '70%', marginTop: 40 }}>
                    <thead>
                        <tr>
                            <th>Термин</th>
                            <th>Описание</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(glossary).map(([term, { description }], index) => (
                            <tr key={index} style={{ borderBottom: '1px solid #ddd', paddingBottom: '5px', marginBottom: '5px' }}>
                                <td id={term}>
                                    {term} {}
                                </td>
                                <td>
                                    {description.split(/(<a[^>]*>.*?<\/a>)/g).map((part, i) => {
                                        const match = part.match(/<a[^>]*>(.*?)<\/a>/);
                                        if (match) {
                                            const linkContent = match[1];
                                            const linkHrefMatch = match[0].match(/href="([^"]*)"/);
                                            const linkHref = linkHrefMatch ? linkHrefMatch[1] : '';
                                            return (
                                                <a key={i} href={linkHref} className="link" dangerouslySetInnerHTML={{ __html: linkContent }} />
                                            );
                                        }
                                        return <span key={i} dangerouslySetInnerHTML={{ __html: part }} />;
                                    })}
                                </td>

                            </tr>
                        ))}
                    </tbody>
                </table>
            </Stack>
        </>
    );
};

export const getStaticProps = async () => {
    const filePath = path.join(process.cwd(), 'src', 'assets', 'json', 'glossary.json');
    const jsonData = await fs.promises.readFile(filePath, 'utf-8');
    const glossary = JSON.parse(jsonData);

    return {
        props: {
            glossary
        }
    };
};

export default GlossaryPage;
