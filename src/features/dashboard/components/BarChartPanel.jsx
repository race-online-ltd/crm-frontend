import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import DashboardPanel from "./DashboardPanel";

export default function BarChartPanel({ title, data, bars, valueSuffix = "" }) {
  return (
    <DashboardPanel title={title}>
      <div className="crm-chart-box">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 6, left: -24, bottom: 0 }}>
            <CartesianGrid strokeDasharray="2 6" stroke="var(--crm-grid)" vertical={false} />
            <XAxis dataKey={data[0]?.month ? "month" : "quarter"} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={(value) => `${value}${valueSuffix}`} />
            <Tooltip cursor={{ fill: "var(--crm-hover)" }} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
            {bars.map((bar) => (
              <Bar key={bar.key} dataKey={bar.key} name={bar.name} fill={bar.color} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </DashboardPanel>
  );
}
