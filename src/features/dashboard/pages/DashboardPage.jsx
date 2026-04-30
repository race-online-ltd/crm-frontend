import { useMemo, useState } from "react";
import { Box, Button, Drawer, IconButton, Typography } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import { DashboardProvider } from "../context/DashboardContext";
import { useDashboard } from "../hooks/useDashboard";
import MetricCards from "../components/MetricCards";
import LeadSourceDonut from "../components/LeadSourceDonut";
import CrmDataTable from "../components/CrmDataTable";
import BarChartPanel from "../components/BarChartPanel";
import SelectDropdownMultiple from "../../../components/shared/SelectDropdownMultiple";
import MonthRangePicker from "../../../components/shared/MonthRangePicker";
import "./DashboardPage.css";

const blue = "var(--crm-chart-blue)";
const sky = "var(--crm-chart-sky)";
const purple = "var(--crm-chart-purple)";
const coral = "var(--crm-chart-coral)";
const FISCAL_START_MONTH = 4;
const FISCAL_START_YEAR = 2025;

function percent(achievement, target) {
  return (achievement / target) * 100;
}

const formatRangeLabel = (months, range) => {
  if (range.startDate && range.endDate) {
    const startDate = new Date(range.startDate);
    const endDate = new Date(range.endDate);
    if (!Number.isNaN(startDate.getTime()) && !Number.isNaN(endDate.getTime())) {
      const start = startDate.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      const end = endDate.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      return start === end ? start : `${start} – ${end}`;
    }
  }

  const startYear = range.start < 8 ? 2025 : 2026;
  const endYear = range.end < 8 ? 2025 : 2026;
  const start = `${months[range.start]?.month || "May"} ${startYear}`;
  const end = `${months[range.end]?.month || "Apr"} ${endYear}`;
  return start === end ? start : `${start} – ${end}`;
};

const scaleNumber = (value, factor) => Math.max(0, Math.round(value * factor));

const scaleMoney = (value, factor) => Math.max(0, Math.round(value * factor));

