import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import React from "react";
import BarCustomTooltip from "@/src/components/Chart/BarChart/BarCustomTooltip";

const AnyBarChart = ({ data, onClick, formatter, colors, customTooltip = BarCustomTooltip }: {
    data: ({ name: string } & { [ids: string]: number })[],
    colors?: (item_id: string) => string,
    onClick: (_: any) => void,
    formatter: (value: any, entry: any, index: any) => React.ReactNode,
    customTooltip?: ({ active, payload, label }: { active: boolean, payload: any[], label: string }) => React.ReactNode
}) => {
    console.log(data)

    const ids: { [id: string]: {} } = {}

    data.forEach((item) => {
        Object.entries(item).forEach(([key, value]) => {
            if (key !== "name") {
                if (!(key in ids)) {
                    ids[key as keyof typeof ids] = {}
                }
            }
        })
    })

    const normalize_data = data.length > 0 ? data.map((item) => {
        Object.keys(ids).forEach((cur_id) => {
            if (!(cur_id in item)) {
                item[cur_id] = 0
            }
        })
        return item
    }) : [{ name: '', ...Object.keys(ids).reduce((acc, cur) => ({ ...acc, [cur]: 0 }), {}) }];

    const barCount = Object.keys(ids).length;
    const minBarHeight = 40 * barCount;
    const chartHeight = data.length * minBarHeight + 100;

    return (
        <ResponsiveContainer width={"100%"} height={chartHeight}>
            <BarChart
                layout="vertical"
                data={normalize_data}
                margin={{
                    top: 20,
                    right: 20,
                    bottom: 20,
                    left: 20,
                }}
                onClick={onClick}
                barCategoryGap="20%"  // Added spacing between the bars
                barGap={5}           // Additional spacing between bars
            >
                <CartesianGrid stroke="#f5f5f5" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={250} tick={{ fontSize: 14 }} minTickGap={10} /> {/* Increased font size */}
                <Tooltip content={customTooltip as any} />
                {Object.keys(ids).map((item, index) => {
                    return <Bar dataKey={item} key={index} barSize={20} fill={colors ? colors(item) : undefined} />
                })}
                <Legend formatter={formatter} layout="vertical" align="right" verticalAlign="top" wrapperStyle={{ paddingLeft: 20, maxWidth: '20%' }} />
            </BarChart>
        </ResponsiveContainer>
    );
}

export default AnyBarChart;
