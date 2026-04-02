// PasswordInputField.jsx
import { useState } from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export default function PasswordField({
  name,
  label,
  value,
  onChange,
  onBlur,
  disabled = false,
  fullWidth = true,
  error = false,
  helperText = '',
   size = 'small',   
  sx = {},
  ...rest
}) {
  const [showPassword, setShowPassword] = useState(false);

  const handleToggle = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <TextField
      name={name}
      label={label}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      type={showPassword ? 'text' : 'password'}
      disabled={disabled}
      fullWidth={fullWidth}
      error={error}
      helperText={helperText}
      variant="outlined"
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
  onClick={handleToggle}
  edge="end"
  disableRipple
  sx={{
    p: 1,                     // remove internal padding
    backgroundColor: 'transparent', // same as field
    '&:hover': { backgroundColor: 'transparent' }, // no hover effect
    '&:focus': { outline: 'none', boxShadow: 'none' },
    '&:focus-visible': { outline: 'none', boxShadow: 'none' },
  }}
>
  {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
</IconButton>


          </InputAdornment>
        ),
      }}
       size={size} 
      sx={{
        width: fullWidth ? '100%' : '240px', // Default width if not fullWidth
        '& .MuiInputBase-input': {
          fontSize: '0.8125rem', // Slightly smaller font (13px)
          padding: '12px 10px',   // Extra tight vertical padding
        },
        '& .MuiInputLabel-root': {
          fontSize: '0.8125rem', // Match label size
          transform: 'translate(14px, 12px) scale(1)', // Center label in smaller box
        },
        '& .MuiInputLabel-shrink': {
          transform: 'translate(14px, -6px) scale(0.75)', // Fix shrink position
        },
        ...sx // Merge with any styles passed at the call site
      }}
      {...rest}
    />
  );
}
