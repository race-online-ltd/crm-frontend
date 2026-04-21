import React from 'react';
import { isValid } from 'date-fns';
import PeriodPickerField from '../../../components/shared/date-picker/PeriodPickerField';

function toPeriodValue(value) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (!isValid(date)) {
    return null;
  }

  return {
    year: date.getFullYear(),
    month: date.getMonth(),
  };
}

function toMonthDate(value) {
  if (!value || typeof value !== 'object') {
    return null;
  }

  if (!Number.isFinite(Number(value.year)) || !Number.isFinite(Number(value.month))) {
    return null;
  }

  return new Date(Number(value.year), Number(value.month), 1);
}

export default function MonthPickerField({
  label = 'Target Month',
  value = null,
  onChange,
  disablePast = false,
  ...props
}) {
  return (
    <PeriodPickerField
      {...props}
      mode="monthly"
      label={label}
      value={toPeriodValue(value)}
      onChange={(nextValue) => onChange?.(toMonthDate(nextValue))}
      disablePast={disablePast}
    />
  );
}
