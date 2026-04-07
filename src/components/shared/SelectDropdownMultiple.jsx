import React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';
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
  loading     = false,
  sx          = {},
}) {
  if (loading) {
    return (
      <Box sx={{ width: fullWidth ? '100%' : width, ...sx }}>
        <Skeleton
          variant="rounded"
          animation="wave"
          height={height}
          sx={{ borderRadius: '4px', mb: '23px' }}
        />
      </Box>
    );
  }

  const selectedOptions = options.filter((opt) =>
    Array.isArray(value) ? value.includes(opt.id) : false
  );

  // Multi-select needs minHeight instead of height so chips can wrap
  const multiSx = {
    ...fieldSx(height),
    '& .MuiOutlinedInput-root': {
      ...fieldSx(height)['& .MuiOutlinedInput-root'],
      height:    undefined,      // remove fixed height
      minHeight: `${height}px`, // allow growth when chips wrap
      padding:   '4px 10px !important',
    },
    '& .MuiInputBase-input': {
      fontSize: '0.8125rem',
      padding:  '4px 0 !important',
    },
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