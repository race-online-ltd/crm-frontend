// NumberInputField.jsx
import TextField from '@mui/material/TextField';

export default function NumberInputField({
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
    const val = e.target.value;
    // Only allow digits
    if (/^\d*$/.test(val)) {
      onChange(e);
    }
  };

  const handleKeyPress = (e) => {
    // Block everything except digits
    if (!/[0-9]/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text');
    if (!/^\d*$/.test(pasted)) {
      e.preventDefault();
    }
  };

  return (
    <TextField
      name={name}
      label={label}
      value={value}
      onChange={handleChange}
      onKeyPress={handleKeyPress}
      onPaste={handlePaste}
      onBlur={onBlur}
      error={error}
      helperText={helperText}
      variant="outlined"
      fullWidth={fullWidth}
      size={size}
      sx={{
        width: fullWidth ? '100%' : '240px',
        '& .MuiInputBase-input': {
          fontSize: '0.8125rem',
          padding: '10px 10px',
        },
        '& .MuiInputLabel-root': {
          fontSize: '0.8125rem',
          transform: 'translate(14px, 10px) scale(1)',
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
