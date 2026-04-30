import React from "react";
import { Box, Button, ButtonBase, Popover, Typography } from "@mui/material";

const FALLBACK_MONTHS = ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];
const FISCAL_START_MONTH = 4;
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const toMonthStart = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
const toIsoMonth = (date) => toMonthStart(date).toISOString();
const getDateFromIndex = (index, startYear) => new Date(startYear, FISCAL_START_MONTH + index, 1);
const clampIndex = (index, maxIndex) => Math.min(Math.max(index, 0), maxIndex);

const parseRangeDate = (dateValue, fallbackDate) => {
  const parsed = dateValue ? new Date(dateValue) : fallbackDate;
  return Number.isNaN(parsed.getTime()) ? fallbackDate : toMonthStart(parsed);
};

const formatYM = (year, month) => `${MONTH_LABELS[month - 1]} ${year}`;
const getMonthYear = (index, startYear = 2025) =>
  getDateFromIndex(index, startYear).toLocaleDateString("en-US", { month: "short", year: "numeric" });

function buildMonthItems(months, startYear) {
  const source = Array.isArray(months) && months.length ? months : FALLBACK_MONTHS;
  return source.map((item, index) => {
    const date = getDateFromIndex(index, startYear);
    return {
      index,
      date,
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      label: typeof item === "string" ? item : item?.month || MONTH_LABELS[date.getMonth()],
      key: `${date.getFullYear()}-${date.getMonth() + 1}`,
    };
  });
}

function groupMonthsByYear(items) {
  return items.reduce((acc, item) => {
    if (!acc[item.year]) {
      acc[item.year] = [];
    }
    acc[item.year].push(item);
    return acc;
  }, {});
}

export default function MonthRangePicker({
  months = [],
  value = { start: 0, end: 11 },
  onChange,
  startYear = 2025,
  disabled = false,
}) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const monthItems = React.useMemo(() => buildMonthItems(months, startYear), [months, startYear]);
  const groupedMonths = React.useMemo(() => groupMonthsByYear(monthItems), [monthItems]);
  const maxIndex = Math.max(monthItems.length - 1, 0);
  const startIndex = clampIndex(Number.isFinite(Number(value?.start)) ? Number(value.start) : 0, maxIndex);
  const endIndex = clampIndex(Number.isFinite(Number(value?.end)) ? Number(value.end) : maxIndex, maxIndex);
  const startDate = parseRangeDate(value?.startDate, getDateFromIndex(startIndex, startYear));
  const endDate = parseRangeDate(value?.endDate, getDateFromIndex(endIndex, startYear));
  const [draftRange, setDraftRange] = React.useState({ start: startIndex, end: endIndex });
  const [selectionAnchor, setSelectionAnchor] = React.useState(null);

  React.useEffect(() => {
    if (!anchorEl) {
      setDraftRange({ start: startIndex, end: endIndex });
      setSelectionAnchor(null);
    }
  }, [anchorEl, startIndex, endIndex]);

  const label = `${formatYM(startDate.getFullYear(), startDate.getMonth() + 1)} – ${formatYM(endDate.getFullYear(), endDate.getMonth() + 1)}`;

  const commitRange = React.useCallback((nextRange) => {
    const orderedStart = Math.min(nextRange.start, nextRange.end);
    const orderedEnd = Math.max(nextRange.start, nextRange.end);
    const fromDate = getDateFromIndex(orderedStart, startYear);
    const toDate = getDateFromIndex(orderedEnd, startYear);

    onChange?.({
      start: orderedStart,
      end: orderedEnd,
      startDate: toIsoMonth(fromDate),
      endDate: toIsoMonth(toDate),
    });
  }, [onChange, startYear]);

  const openPicker = (event) => {
    if (disabled) return;
    setDraftRange({ start: startIndex, end: endIndex });
    setSelectionAnchor(null);
    setAnchorEl(event.currentTarget);
  };

  const closePicker = () => {
    setAnchorEl(null);
    setSelectionAnchor(null);
  };

  const handleMonthClick = (index) => {
    if (selectionAnchor === null) {
      setSelectionAnchor(index);
      setDraftRange({ start: index, end: index });
      return;
    }

    setDraftRange({
      start: Math.min(selectionAnchor, index),
      end: Math.max(selectionAnchor, index),
    });
    setSelectionAnchor(null);
  };

  const handleApply = () => {
    commitRange(draftRange);
    closePicker();
  };

  const handleReset = () => {
    const resetRange = { start: 0, end: maxIndex };
    setDraftRange(resetRange);
    setSelectionAnchor(null);
    commitRange(resetRange);
  };

  const isOpen = Boolean(anchorEl);
  const orderedDraftStart = Math.min(draftRange.start, draftRange.end);
  const orderedDraftEnd = Math.max(draftRange.start, draftRange.end);

  return (
    <Box className="crm-month-range-picker">
      <ButtonBase
        className="crm-month-range-field"
        onClick={openPicker}
        disabled={disabled}
        aria-haspopup="dialog"
      >
        <span className="crm-month-range-label">Month Range</span>
        <span className="crm-month-range-value">{label}</span>
      </ButtonBase>

      <Popover
        open={isOpen}
        anchorEl={anchorEl}
        onClose={closePicker}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          paper: {
            className: "crm-month-range-popover",
          },
        }}
      >
        <Box className="crm-month-range-panel">
          <Box className="crm-month-range-summary">
            <Box>
              <Typography className="crm-month-range-summary-label">From</Typography>
              <Typography className="crm-month-range-summary-value">
                {getMonthYear(orderedDraftStart, startYear)}
              </Typography>
            </Box>
            <Box>
              <Typography className="crm-month-range-summary-label">To</Typography>
              <Typography className="crm-month-range-summary-value">
                {getMonthYear(orderedDraftEnd, startYear)}
              </Typography>
            </Box>
          </Box>

          {Object.entries(groupedMonths).map(([year, items]) => (
            <Box key={year} className="crm-month-range-section">
              <Typography className="crm-month-range-year">{year}</Typography>
              <Box className="crm-month-grid">
                {items.map((item) => {
                  const isSelected = item.index === orderedDraftStart || item.index === orderedDraftEnd;
                  const isInRange = item.index >= orderedDraftStart && item.index <= orderedDraftEnd;

                  return (
                    <ButtonBase
                      key={item.key}
                      className={`crm-month-cell${isSelected ? " is-selected" : ""}${!isSelected && isInRange ? " is-in-range" : ""}`}
                      onClick={() => handleMonthClick(item.index)}
                    >
                      {item.label}
                    </ButtonBase>
                  );
                })}
              </Box>
            </Box>
          ))}

          <Box className="crm-month-range-actions">
            <Button className="crm-filter-reset" onClick={handleReset}>
              Reset
            </Button>
            <Button className="crm-filter-apply" variant="contained" onClick={handleApply}>
              Apply
            </Button>
          </Box>
        </Box>
      </Popover>
    </Box>
  );
}
