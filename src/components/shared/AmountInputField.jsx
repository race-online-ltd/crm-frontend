// src/components/shared/AmountInputField.jsx
import React from 'react';
import TextField        from '@mui/material/TextField';
import InputAdornment   from '@mui/material/InputAdornment';
import { fieldSx }      from './SelectDropdownSingle';

const FIELD_HEIGHT = 45;

export default function AmountInputField({
  name,
  label,
  value,
  onChange,
  onBlur,
  error        = false,
  helperText   = '',
  fullWidth    = true,
  currencySymbol = '৳',
  sx           = {},
  ...rest
}) {
  const handleChange = (e) => {
    let val = e.target.value.replace(/[^0-9.]/g, '');
    const parts = val.split('.');
    if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
    e.target.value = val;
    onChange(e);
  };

  return (
    <TextField
      name={name}
      label={label}
      value={value}
      onChange={handleChange}
      onBlur={onBlur}
      error={error}
      helperText={helperText}
      variant="outlined"
      fullWidth={fullWidth}
      size="small"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">{currencySymbol}</InputAdornment>
        ),
      }}
      sx={{
        width: fullWidth ? '100%' : '240px',
        ...fieldSx(FIELD_HEIGHT),
        ...sx,
      }}
      {...rest}
    />
  );
}