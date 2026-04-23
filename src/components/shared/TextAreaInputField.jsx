// src/components/shared/TextAreaInputField.jsx
import TextField from '@mui/material/TextField';

export default function TextAreaInputField({
  name,
  label,
  value,
  onChange,
  onBlur,
  rows,
  minRows,
  maxRows,
  disabled = false,
  fullWidth = true,
  error = false,
  helperText = '',
  size = 'small',   
  sx = {},
  resizable = true, // new prop — can disable per call site if needed
  ...rest
}) {
  return (
    <TextField
      name={name}
      label={label}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      multiline
      rows={rows}
      minRows={minRows}
      maxRows={maxRows}
      disabled={disabled}
      fullWidth={fullWidth}
      error={error}
      helperText={helperText}
      variant="outlined"
      size={size} 
      sx={{
        width: fullWidth ? '100%' : '240px',
        '& .MuiInputBase-input': {
          fontSize: '0.8125rem',
          padding: '8px 10px',
          ...(resizable && !disabled && {
            resize: 'vertical',  // allows vertical drag resize
            overflow: 'auto',    // required for resize to work
            minHeight: `${Math.max(minRows || rows || 2, 1) * 12}px`,   // prevents collapsing too small
          }),
        },
        '& .MuiInputLabel-root': {
          fontSize: '0.8125rem',
          transform: 'translate(14px, 10px) scale(1)',
        },
        '& .MuiInputLabel-shrink': {
          transform: 'translate(14px, -6px) scale(.75)',
        },
        ...sx
      }}
      {...rest}
    />
  );
}
