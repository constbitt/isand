import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import React from "react";
import BarCustomTooltip from "@/src/components/Chart/BarChart/BarCustomTooltip";

const StyledSingleBarChart = ({ data, onClick }: {
    data: { name: string, value: number }[],
    onClick: (_: any) => void
}) => {
    const barSize = 20;
    const minBarHeight = 40;
    const chartHeight = data.length * minBarHeight + 100;
    const yAxisWidth = 350;

    return (
        <ResponsiveContainer width={"100%"} height={chartHeight}>
            <BarChart
                layout="vertical"
                data={data}
                margin={{
                    top: 20,
                    right: 20,
                    bottom: 20,
                    left: 20,
                }}
                onClick={onClick}
                barCategoryGap="30%"
                barGap={5}
            >
                <CartesianGrid stroke="#f5f5f5" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={yAxisWidth} />
                <Tooltip content={BarCustomTooltip as any} />
                <Bar dataKey="value" barSize={barSize} fill="rgb(99, 110, 250)" />
            </BarChart>
        </ResponsiveContainer>
    );
}

export default StyledSingleBarChart;