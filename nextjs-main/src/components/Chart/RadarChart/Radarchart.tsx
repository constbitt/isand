import { usePostRoseOfWindsMutation } from "@/src/store/api/serverApiV3";
import { RoseOfWinds } from "@/src/store/types/sdResultTypes";
import splitTextIntoLines from "@/src/tools/splitTextIntoLines";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from "recharts";

interface Profile {
    name: string
    count: number
}

interface CustomTickProps {
    x: number;
    y: number;
    payload: {
        value: string;
    };
}

const RadarComponent: React.FC<RoseOfWinds> = (props): React.ReactElement => {
    const [data, setData] = useState<{ profile: Profile[] }>({ profile: [] });
    const [loading, setLoading] = useState<boolean>(false);

    const [postRoseOfWinds] = usePostRoseOfWindsMutation();

    const renderCustomTick = (props: CustomTickProps) => {
        const { x, y, payload } = props;
        const maxWidth = 20;
        const lines = splitTextIntoLines(payload.value, maxWidth);

        return (
            <g transform={`translate(${x},${y})`}>
                {lines.map((line, index) => (
                    <text
                        key={index}
                        textAnchor="middle"
                        dominantBaseline="central"
                        y={index * 14}
                    >
                        {line}
                    </text>
                ))}
            </g>
        );
    };

    useEffect(() => {
        (async () => {
            if (props.id[0] >= 0) {
                setLoading(true);
                try {
                    const result = await postRoseOfWinds(props).unwrap();
                    //console.log(result);
                    setData({
                        profile: result.items[0].factors.map(factor => {
                            return {
                                count: factor.value,
                                name: factor.variant
                            }
                        })
                    });
                } catch (error) {
                    //console.log(error);
                } finally {
                    setLoading(false);
                }
            }
        })();
    }, [props]);

    const maxCount = Math.max(...data.profile.map(item => item.count));

    return (
        <Box sx={{ height: 700, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            {loading ? (
                <CircularProgress />
            ) : (   
                data.profile.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart outerRadius={700 / 3} data={data.profile}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="name" tick={renderCustomTick} />
                            <PolarRadiusAxis angle={30} domain={[0, maxCount]} />
                            <Radar dataKey="count" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                        </RadarChart>
                    </ResponsiveContainer>
                ) : (
                    <Typography sx={{ textAlign: 'center' }}>Данные не найдены</Typography>
                )
            )}
        </Box>
    );
}

export default RadarComponent;