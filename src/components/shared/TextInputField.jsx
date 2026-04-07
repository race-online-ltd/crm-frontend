// src/components/shared/TextInputField.jsx

import TextField from '@mui/material/TextField';

const FIELD_HEIGHT = 45;
const LIGHT_BORDER_COLOR = '#e3eaf2';
const LIGHT_BORDER_HOVER = '#d3deea';

export default function TextInputField({
  name,
  label,
  value,
  onChange,
  onBlur,
  type = 'text',
  disabled = false,
  fullWidth = true,
  error = false,
  helperText,
  size = 'small',   
  sx = {},
  ...rest
}) {
  return (
    <TextField
      name={name}
      label={label}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      type={type}
      disabled={disabled}
      fullWidth={fullWidth}
      error={error}
      helperText={helperText || undefined}
      variant="outlined"
      size={size} 
      sx={{
        width: fullWidth ? '100%' : '240px', // Default width if not fullWidth
        '& .MuiOutlinedInput-root': {
          minHeight: FIELD_HEIGHT,
          display: 'flex',
          alignItems: 'center',
          padding: '4px 10px !important',
          '& fieldset': {
            borderColor: LIGHT_BORDER_COLOR,
          },
          '&:hover fieldset': {
            borderColor: LIGHT_BORDER_HOVER,
          },
        },
        '& .MuiInputBase-input': {
          fontSize: '0.8125rem', // Slightly smaller font (13px)
          padding: '4px 0 !important',
        },
        '& .MuiInputLabel-root': {
          fontSize: '0.8125rem', // Match label size
          transform: `translate(14px, ${FIELD_HEIGHT / 3.5}px) scale(1)`, // Center label in smaller box
        },
        '& .MuiInputLabel-shrink': {
          transform: 'translate(14px, -6px) scale(.75)', // Fix shrink position
        },
        ...sx // Merge with any styles passed at the call site
      }}
      {...rest}
    />
     
  );
}
