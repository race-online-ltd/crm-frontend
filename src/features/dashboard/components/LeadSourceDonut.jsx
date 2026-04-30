import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Box, Typography } from "@mui/material";
import DashboardPanel from "./DashboardPanel";

const COLORS = ["var(--crm-chart-blue)", "var(--crm-chart-teal)", "var(--crm-chart-coral)"];

export default function LeadSourceDonut({ data }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <DashboardPanel title="Lead source medium" className="crm-donut-panel">
      <Box className="crm-donut-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="82%" paddingAngle={2}>
              {data.map((entry, index) => <Cell key={entry.key} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={(value) => [`${value} leads`, "Count"]} />
          </PieChart>
        </ResponsiveContainer>
        <Box className="crm-donut-center">
          <Typography className="crm-donut-total">{total}</Typography>
          <Typography className="crm-donut-caption">Total leads</Typography>
        </Box>
      </Box>
      <Box className="crm-legend">
        {data.map((item, index) => (
          <Box className="crm-legend-item" key={item.key}>
            <span style={{ background: COLORS[index] }} />
            <Typography>{item.name}</Typography>
          </Box>
        ))}
      </Box>
    </DashboardPanel>
  );
}
