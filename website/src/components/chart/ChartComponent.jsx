import React, { useRef, useEffect, useMemo } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ReferenceLine,
} from "recharts";

export default function ChartComponent({
    title,
    tableData = [],
    midLineLabel,
    UCL,
    LCL,
    USL,
    LSL,
    X_bar,
}) {
    const scrollRef = useRef(null);

    // Ensure all points are numbers & slice last 30 for scrolling
    const chartData = tableData
        .map((value, i) => ({
            sample: i + 1,
            value,
        }))
        .filter((d) => !isNaN(d.value))
        .slice(-30); // Keep last 30 points

    useEffect(() => {
        // Auto-scroll to the right to show the latest data points
        if (scrollRef.current) {
            scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
        }
    }, [chartData]);

    // Define widths for the container and the chart
    const pointWidth = 35; // Estimated width per data point
    const containerWidth = 10 * pointWidth; // Visible area for 10 points
    const chartWidth = Math.max(containerWidth, chartData.length * pointWidth); // Full width for all points

    // Compute Y-axis domain including all reference lines
    const yDomain = useMemo(() => {
        const values = chartData.map((d) => d.value);
        [UCL, LCL, USL, LSL, X_bar].forEach((line) => {
            if (typeof line === "number" && !isNaN(line)) {
                values.push(Number(line));
            }
        });

        if (values.length === 0) return ["auto", "auto"];

        const min = Math.min(...values);
        const max = Math.max(...values);

        // Add small padding for better readability
        const padding = (max - min) * 0.1 || 1;
        return [min - padding, max + padding];
    }, [chartData, UCL, LCL, USL, LSL, X_bar]);

    return (
        <div
            style={{
                backgroundColor: "#1f2937",
                padding: 10,
                borderRadius: 8,
                display: "inline-block",
            }}
        >
            <h4 style={{ color: "#9ca3af", textAlign: "center", marginBottom: 5 }}>
                {title}
            </h4>

            <div
                ref={scrollRef}
                style={{
                    overflowX: "auto",
                    overflowY: "hidden", // prevent vertical scroll
                    width: containerWidth,
                    scrollbarWidth: "none", // hide scrollbar for Firefox
                    msOverflowStyle: "none", // hide scrollbar for IE/Edge
                }}
            >
                {/* hide scrollbar for Webkit browsers */}
                <style>
                    {`
                        div::-webkit-scrollbar {
                          display: none;
                        }
                    `}
                </style>

                <LineChart
                    width={chartWidth}
                    height={200}
                    data={chartData}
                    margin={{ top: 10, right: 40, left: 0, bottom: 20 }}
                >
                    <CartesianGrid stroke="#374151" strokeDasharray="3 3" />

                    <XAxis
                        dataKey="sample"
                        tick={{ fill: "#9ca3af", fontSize: 12 }}
                        axisLine={{ stroke: "#4b5563" }}
                        tickLine={false}
                        label={{
                            value: "Sample Number",
                            position: "insideBottom",
                            offset: -10,
                            fill: "#9ca3af",
                        }}
                    />
                    <YAxis
                        domain={yDomain}
                        tick={{ fill: "#9ca3af", fontSize: 12 }}
                        axisLine={{ stroke: "#4b5563" }}
                        tickLine={false}
                        tickFormatter={(value) => Number(value).toFixed(3)} // ✅ always 3 decimal places
                        label={{
                            value: "Measurement Values",
                            angle: -90,
                            position: "insideLeft",
                            fill: "#9ca3af",
                            fontSize: 12,
                        }}
                    />

                    <Tooltip
                        contentStyle={{
                            backgroundColor: "#374151",
                            borderRadius: 5,
                            borderColor: "#6b7280",
                            color: "#fff",
                        }}
                        labelStyle={{ color: "#d1d5db" }}
                        itemStyle={{ color: "#f9fafb" }}
                        formatter={(value) => [Number(value).toFixed(3), "Value"]} // ✅ 3 decimals
                    />

                    {/* Spec/Control Limits */}
                    {typeof UCL === "number" && (
                        <ReferenceLine
                            y={UCL}
                            stroke="#FFFF00"
                            strokeDasharray="5 5"
                            label={{ value: "UCL", fill: "#FFFF00", position: "right" }}
                        />
                    )}
                    {typeof LCL === "number" && (
                        <ReferenceLine
                            y={LCL}
                            stroke="#FFFF00"
                            strokeDasharray="5 5"
                            label={{ value: "LCL", fill: "#FFFF00", position: "right" }}
                        />
                    )}
                    {typeof USL === "number" && (
                        <ReferenceLine
                            y={USL}
                            stroke="#f56565"
                            strokeDasharray="3 3"
                            label={{ value: "USL", fill: "#f56565", position: "right" }}
                        />
                    )}
                    {typeof LSL === "number" && (
                        <ReferenceLine
                            y={LSL}
                            stroke="#f56565"
                            strokeDasharray="3 3"
                            label={{ value: "LSL", fill: "#f56565", position: "right" }}
                        />
                    )}
                    {typeof X_bar === "number" && (
                        <ReferenceLine
                            y={X_bar}
                            stroke="#22c55e"
                            strokeDasharray="2 4"
                            label={{
                                value: midLineLabel ?? "X̄",
                                fill: "#22c55e",
                                position: "right",
                            }}
                        />
                    )}

                    <Line
                        type="linear"
                        dataKey="value"
                        stroke="#fff"
                        strokeWidth={2}
                        dot={{ r: 2 }}
                        isAnimationActive={false}
                    />
                </LineChart>
            </div>
        </div>
    );
}
