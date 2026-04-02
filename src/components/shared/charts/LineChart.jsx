// src/components/shared/charts/MultiLineChart.jsx
import React from "react";
import { Paper, Typography, Box } from "@mui/material";
import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function LineChart({
  title = "Line Chart",
  data = [], // array of objects from backend
  xKey = "name", // x-axis key
  lines = [
    // define each line
    { dataKey: "value", name: "Value", color: "#1976d2" },
  ],
  height = 300,
}) {
  return (
    <Paper elevation={2} sx={{ p: 2, width: "100%" }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>

      {data.length === 0 ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height={height}
        >
          <Typography variant="body2" color="textSecondary">
            No data available
          </Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <ReLineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            {lines.map((line) => (
              <Line
                key={line.dataKey}
                type="monotone"
                dataKey={line.dataKey}
                name={line.name}
                stroke={line.color}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </ReLineChart>
        </ResponsiveContainer>
      )}
    </Paper>
  );
}
