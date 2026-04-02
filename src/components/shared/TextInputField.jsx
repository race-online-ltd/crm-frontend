import TextField from '@mui/material/TextField';

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
        '& .MuiInputBase-input': {
          fontSize: '0.8125rem', // Slightly smaller font (13px)
          padding: '10px 10px',   // Extra tight vertical padding
        },
        '& .MuiInputLabel-root': {
          fontSize: '0.8125rem', // Match label size
          transform: 'translate(14px, 10px) scale(1)', // Center label in smaller box
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
