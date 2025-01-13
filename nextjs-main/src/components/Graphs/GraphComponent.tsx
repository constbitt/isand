import React, { useEffect, useState } from "react";
import dynamic from 'next/dynamic';
import { Box, CircularProgress } from "@mui/material";
import { Graph, Layout, Node } from "@/src/store/types/graphsTypes";


interface GraphComponentProps {
    graphData: {
        graph: Graph
        layout: Layout[]
    } | undefined
    useEdges?: boolean
    useLegend?: boolean
    nodeSize: number
    pageType: 'distance' | 'graphs' | 'thesaurus' | 'graphs-cnt'
    highLightAround?: string
    highLightBetween?: string[]
    width: number
    height: number
}

const Plot = dynamic(() => {return import ("react-plotly.js")}, {ssr: false})

const GraphComponent: React.FC<GraphComponentProps> = ({
    graphData,
    useEdges,
    useLegend,
    nodeSize,
    pageType,
    highLightAround,
    highLightBetween,
    height,
    width,
}): React.ReactElement => {
    const [load, setLoad] = useState<boolean>(false)

    // useEffect(() => {
    //     if (ticks !== 0 ) {
    //         setLoad(true)
    //     } else {
    //         setLoad(false)
    //     }
    //     console.log(ticks)
    // }, [ticks])

    const coloring = (pageType: string): Map<string, number | undefined> => {
        const fields: Record<string, Map<string, number | undefined>> = {
            'thesaurus': new Map(graphData?.graph.nodes.map(node => [node.id, node.dp])),
            'graphs': new Map(graphData?.graph.nodes.map(node => [node.id, node.adjacency])),
            'graphs-cnt': new Map(graphData?.graph.nodes.map(node => [node.id, node.count])),
        };
        return fields[pageType];
    }

    const colorbarTitle = (pageType: string): string => {
        const fields: Record<string, string> = {
            'thesaurus': 'Количество связей',
            'graphs': 'Количество связей',
            'graphs-cnt': 'Встречаемость',
        };
        return fields[pageType];
    }

    const nodePositions = new Map(
        graphData?.layout.map(node => [node.term, node.pos])
    );
    const nodeIds = new Set(graphData?.graph.nodes.map((node: Node) => node.id));
    const filteredNodePositions = new Map(
        Array.from(nodePositions.entries()).filter(([id]) => !nodeIds.has(id))
    );

    const edgesHighLightBetweenCords: {
        x: (number | null)[]
        y: (number | null)[]
    } = {x: [], y: []}
    const edgesHighLightInCords: {
        x: (number | null)[]
        y: (number | null)[]
    } = {x: [], y: []}
    const edgesHighLightOutCords: {
        x: (number | null)[]
        y: (number | null)[]
    } = {x: [], y: []}
    const edgesCords: {
        x: (number | null)[]
        y: (number | null)[]
    } = {x: [], y: []}

    const nodesCords: {
        x: Set<number>
        y: Set<number>
        text: Set<string>
    } = {x: new Set(), y: new Set(), text: new Set()}
    const nodesHighLightCords: {
        x: Set<number>
        y: Set<number>
        text: Set<string>
    } = {x: new Set(), y: new Set(), text: new Set()}

    for(let link of graphData?.graph.links ?? []) {
        if (link.source === highLightAround) {
            if (link.source != link.target) { 
                edgesHighLightOutCords.x.push(nodePositions.get(link.source)?.[0] ?? 0, nodePositions.get(link.target)?.[0] ?? 0, null)
                edgesHighLightOutCords.y.push(nodePositions.get(link.source)?.[1] ?? 0, nodePositions.get(link.target)?.[1] ?? 0, null)
            }
            nodesHighLightCords.x.add(nodePositions.get(link.source)?.[0] ?? 0)
            nodesHighLightCords.y.add(nodePositions.get(link.source)?.[1] ?? 0)
            nodesHighLightCords.text.add(link.source)
            nodesHighLightCords.x.add(nodePositions.get(link.target)?.[0] ?? 0)
            nodesHighLightCords.y.add(nodePositions.get(link.target)?.[1] ?? 0)
            nodesHighLightCords.text.add(link.target)
            continue
        }
        if (link.target === highLightAround) {
            if (link.source != link.target) { 
                edgesHighLightInCords.x.push(nodePositions.get(link.source)?.[0] ?? 0, nodePositions.get(link.target)?.[0] ?? 0, null)
                edgesHighLightInCords.y.push(nodePositions.get(link.source)?.[1] ?? 0, nodePositions.get(link.target)?.[1] ?? 0, null)
            }
            nodesHighLightCords.x.add(nodePositions.get(link.source)?.[0] ?? 0)
            nodesHighLightCords.y.add(nodePositions.get(link.source)?.[1] ?? 0)
            nodesHighLightCords.text.add(link.source)
            nodesHighLightCords.x.add(nodePositions.get(link.target)?.[0] ?? 0)
            nodesHighLightCords.y.add(nodePositions.get(link.target)?.[1] ?? 0)
            nodesHighLightCords.text.add(link.target)
            continue
        }
        if (!!highLightBetween) {
            if (highLightBetween?.includes(link.target) && highLightBetween?.includes(link.source)) {
                if (link.source != link.target) { 
                    edgesHighLightBetweenCords.x.push(nodePositions.get(link.source)?.[0] ?? 0, nodePositions.get(link.target)?.[0] ?? 0, null)
                    edgesHighLightBetweenCords.y.push(nodePositions.get(link.source)?.[1] ?? 0, nodePositions.get(link.target)?.[1] ?? 0, null)
                }
                nodesHighLightCords.x.add(nodePositions.get(link.source)?.[0] ?? 0)
                nodesHighLightCords.y.add(nodePositions.get(link.source)?.[1] ?? 0)
                nodesHighLightCords.text.add(link.source)
                nodesHighLightCords.x.add(nodePositions.get(link.target)?.[0] ?? 0)
                nodesHighLightCords.y.add(nodePositions.get(link.target)?.[1] ?? 0)
                nodesHighLightCords.text.add(link.target)
                continue
            }
            if (highLightBetween?.includes(link.target)) {
                if (link.source != link.target) { 
                    edgesCords.x.push(nodePositions.get(link.source)?.[0] ?? 0, nodePositions.get(link.target)?.[0] ?? 0, null)
                    edgesCords.y.push(nodePositions.get(link.source)?.[1] ?? 0, nodePositions.get(link.target)?.[1] ?? 0, null)
                }
                nodesHighLightCords.x.add(nodePositions.get(link.target)?.[0] ?? 0)
                nodesHighLightCords.y.add(nodePositions.get(link.target)?.[1] ?? 0)
                nodesHighLightCords.text.add(link.target)
                nodesCords.x.add(nodePositions.get(link.source)?.[0] ?? 0)
                nodesCords.y.add(nodePositions.get(link.source)?.[1] ?? 0)
                nodesCords.text.add(link.source)
                continue
            }
            if (highLightBetween?.includes(link.source)) {
                if (link.source != link.target) { 
                    edgesCords.x.push(nodePositions.get(link.source)?.[0] ?? 0, nodePositions.get(link.target)?.[0] ?? 0, null)
                    edgesCords.y.push(nodePositions.get(link.source)?.[1] ?? 0, nodePositions.get(link.target)?.[1] ?? 0, null)
                }
                nodesHighLightCords.x.add(nodePositions.get(link.source)?.[0] ?? 0)
                nodesHighLightCords.y.add(nodePositions.get(link.source)?.[1] ?? 0)
                nodesHighLightCords.text.add(link.source)
                nodesCords.x.add(nodePositions.get(link.target)?.[0] ?? 0)
                nodesCords.y.add(nodePositions.get(link.target)?.[1] ?? 0)
                nodesCords.text.add(link.target)
                continue
            }
        }
        if (link.source != link.target) { 
            edgesCords.x.push(nodePositions.get(link.source)?.[0] ?? 0, nodePositions.get(link.target)?.[0] ?? 0, null)
            edgesCords.y.push(nodePositions.get(link.source)?.[1] ?? 0, nodePositions.get(link.target)?.[1] ?? 0, null)
        }
        nodesCords.x.add(nodePositions.get(link.source)?.[0] ?? 0)
        nodesCords.y.add(nodePositions.get(link.source)?.[1] ?? 0)
        nodesCords.text.add(link.source)
        nodesCords.x.add(nodePositions.get(link.target)?.[0] ?? 0)
        nodesCords.y.add(nodePositions.get(link.target)?.[1] ?? 0)
        nodesCords.text.add(link.target)
    }

    const colors = Array.from(nodesCords.text).map(node => coloring(pageType).get(node))
    const colorsHighLight = Array.from(nodesHighLightCords.text).map(node => coloring(pageType).get(node))
    const min = Math.min(...colors as number[])
    const max = Math.max(...colors as number[])

    const nodes = {
        x: Array.from(nodesCords.x),
        y: Array.from(nodesCords.y),
        text: (highLightAround || !!highLightBetween && highLightBetween?.length > 0) ? undefined : Array.from(nodesCords.text),
        mode: 'markers' + (useLegend ? '+text' : ''),
        hoverinfo: 'text',
        opacity: (highLightAround || !!highLightBetween && highLightBetween?.length > 0) ? 0 : 1,
        textposition: 'top',
        marker: {
            line_width: 2,
            size: nodeSize,
            colorscale: 'Viridis',
            color: colors,
            line: {
                color: 'white',
                width: 2
            },
            colorbar: {
                title: colorbarTitle(pageType),
                // tickvals: [min, min + max / 2, max],
                // ticktext: ['Низкая', 'Средняя', 'Высокая']
            }
        },
    }

    const nodesHighLight = {
        x: Array.from(nodesHighLightCords.x),
        y: Array.from(nodesHighLightCords.y),
        text: Array.from(nodesHighLightCords.text),
        mode: 'markers' + (useLegend ? '+text' : ''),
        hoverinfo: 'text',
        opacity: 1,
        textposition: 'top',
        marker: {
            line_width: 2,
            size: 15,
            colorscale: 'Viridis',
            color: colorsHighLight,
            line: {
                color: 'white',
                width: 2
            },
        }
    }

    const hiddenNodes = {
        x: Array.from(filteredNodePositions.values()).map(pos => pos[0]),
        y: Array.from(filteredNodePositions.values()).map(pos => pos[1]),
        mode: 'markers',
        name: 'Hidden Nodes',
        hoverinfo: 'text',
        marker: {
            size: 10,
            color: '#e5ecf6'
        },
        opacity: 0.1,
    };

    const edges = useEdges ? {
        x: edgesCords.x,
        y: edgesCords.y,
        mode: graphData?.graph.directed ? 'lines+markers' : 'lines',
        line: {
            width: 0.5,
            color: '#888',
        },
        opacity: (highLightAround || !!highLightBetween && highLightBetween?.length > 0) ? 0.2 : 1,
        marker: {
            symbol: "arrow",
            size: 15,
            angleref: "previous",
        },
        hoverinfo: 'none',
    } : {}

    const edgesHighlightOut = {
        x: edgesHighLightOutCords.x,
        y: edgesHighLightOutCords.y,
        mode: graphData?.graph.directed ? 'lines+markers' : 'lines',
        line: {
            width: 0.5,
            color: 'blue',
        },
        opacity: 1,
        marker: {
            symbol: "arrow",
            size: 15,
            angleref: "previous",
        },
        hoverinfo: 'none',
    }

    const edgesHighlightIn = {
        x: edgesHighLightInCords.x,
        y: edgesHighLightInCords.y,
        mode: graphData?.graph.directed ? 'lines+markers' : 'lines',
        line: {
            width: 0.5,
            color: 'red',
        },
        opacity: 1,
        marker: {
            symbol: "arrow",
            size: 15,
            angleref: "previous",
        },
        hoverinfo: 'none',
    }

    const edgesHighlightBeetween = {
        x: edgesHighLightBetweenCords.x,
        y: edgesHighLightBetweenCords.y,
        mode: graphData?.graph.directed ? 'lines+markers' : 'lines',
        line: {
            width: 0.5,
            color: 'green',
        },
        opacity: 1,
        marker: {
            symbol: "arrow",
            size: 15,
            angleref: "previous",
        },
        hoverinfo: 'none',
    }

    const data = [hiddenNodes, edges, edgesHighlightOut, edgesHighlightIn, edgesHighlightBeetween, nodes, nodesHighLight,];

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
            r: 150,
            t: 0,
        },
        showlegend: false,
        legend: {
            x: 0,
            y: 0,
            bgcolor: 'rgba(255, 255, 255, 0)',
            bordercolor: 'rgba(255, 255, 255, 0)'
        },
        plot_bgcolor: '#e5ecf6', // Светлоголубой фон
        paper_bgcolor: 'rgba(255, 255, 255, 0)',
    }

    return (
        <Box position="relative" width={width} height={height}>
            {load && (
                <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    sx={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', zIndex: 1 }}
                >
                    <CircularProgress />
                </Box>
            )}
            <Plot
                data={data}
                layout={{ ...layout, width: width, height: height }}
                onPurge={() => {
                    // onLoad(true)
                    console.log('start')
                }}
                onInitialized={() => {
                    // onLoad(true)
                    console.log('init')
                }}
                onAfterPlot={() => {
                    console.log('end')
                    // setTicks(prev => prev - 1)
                }}
                onRelayout={() => {
                    console.log('exp')
                    // setTicks(prev => prev - 1)
                }}
            />
        </Box>
    )
};

export default GraphComponent;