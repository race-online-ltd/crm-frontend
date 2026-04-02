// src/components/shared/charts/BarChart.jsx
import React from "react";
import { Paper, Typography, Box, useTheme } from "@mui/material";
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function BarChart({
  title = "Bar Chart",
  data = [],
  xKey = "name",
  bars = [
    { dataKey: "value", name: "Value", color: "#1976d2", yAxisId: "left" },
  ],
  height = 350,
}) {
  const theme = useTheme();

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        width: "100%",
        borderRadius: 2,
        backgroundColor: theme.palette.background.paper,
      }}
    >
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
          <ReBarChart
            data={data}
            margin={{ top: 20, right: 40, left: 0, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="4 4" stroke={theme.palette.divider} />
            <XAxis
              dataKey={xKey}
              stroke={theme.palette.text.secondary}
              tick={{ fontSize: 12 }}
              padding={{ left: 10, right: 10 }}
            />
            <YAxis
              yAxisId="left"
              stroke={theme.palette.text.secondary}
              tick={{ fontSize: 12 }}
              width={50}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke={theme.palette.text.secondary}
              tick={{ fontSize: 12 }}
              width={50}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: "1px solid " + theme.palette.divider,
                borderRadius: 4,
              }}
              labelStyle={{ fontWeight: "bold" }}
            />
            <Legend verticalAlign="top" height={36} />

            {bars.map((bar) => (
              <Bar
                key={bar.dataKey}
                yAxisId={bar.yAxisId || "left"}
                dataKey={bar.dataKey}
                name={bar.name}
                fill={bar.color}
                radius={[4, 4, 0, 0]} // rounded top corners
                barSize={40}
              />
            ))}
          </ReBarChart>
        </ResponsiveContainer>
      )}
    </Paper>
  );
}