const toMonthDateValue = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01T12:00:00`;

const getCurrentMonthRange = (monthCount) => {
  const today = new Date();
  const currentIndex = (today.getFullYear() - FISCAL_START_YEAR) * 12 + today.getMonth() - FISCAL_START_MONTH;
  const index = Math.min(Math.max(currentIndex, 0), Math.max(monthCount - 1, 0));
  const date = new Date(FISCAL_START_YEAR, FISCAL_START_MONTH + index, 1, 12);

  return {
    start: index,
    end: index,
    startDate: toMonthDateValue(date),
    endDate: toMonthDateValue(date),
  };
};

const scaleMetrics = (metrics, factor, slicedMonths) => {
  const won = slicedMonths.reduce((sum, item) => sum + item.won, 0);
  const lost = slicedMonths.reduce((sum, item) => sum + item.lost, 0);
  const pipeline = scaleNumber(won + lost + slicedMonths.reduce((sum, item) => sum + item.invoice * 100, 0), factor);
  const clients = scaleNumber(486, factor);
  const kam = scaleNumber(32, Math.min(1, factor + 0.18));
  const pending = scaleNumber(27, factor);
  const overdue = scaleNumber(19, factor);
  const winRate = won + lost ? ((won / (won + lost)) * 100).toFixed(2) : "0.00";

  return metrics.map((metric) => {
    const values = {
      Pipeline: pipeline.toLocaleString("en-US"),
      "Won Leads": scaleNumber(won, factor).toLocaleString("en-US"),
      "Lost Leads": scaleNumber(lost, factor).toLocaleString("en-US"),
      "Win Rate": `${winRate}%`,
      Client: clients.toLocaleString("en-US"),
      KAM: kam.toLocaleString("en-US"),
      "Approval Pending": pending.toLocaleString("en-US"),
      "Task Overdue": overdue.toLocaleString("en-US"),
    };
    return { ...metric, value: values[metric.label] ?? metric.value };
  });
};

function DashboardContent() {
  const data = useDashboard();
  const defaultMonthRange = useMemo(() => getCurrentMonthRange(data.monthly.length), [data.monthly.length]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedEntities, setSelectedEntities] = useState([]);
  const [monthRange, setMonthRange] = useState(defaultMonthRange);
  const [draftEntities, setDraftEntities] = useState([]);
  const [draftMonthRange, setDraftMonthRange] = useState(defaultMonthRange);
  const entityOptions = useMemo(() => data.entities.map((item) => ({ id: item.entity, label: item.entity })), [data.entities]);
  const filteredData = useMemo(() => {
    const entityFactor = selectedEntities.length ? selectedEntities.length / data.entities.length : 1;
    const slicedMonths = data.monthly.slice(monthRange.start, monthRange.end + 1);
    const monthFactor = slicedMonths.length / data.monthly.length;
    const factor = entityFactor * monthFactor;

    return {
      metrics: scaleMetrics(data.metrics, entityFactor, slicedMonths),
      leadSources: data.leadSources.map((item) => ({ ...item, value: scaleNumber(item.value, factor) })),
      leadChannels: data.leadChannels.map((item) => ({
        ...item,
        leads: scaleNumber(item.leads, factor),
        active: scaleNumber(item.active, factor),
        won: scaleNumber(item.won, factor),
        lost: scaleNumber(item.lost, factor),
        cancelled: scaleNumber(item.cancelled, factor),
      })),
      monthly: slicedMonths.map((item) => ({
        ...item,
        won: scaleNumber(item.won, entityFactor),
        lost: scaleNumber(item.lost, entityFactor),
        invoice: Number((item.invoice * entityFactor).toFixed(2)),
      })),
      topPerformers: data.topPerformers.map((item) => ({
        ...item,
        achievement: scaleMoney(item.achievement, factor),
      })),
      revenueGenerators: data.revenueGenerators.map((item) => ({ ...item, invoice: scaleMoney(item.invoice, factor) })),
    };
  }, [data, selectedEntities, monthRange]);
  const filteredPerformerRows = filteredData.topPerformers.map((item, index) => ({
    ...item,
    target: data.topPerformers[index].target,
    percent: percent(item.achievement, data.topPerformers[index].target),
  }));
  const entityRows = data.entities.map((item) => ({
    ...item,
    monthlyPercent: percent(item.monthlyAchievement, item.monthlyTarget),
    quarterlyPercent: percent(item.quarterlyAchievement, item.quarterlyTarget),
  }));

  return (
    <Box className="crm-dashboard">
      <Box className="crm-dashboard-heading">
        <Box>
          <Typography component="h1" className="crm-title">Dashboard</Typography>
        </Box>
        <Box className="crm-header-actions">
          <Typography className="crm-date-pill">{formatRangeLabel(data.monthly, monthRange)}</Typography>
          <IconButton className="crm-filter-button" onClick={() => {
            setDraftEntities(selectedEntities);
            setDraftMonthRange(monthRange);
            setFilterOpen(true);
          }} aria-label="Open filters">
            <FilterListIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <Drawer anchor="right" open={filterOpen} onClose={() => setFilterOpen(false)}>
        <Box className="crm-filter-drawer" role="presentation">
          <Typography component="h2" className="crm-filter-title">Filters</Typography>
          <SelectDropdownMultiple
            name="businessEntity"
            label="Business Entity"
            placeholder="Select entities"
            options={entityOptions}
            value={draftEntities}
            onChange={setDraftEntities}
            fixedHeight
          />
          <MonthRangePicker months={data.monthly} value={draftMonthRange} onChange={setDraftMonthRange} />
          <Box className="crm-filter-actions">
            <Button className="crm-filter-reset" onClick={() => {
              setDraftEntities([]);
              setDraftMonthRange(defaultMonthRange);
            }}>
              Reset filters
            </Button>
            <Button className="crm-filter-apply" variant="contained" onClick={() => {
              setSelectedEntities(draftEntities);
              setMonthRange(draftMonthRange);
              setFilterOpen(false);
            }}>
              Apply
            </Button>
          </Box>
        </Box>
      </Drawer>

      <Box className="crm-top-grid">
        <MetricCards metrics={filteredData.metrics} />
        <LeadSourceDonut data={filteredData.leadSources} />
      </Box>

      <CrmDataTable
        title="Lead Channels"
        columns={[
          { key: "channel", label: "Channel Name" },
          { key: "leads", label: "Lead Count", heat: "blue" },
          { key: "active", label: "Active", heat: "green" },
          { key: "won", label: "WON", heat: "sky" },
          { key: "lost", label: "Lost", heat: "orange" },
          { key: "cancelled", label: "Cancelled", heat: "purple" },
        ]}
        rows={filteredData.leadChannels}
      />

      <Box className="crm-two-col">
        <BarChartPanel title="WON Vs LOST" data={filteredData.monthly} bars={[{ key: "won", name: "Won", color: blue }, { key: "lost", name: "Lost", color: coral }]} />
        <BarChartPanel title="Won Lead Vs Invoice" data={filteredData.monthly} valueSuffix="M" bars={[{ key: "won", name: "Won leads", color: sky }, { key: "invoice", name: "Invoice ($M)", color: purple }]} />
      </Box>

      <Box className="crm-two-col">
        <BarChartPanel title="Target Vs Achievement — Last 12 Months" data={data.monthly} valueSuffix="M" bars={[{ key: "target", name: "Target ($M)", color: blue }, { key: "achievement", name: "Achievement ($M)", color: sky }]} />
        <BarChartPanel title="Target Vs Achievement — Last 4 Quarters" data={data.quarters} valueSuffix="M" bars={[{ key: "target", name: "Target ($M)", color: purple }, { key: "achievement", name: "Achievement ($M)", color: blue }]} />
      </Box>

      <Box className="crm-two-col crm-table-pair">
        <CrmDataTable
          title="Top Performers"
          compact
          columns={[
            { key: "kam", label: "KAM" },
            { key: "target", label: "Target ($)", type: "money", heat: "blue" },
            { key: "achievement", label: "Achievement ($)", type: "money", heat: "green" },
            { key: "percent", label: "Achievement (%)", type: "percent", heat: "sky" },
          ]}
          rows={filteredPerformerRows}
        />
        <CrmDataTable
          title="Top Revenue Generator"
          compact
          columns={[
            { key: "kam", label: "KAM" },
            { key: "invoice", label: "Invoice Amount", type: "money", heat: "blue" },
          ]}
          rows={filteredData.revenueGenerators}
        />
      </Box>

      <CrmDataTable
        title="Business Entity Overview"
        className="crm-entity-table"
        columns={[
          { key: "entity", label: "Business Entity" },
          { key: "leads", label: "Lead Count", heat: "blue" },
          { key: "active", label: "Active", heat: "green" },
          { key: "won", label: "WON", heat: "sky" },
          { key: "lost", label: "Lost", heat: "orange" },
          { key: "cancelled", label: "Cancelled", heat: "purple" },
          { key: "monthlyTarget", label: "Target (Monthly)", type: "money", heat: "blue" },
          { key: "monthlyAchievement", label: "Achievement (Monthly)", type: "money", heat: "green" },
          { key: "monthlyPercent", label: "Achievement (%) (Monthly)", type: "percent", heat: "sky" },
          { key: "quarterlyTarget", label: "Target (Quarterly)", type: "money", heat: "blue" },
          { key: "quarterlyAchievement", label: "Achievement (Quarterly)", type: "money", heat: "green" },
          { key: "quarterlyPercent", label: "Achievement (%) (Quarterly)", type: "percent", heat: "sky" },
          { key: "invoice", label: "Invoice", type: "money", heat: "purple" },
        ]}
        rows={entityRows}
        compact
      />
    </Box>
  );
}

export default function DashboardPage() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}
