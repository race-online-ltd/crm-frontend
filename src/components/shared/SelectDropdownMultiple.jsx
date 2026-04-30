//src/components/shared/SelectDropdownMultiple.jsx
import React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { fieldSx } from './SelectDropdownSingle';

export default function SelectDropdownMultiple({
  name,
  label       = 'Select Items',
  placeholder = '',
  options     = [],
  value       = [],
  onChange,
  onBlur,
  error       = false,
  helperText  = ' ',
  limitTags   = 2,
  disabled    = false,
  searchable  = true,
  height      = 45,
  fullWidth   = true,
  width       = 240,
  fixedHeight = false,
  sx          = {},
}) {
  const selectedOptions = options.filter((opt) =>
    Array.isArray(value) ? value.includes(opt.id) : false
  );

  // Multi-select needs minHeight instead of height so chips can wrap
  const multiSx = {
    ...fieldSx(height),
    '& .MuiOutlinedInput-root': {
      ...fieldSx(height)['& .MuiOutlinedInput-root'],
      height: fixedHeight ? `${height}px` : undefined,
      minHeight: `${height}px`,
      padding:   '4px 10px !important',
      ...(fixedHeight ? {
        flexWrap: 'nowrap',
        overflow: 'hidden',
      } : {}),
    },
    '& .MuiInputBase-input': {
      fontSize: '0.8125rem',
      padding:  '4px 0 !important',
    },
    ...(fixedHeight ? {
      '& .MuiAutocomplete-inputRoot': {
        flexWrap: 'nowrap !important',
      },
      '& .MuiAutocomplete-tag': {
        maxWidth: 'calc(100% - 56px)',
        margin: '2px 4px 2px 0',
      },
      '& .MuiAutocomplete-endAdornment': {
        right: 10,
      },
    } : {}),
  };

  return (
    <Autocomplete
      multiple
      limitTags={limitTags}
      options={options}
      disabled={disabled}
      readOnly={!searchable}
      isOptionEqualToValue={(option, val) => option.id === val.id}
      value={selectedOptions}
      onChange={(_, newValues) => onChange?.(newValues.map((v) => v.id))}
      onBlur={onBlur}
      getOptionLabel={(option) => option.label || ''}
      sx={{ width: fullWidth ? '100%' : width, ...sx }}
      renderInput={(params) => (
        <TextField
          {...params}
          name={name}
          label={label}
          placeholder={placeholder}
          size="small"
          fullWidth={fullWidth}
          error={error}
          helperText={helperText}
          sx={multiSx}
        />
      )}
    />
  );
}
