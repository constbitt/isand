import React, { useState } from "react";
import dynamic from 'next/dynamic';
import { CircularProgress } from "@mui/material";
import { AllAuthorsResponse, AllAviableSource, ProduceProfileMapResponse } from "@/src/store/types/graphsTypes";

const Plot = dynamic(() => {return import ("react-plotly.js")}, {ssr: false})

interface DistanceComponentProps {
    layoutData: ProduceProfileMapResponse[]
    authorData: AllAuthorsResponse[]
    confData: AllAviableSource[]
    journalsData: AllAviableSource[]
    nodesToHighlightAsAuthors?: string[]
    nodesToHighlightAsConfAuthors?: string[]
    confsToDisplay?: string[]
    journalsToDisplay?: string[]
    size_cutoff?: number
    width: number
    height: number
}

const DistanceComponent: React.FC<DistanceComponentProps> = ({
    layoutData, // id auvtor + coardinats
    authorData, // данные для трансляции id авторов в имена
    confData, // данные для трансляции названий конференций в списке, приходящем с бэка в названия для отображения
    journalsData, // данные для трансляции названий журналов списке, приходящем с бэка в названия для отображения
    nodesToHighlightAsAuthors = [], // список авторов, которых надо подсветить
    nodesToHighlightAsConfAuthors = [], // список авторов, которых надо подсветить как участников конференций
    confsToDisplay = [], // списко конференций, которые надо отобразить
    journalsToDisplay = [], // список журналов которые надо отобразить
    size_cutoff = 2, // отсечение по количеству публикаций (размеру)
    width,
    height
}): React.ReactElement => {
    const [loading, setLoading] = useState<boolean>(true);

    const authorNames = new Map(
        authorData.map(author => [author.prnd_author_id.toString(), author.fio])
    );
    const authorSizes = new Map(
        authorData.map(author => [author.prnd_author_id.toString(), author.publs_count])
    );


    const confNames = new Map(
        confData.map(conf => [conf.name_req, conf.name_disp])
    );

    const journalsNames = new Map(
        journalsData.map(journal => [journal.name_req, journal.name_disp])
    );

    const nodesDisplayAsAuthorsCoords: {
        x: (number)[]
        y: (number)[]
        text : (string)[]
        size : (number)[]
    } = {x: [], y: [], text: [], size : []}
    const nodesHlAsAuthorsCoords: {
        x: (number)[]
        y: (number)[]
        text : (string)[]
        size : (number)[]
    } = {x: [], y: [], text: [], size : []}
    const nodesHlAsConfsAuthCoords: {
        x: (number)[]
        y: (number)[]
        text : (string)[]
        size : (number)[]
    } = {x: [], y: [], text: [], size : []}

    const nodesDisplayAsConfsCoords: {
        x: (number)[]
        y: (number)[]
        text : (string)[]
    } = {x: [], y: [], text: []}
    const nodesDisplayAsJournalsCoords: {
        x: (number)[]
        y: (number)[]
        text : (string)[]
    } = {x: [], y: [], text: []}

    const annotations : ({})[] = []

    for(let item of layoutData) {
        if (authorNames.has(item.ent)) { // это автор
            if (authorSizes.get(item.ent) ?? 0 > size_cutoff) {
                if (nodesToHighlightAsAuthors?.includes(item.ent)) {
                    nodesHlAsAuthorsCoords.x.push(item.pos[0])
                    nodesHlAsAuthorsCoords.y.push(item.pos[1])
                    nodesHlAsAuthorsCoords.text.push(authorNames.get(item.ent) ?? '')
                    nodesHlAsAuthorsCoords.size.push(authorSizes.get(item.ent) ?? 10)
                    // в этом случае добавляем аннотацию
                    annotations.push({
                        x : item.pos[0],
                        y : item.pos[1],
                        text : authorNames.get(item.ent),
                        showarrow : true,
                        arrowhead : 0,
                        font : {
                            color : 'black'
                        },
                        arrowcolor : 'rgb(228,26,28)',
                        arrowwidth : 2.5,
                        bordercolor : 'rgb(228,26,28)',
                        borderwidth : 2.5,
                        ax : 20,
                        ay : -20,
                        bgcolor : "white",
                        opacity : 0.9
                    })

                    continue
                }
                if (nodesToHighlightAsConfAuthors?.includes(item.ent)) {
                    nodesHlAsConfsAuthCoords.x.push(item.pos[0])
                    nodesHlAsConfsAuthCoords.y.push(item.pos[1])
                    nodesHlAsConfsAuthCoords.text.push(authorNames.get(item.ent) ?? '')
                    nodesHlAsConfsAuthCoords.size.push(authorSizes.get(item.ent) ?? 10)
                    continue
                }
                nodesDisplayAsAuthorsCoords.x.push(item.pos[0])
                nodesDisplayAsAuthorsCoords.y.push(item.pos[1])
                nodesDisplayAsAuthorsCoords.text.push(authorNames.get(item.ent) ?? '')
                nodesDisplayAsAuthorsCoords.size.push(authorSizes.get(item.ent) ?? 10)
            }
        }
        if (confNames.has(item.ent)) { // это конференции
            if (confsToDisplay?.includes(item.ent)) {
                nodesDisplayAsConfsCoords.x.push(item.pos[0])
                nodesDisplayAsConfsCoords.y.push(item.pos[1])
                nodesDisplayAsConfsCoords.text.push(confNames.get(item.ent) ?? '')
                // в этом случае добавляем аннотацию
                annotations.push({
                    x : item.pos[0],
                    y : item.pos[1],
                    text : confNames.get(item.ent),
                    showarrow : true,
                    arrowhead : 0,
                    font : {
                        color : 'black'
                    },
                    arrowcolor : 'rgb(247,129,191)',
                    arrowwidth : 2.5,
                    bordercolor : 'rgb(247,129,191)',
                    borderwidth : 2.5,
                    ax : 20,
                    ay : -20,
                    bgcolor : "white",
                    opacity : 0.9
                })
            }
        }
        if (journalsNames.has(item.ent)) { // это журнал
            // журналов пока нет
            if (journalsToDisplay?.includes(item.ent)) {
                nodesDisplayAsJournalsCoords.x.push(item.pos[0])
                nodesDisplayAsJournalsCoords.y.push(item.pos[1])
                nodesDisplayAsJournalsCoords.text.push(journalsNames.get(item.ent) ?? '')
                // в этом случае добавляем аннотацию
                annotations.push({
                    x : item.pos[0],
                    y : item.pos[1],
                    text : journalsNames.get(item.ent),
                    showarrow : true,
                    arrowhead : 0,
                    font : {
                        color : 'black'
                    },
                    arrowcolor : 'rgb(47,229,91)',
                    arrowwidth : 2.5,
                    bordercolor : 'rgb(47,229,91)',
                    borderwidth : 2.5,
                    ax : 20,
                    ay : -20,
                    bgcolor : "white",
                    opacity : 0.9
                })
            }
        }
    }

    const authorsDisplay = {
        x: nodesDisplayAsAuthorsCoords.x,
        y: nodesDisplayAsAuthorsCoords.y,
        text: nodesDisplayAsAuthorsCoords.text,
        mode: 'markers',
        opacity: nodesToHighlightAsAuthors.length === 0 ? 1 : 0.3,
        
        hoverinfo: 'text',
        marker: {
            size: nodesDisplayAsAuthorsCoords.size,
            color: '#377eb8',
            line: {
                color: 'black',
                width: 2
            },
        }
    }

    const authorsHighlight = {
        x: nodesHlAsAuthorsCoords.x,
        y: nodesHlAsAuthorsCoords.y,
        text: nodesHlAsAuthorsCoords.text,
        mode: 'markers',
        
        hoverinfo: 'text',
        marker: {
            size: nodesHlAsAuthorsCoords.size,
            color: 'red',
            line: {
                color: 'black',
                width: 2
            },
        }
    }

    const authorsAsConfAuthorsDisplay = {
        x: nodesHlAsConfsAuthCoords.x,
        y: nodesHlAsConfsAuthCoords.y,
        text: nodesHlAsConfsAuthCoords.text,
        mode: 'markers',
        
        hoverinfo: 'text',
        marker: {
            size: nodesHlAsConfsAuthCoords.size,
            color: 'orange',
            line: {
                color: 'black',
                width: 2
            },
        }
    }

    const confsDisplay = {
        x: nodesDisplayAsConfsCoords.x,
        y: nodesDisplayAsConfsCoords.y,
        text: nodesDisplayAsConfsCoords.text,
        mode: 'markers',
        
        hoverinfo: 'text',
        marker: {
            size: 10,
            color: 'white',
            line: {
                color: 'black',
                width: 2
            },
        }
    }

    const journalsDisplay = {
        x: nodesDisplayAsJournalsCoords.x,
        y: nodesDisplayAsJournalsCoords.y,
        text: nodesDisplayAsJournalsCoords.text,
        mode: 'markers',
        
        hoverinfo: 'pink',
        marker: {
            size: 10,
            color: 'white',
            line: {
                color: 'black',
                width: 2
            },
        }
    }

    const data = [authorsDisplay, authorsAsConfAuthorsDisplay, confsDisplay, journalsDisplay, authorsHighlight]
    // console.log(data)

    const layout = {
        xaxis: {
            visible: false,
            showline: false,
            showgrid: false, // Включаем отображение сетки
            gridcolor: '#e0f2f1', // Цвет сетки (светлый оттенок голубого)
            showticklabels: false,
            linecolor: 'rgb(204,204,204)',
            linewidth: 2,
            tickfont: {
                family: 'Arial',
                size: 12,
                color: 'rgb(82, 82, 82)'
            },
        },
        yaxis: {
            visible: false,
            showline: false,
            showgrid: false, // Включаем отображение сетки
            gridcolor: '#e0f2f1', // Цвет сетки (светлый оттенок голубого)
            showticklabels: false,
            linecolor: 'rgb(204,204,204)',
            linewidth: 2,
            tickfont: {
                family: 'Arial',
                size: 12,
                color: 'rgb(82, 82, 82)'
            }
        },
        margin: {
            autoexpand: false,
            l: 0,
            r: 0,
            t: 0,
        },
        showlegend: false,
        legend: {
            x: 0,
            y: 0,
            bgcolor: 'rgba(255, 255, 255, 0)',
            bordercolor: 'rgba(255, 255, 255, 0)'
        },
        plot_bgcolor: '#e5ecf6',
        paper_bgcolor: 'rgba(255, 255, 255, 0)',
        annotations : annotations
    }

    return <>
    {loading && (
            <CircularProgress
                size={24}
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    marginTop: '-12px',
                    marginLeft: '-12px',
                }}
            />
        )}
        <Plot
            data={data}
            layout={{...layout, width: width, height: height}}
            onInitialized={() => setLoading(false)}
            onPurge={() => setLoading(true)}
        />
    </>
};

export default DistanceComponent;