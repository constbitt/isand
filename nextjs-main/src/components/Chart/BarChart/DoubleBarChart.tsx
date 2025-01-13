import {Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import React from "react";
import BarCustomTooltip from "@/src/components/Chart/BarChart/BarCustomTooltip";

const StyledDoubleBarChart = ({ data, onClick, }: {
    data: {name: string, value1: number, value2: number}[],
    onClick: (_: any) => void
}) => {
    return (
        <ResponsiveContainer width={"100%"} height={"100%"}>
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
            >
                <CartesianGrid stroke="#f5f5f5"/>
                <XAxis type="number"/>
                <YAxis dataKey="name" type="category" width={200}/>
                <Tooltip content={BarCustomTooltip as any}/>
                <Bar dataKey="value1" barSize={20} fill="#413ea0"/>
                <Bar dataKey="value2" barSize={20} fill="#513ea0"/>
            </BarChart>
        </ResponsiveContainer>);
}

export default StyledDoubleBarChart