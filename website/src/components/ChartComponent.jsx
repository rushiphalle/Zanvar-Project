import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from "recharts";

export default function ChartComponent({
  title,
  tableData = [],
  midLineLabel,
  UCL_X,
  LCL_X,
  USL,
  LSL,
  X_bar
}) {
  // Process data - keep it simple, just ensure it's in the right format
  const chartData = tableData
    .map((point, i) => ({
      sample: i + 1,
      value: Number(point.value)
    }))
    .slice(-10); // Keep last 10 points

  // Use backend values for reference lines if provided, otherwise use defaults
  const uclValue = UCL_X ?? 30;
  const lclValue = LCL_X ?? 20;
  const uslValue = USL ?? 28;
  const lslValue = LSL ?? 22;
  const midLineValue = X_bar ?? 25;

  return (
    <div
      style={{
        backgroundColor: "#1f2937",
        padding: 10,
        borderRadius: 8,
        display: "inline-block"
      }}
    >
      <h4 style={{ color: "#9ca3af", textAlign: "center", marginBottom: 5 }}>
        {title}
      </h4>
      <LineChart
        width={320}
        height={180}
        data={chartData}
        margin={{ top: 10, right: 40, left: 0, bottom: 20 }}
      >
        <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
        <XAxis
          dataKey="sample"
          type="number"
          domain={["dataMin", "dataMax"]}
          tickCount={Math.min(10, chartData.length)}
          tick={{ fill: "#9ca3af", fontSize: 12 }}
          tickLine={false}
          label={{
            value: "Sample Number",
            position: "insideBottom",
            offset: -10,
            fill: "#6b7280"
          }}
          axisLine={{ stroke: "#4b5563" }}
        />
        <YAxis
          domain={['auto', 'auto']}  // Let Recharts determine the best scale
          tick={{ fill: "#9ca3af", fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: "#4b5563" }}
          tickFormatter={(value) => value.toFixed(2)}
          allowDecimals
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#374151",
            borderRadius: 5,
            borderColor: "#6b7280",
            color: "#fff"
          }}
          labelStyle={{ color: "#d1d5db" }}
          itemStyle={{ color: "#f9fafb" }}
          formatter={(value) => [value.toFixed(4), 'Value']} // Show more decimal places in tooltip
        />

        {/* UCL Line */}
        <ReferenceLine
          y={uclValue}
          stroke="#FFFF00"
          strokeDasharray="5 5"
          strokeWidth={2}
          label={{
            value: `UCL`,
            position: "right",
            fill: "#FFFF00",
            fontSize: 14,
            fontWeight: "bold"
          }}
        />

        {/* LCL Line */}
        <ReferenceLine
          y={lclValue}
          stroke="#FFFF00"
          strokeDasharray="5 5"
          strokeWidth={2}
          label={{
            value: `LCL`,
            position: "right",
            fill: "#FFFF00",
            fontSize: 14,
            fontWeight: "bold"
          }}
        />

        {/* USL Line */}
        <ReferenceLine
          y={uslValue}
          stroke="#f56565"
          strokeDasharray="3 3"
          strokeWidth={2}
          label={{
            value: `USL`,
            position: "right",
            fill: "#f56565",
            fontSize: 14,
            fontWeight: "bold"
          }}
        />

        {/* LSL Line */}
        <ReferenceLine
          y={lslValue}
          stroke="#f56565"
          strokeDasharray="3 3"
          strokeWidth={2}
          label={{
            value: `LSL`,
            position: "right",
            fill: "#f56565",
            fontSize: 14,
            fontWeight: "bold"
          }}
        />

        {/* Midline (Green Dotted) */}
        <ReferenceLine
          y={midLineValue}
          stroke="#22c55e"
          strokeDasharray="2 4"
          strokeWidth={2}
          label={{
            position: "right",
            value: midLineLabel ?? "-BAR",
            fill: "#22c55e",
            fontSize: 14,
            fontWeight: "bold"
          }}
        />

        <Line
          type="monotone"
          dataKey="value"
          stroke="#fff"
          strokeWidth={2}
          dot={{ fill: "#fff", stroke: "#fff" }}
        />
      </LineChart>
    </div>
  );
}