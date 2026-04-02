import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

export default function AmountInputField({
  name,
  label,
  value,
  onChange,
  onBlur,
  error = false,
  helperText = '',
  size = 'small',
  fullWidth = true,
  sx = {},
  ...rest
}) {

  const handleChange = (e) => {
    let val = e.target.value;

    // Remove all characters except digits and dot
    val = val.replace(/[^0-9.]/g, '');

    // Keep only first dot
    const parts = val.split('.');
    if (parts.length > 2) {
      val = parts[0] + '.' + parts.slice(1).join('');
    }

    // Call the onChange with sanitized value
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
      InputProps={{
        startAdornment: <InputAdornment position="start">৳</InputAdornment>,
      }}
      size={size}
      sx={{
        width: fullWidth ? '100%' : '240px',
        '& .MuiInputBase-input': {
          fontSize: '0.8125rem',
          padding: '12px 10px',
        },
        '& .MuiInputLabel-root': {
          fontSize: '0.8125rem',
          transform: 'translate(14px, 12px) scale(1)',
        },
        '& .MuiInputLabel-shrink': {
          transform: 'translate(14px, -6px) scale(0.75)',
        },
        ...sx,
      }}
      {...rest}
    />
  );
}
