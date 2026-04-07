import React, { useEffect, useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Skeleton from '@mui/material/Skeleton';

const LIGHT_BORDER_COLOR = '#e3eaf2';
const LIGHT_BORDER_HOVER = '#d3deea';

// Shared field style factory — single source of truth for all field heights
export const fieldSx = (height) => ({
  '& .MuiOutlinedInput-root': {
    height:       `${height}px`,   // explicit height, not minHeight
    display:      'flex',
    alignItems:   'center',
    borderRadius: '8px',
    padding:      '0 10px !important',
    '& fieldset':             { borderColor: LIGHT_BORDER_COLOR },
    '&:hover fieldset':       { borderColor: LIGHT_BORDER_HOVER },
    '&.Mui-focused fieldset': { borderColor: '#2563eb', borderWidth: 2 },
    '&.Mui-error fieldset':   { borderColor: '#ef4444' },
  },
  '& .MuiInputBase-input': {
    fontSize: '0.8125rem',
    padding:  '0 !important',
  },
  '& .MuiInputLabel-root': {
    fontSize:  '0.8125rem',
    transform: `translate(14px, ${height / 3.5}px) scale(1)`,
    '&.Mui-focused': { color: '#2563eb' },
    '&.Mui-error':   { color: '#ef4444' },
  },
  '& .MuiInputLabel-shrink': {
    transform: 'translate(14px, -6px) scale(0.75)',
  },
  '& .MuiFormHelperText-root': {
    mx: 0,
    '&.Mui-error': { color: '#ef4444' },
  },
});

export default function SelectDropdownSingle({
  name,
  label       = 'Select Item',
  placeholder = '',
  fetchOptions,
  value       = '',
  onChange,
  onBlur,
  error       = false,
  helperText,
  disabled    = false,
  searchable  = true,
  height      = 45,
  fullWidth   = true,
  width       = 240,
  sx          = {},
}) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchOptions();
        if (mounted) setOptions(data || []);
      } catch {
        if (mounted) setOptions([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [fetchOptions]);

  if (loading) {
    return (
      <Skeleton
        variant="rounded"
        animation="wave"
        width={fullWidth ? '100%' : width}
        height={height + 23}
        sx={{ borderRadius: '4px', mb: '4px', ...sx }}
      />
    );
  }

  const selectedOption = options.find((opt) => opt.id === value) || null;

  return (
    <Autocomplete
      options={options}
      disabled={disabled}
      readOnly={!searchable}
      value={selectedOption}
      isOptionEqualToValue={(option, val) => option.id === val?.id}
      getOptionLabel={(option) => option.label || ''}
      onChange={(_, newValue) => onChange?.(newValue ? newValue.id : '')}
      onBlur={onBlur}
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
          helperText={helperText || undefined}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading && <CircularProgress color="inherit" size={18} />}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
          sx={fieldSx(height)}
        />
      )}
    />
  );
}