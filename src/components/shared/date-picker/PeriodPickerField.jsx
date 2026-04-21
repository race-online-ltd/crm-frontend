import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  endOfMonth,
  endOfQuarter,
  endOfYear,
  isBefore,
  startOfMonth,
  startOfQuarter,
  startOfYear,
} from 'date-fns';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Tooltip } from '@mui/material';
import './PeriodPickerField.css';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];

function getValueYear(value) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (value && typeof value === 'object' && Number.isFinite(Number(value.year))) {
    return Number(value.year);
  }

  return null;
}

function isPastMonth(monthDate) {
  return isBefore(endOfMonth(monthDate), startOfMonth(new Date()));
}

function isPastQuarter(year, quarter) {
  const quarterStart = startOfQuarter(new Date(year, (quarter - 1) * 3, 1));
  return isBefore(endOfQuarter(quarterStart), startOfQuarter(new Date()));
}

function isPastYear(year) {
  return isBefore(endOfYear(new Date(year, 0, 1)), startOfYear(new Date()));
}

export default function PeriodPickerField({
  mode = 'monthly',
  value = null,
  onChange,
  placeholder = 'Select period',
  label = 'Period',
  className = '',
  disabled = false,
  readOnly = false,
  disablePast = false,
  error = false,
  helperText = ' ',
  tooltipText = '',
}) {
  const wrapperRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [yearOffset, setYearOffset] = useState(0);
  const [rangeOffset, setRangeOffset] = useState(0);

  const selectedYear = useMemo(() => getValueYear(value) ?? new Date().getFullYear(), [value]);
  const activeYear = selectedYear + yearOffset;
  const rangeStart = selectedYear - 5 + rangeOffset;

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const displayValue = useMemo(() => {
    if (!value) {
      return '';
    }

    if (mode === 'yearly') {
      return String(typeof value === 'number' ? value : value?.year ?? '');
    }

    const year = getValueYear(value);
    if (!year || typeof value !== 'object') {
      return '';
    }

    if (mode === 'quarterly') {
      if (!Number.isFinite(Number(value.quarter))) {
        return '';
      }

      return `Q${value.quarter} ${year}`;
    }

    if (typeof value.month !== 'number') {
      return '';
    }

    return `${MONTHS[value.month] || ''} ${year}`.trim();
  }, [mode, value]);

  const handleToggle = () => {
    if (disabled || readOnly) {
      return;
    }

    setOpen((prev) => !prev);
  };

  const handleClear = (event) => {
    event.stopPropagation();
    if (disabled || readOnly) {
      return;
    }

    onChange?.(null);
    setOpen(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggle();
    }
  };

  const handleSelectMonth = (month) => {
    onChange?.({ year: activeYear, month });
    setYearOffset(0);
    setOpen(false);
  };

  const handleSelectQuarter = (quarter) => {
    onChange?.({ year: activeYear, quarter });
    setYearOffset(0);
    setOpen(false);
  };

  const handleSelectYear = (year) => {
    onChange?.(year);
    setRangeOffset(0);
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className={`period-picker ${className}`.trim()}>
      <div
        className={[
          'period-picker__control',
          open ? 'period-picker__control--open' : '',
          disabled || readOnly ? 'period-picker__control--disabled' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        role="button"
        tabIndex={disabled || readOnly ? -1 : 0}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={label}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
      >
        <span className="period-picker__icon" aria-hidden="true">
          <CalendarMonthIcon sx={{ fontSize: 18 }} />
        </span>

        <span className={`period-picker__value ${displayValue ? '' : 'period-picker__placeholder'}`}>
          {displayValue || placeholder}
        </span>

        <span className="period-picker__meta">
          {tooltipText ? (
            <Tooltip title={tooltipText} arrow placement="top">
              <button
                type="button"
                className="period-picker__info"
                tabIndex={-1}
                aria-label="Period info"
                onClick={(event) => event.stopPropagation()}
              >
                <InfoOutlinedIcon sx={{ fontSize: 16 }} />
              </button>
            </Tooltip>
          ) : null}
          {value ? (
            <button
              type="button"
              className="period-picker__clear"
              aria-label="Clear selected period"
              onClick={handleClear}
              disabled={disabled || readOnly}
            >
              ×
            </button>
          ) : null}
        </span>
      </div>

      {open ? (
        <div className="period-picker__dropdown" role="dialog" aria-label={`${label} options`}>
          <div className="period-picker__arrow" />

          {mode !== 'yearly' ? (
            <>
              <div className="period-picker__header">
                <button type="button" className="period-picker__nav-button" onClick={() => setYearOffset((offset) => offset - 1)}>
                  &#8249;
                </button>
                <div className="period-picker__title">{activeYear}</div>
                <button type="button" className="period-picker__nav-button" onClick={() => setYearOffset((offset) => offset + 1)}>
                  &#8250;
                </button>
              </div>

              {mode === 'quarterly' ? (
                <div className="period-picker__grid period-picker__grid--four">
                  {QUARTERS.map((quarterLabel, index) => {
                    const quarter = index + 1;
                    const disabledQuarter = disablePast && isPastQuarter(activeYear, quarter);
                    const selected = typeof value === 'object'
                      && value?.year === activeYear
                      && value?.quarter === quarter;

                    return (
                      <button
                        key={quarterLabel}
                        type="button"
                        className={[
                          'period-picker__cell',
                          selected ? 'period-picker__cell--selected' : '',
                          disabledQuarter ? 'period-picker__cell--disabled' : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        onClick={() => {
                          if (!disabledQuarter) {
                            handleSelectQuarter(quarter);
                          }
                        }}
                        disabled={disabledQuarter}
                      >
                        {quarterLabel}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="period-picker__grid period-picker__grid--three">
                  {MONTHS.map((monthLabel, month) => {
                    const monthDate = new Date(activeYear, month, 1);
                    const disabledMonth = disablePast && isPastMonth(monthDate);
                    const selected = typeof value === 'object'
                      && value?.year === activeYear
                      && value?.month === month;

                    return (
                      <button
                        key={monthLabel}
                        type="button"
                        className={[
                          'period-picker__cell',
                          selected ? 'period-picker__cell--selected' : '',
                          disabledMonth ? 'period-picker__cell--disabled' : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        onClick={() => {
                          if (!disabledMonth) {
                            handleSelectMonth(month);
                          }
                        }}
                        disabled={disabledMonth}
                      >
                        {monthLabel}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="period-picker__header">
                <button type="button" className="period-picker__nav-button" onClick={() => setRangeOffset((offset) => offset - 12)}>
                  &#8249;
                </button>
                <div className="period-picker__title">
                  {rangeStart} - {rangeStart + 11}
                </div>
                <button type="button" className="period-picker__nav-button" onClick={() => setRangeOffset((offset) => offset + 12)}>
                  &#8250;
                </button>
              </div>

              <div className="period-picker__grid period-picker__grid--three">
                {Array.from({ length: 12 }, (_, index) => rangeStart + index).map((year) => {
                  const disabledYear = disablePast && isPastYear(year);
                  const selected = (typeof value === 'number' ? value : value?.year) === year;

                  return (
                    <button
                      key={year}
                      type="button"
                      className={[
                        'period-picker__cell',
                        selected ? 'period-picker__cell--selected' : '',
                        disabledYear ? 'period-picker__cell--disabled' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => {
                        if (!disabledYear) {
                          handleSelectYear(year);
                        }
                      }}
                      disabled={disabledYear}
                    >
                      {year}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      ) : null}

      <div className={`period-picker__helper ${error ? 'period-picker__helper--error' : ''}`.trim()}>
        {helperText}
      </div>
    </div>
  );
}
