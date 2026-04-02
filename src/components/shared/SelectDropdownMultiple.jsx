// // src/components/shared/SelectDropdownMultiple.jsx
// import React from 'react';
// import { useField, useFormikContext } from 'formik';
// import Autocomplete from '@mui/material/Autocomplete';
// import TextField from '@mui/material/TextField';
// import Skeleton from '@mui/material/Skeleton'; // Skeleton ইমপোর্ট করা হয়েছে
// import Box from '@mui/material/Box';

// /**
//  * Reusable Multi-Select Dropdown with Skeleton Loader
//  */
// export default function SelectDropdownMultiple({
//   name,
//   label = 'Select Items',
//   placeholder = '',
//   options = [],
//   limitTags = 2,
//   defaultValue = [],
//   disabled = false,
//   searchable = true,
//   height = 45, 
//   fullWidth = true,
//   width = 240,
//   loading = false, // নতুন loading প্রপ যোগ করা হয়েছে
//   sx = {},
// }) {
//   const { setFieldValue } = useFormikContext();
//   const [field, meta] = useField(name);

//   // লোডিং অবস্থায় স্কেলিটন রেন্ডার করা হচ্ছে যা হুবহু ইনপুটের মতো দেখাবে
//   if (loading) {
//     return (
//       <Box sx={{ width: fullWidth ? '100%' : width, ...sx }}>
//         <Skeleton 
//           variant="rounded" 
//           animation="wave" 
//           height={height} 
//           sx={{ borderRadius: '4px', mb: '23px' }} // helperText এর গ্যাপ বজায় রাখার জন্য
//         />
//       </Box>
//     );
//   }

//   // Map Formik value (array of ids) → full option objects
//   const selectedOptions = options.filter((opt) =>
//     Array.isArray(field.value) ? field.value.includes(opt.id) : false
//   );

//   return (
//     <Autocomplete
//       multiple
//       limitTags={limitTags}
//       options={options}
//       disabled={disabled}
//       readOnly={!searchable}
//       isOptionEqualToValue={(option, value) => option.id === value.id}
//       value={selectedOptions.length ? selectedOptions : defaultValue}
//       onChange={(_, newValues) => {
//         setFieldValue(
//           name,
//           newValues.map((v) => v.id)
//         );
//       }}
//       getOptionLabel={(option) => option.label || ''}
//       sx={{
//         width: fullWidth ? '100%' : width,
//         ...sx,
//       }}
//       renderInput={(params) => (
//         <TextField
//           {...params}
//           label={label}
//           placeholder={placeholder}
//           size="small"
//           fullWidth={fullWidth}
//           error={Boolean(meta.touched && meta.error)}
//           helperText={meta.touched && meta.error ? meta.error : ' '}
//           sx={{
//             // OUTER INPUT CONTAINER
//             '& .MuiOutlinedInput-root': {
//               minHeight: height,
//               display: 'flex',
//               alignItems: 'center',
//               padding: '4px 10px !important',
//             },

//             // INPUT TEXT / CHIP INPUT
//             '& .MuiInputBase-input': {
//               fontSize: '0.8125rem',
//               padding: '4px 0 !important',
//             },

//             // LABEL POSITIONING
//             '& .MuiInputLabel-root': {
//               fontSize: '0.8125rem',
//               transform: `translate(14px, ${height / 3.5}px) scale(1)`,
//             },
//             '& .MuiInputLabel-shrink': {
//               transform: 'translate(14px, -6px) scale(0.75)',
//             },
//           }}
//         />
//       )}
//     />
//   );
// }

import React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';

export default function SelectDropdownMultiple({
  name,
  label = 'Select Items',
  placeholder = '',
  options = [],
  value = [],               // formik: values[name]  (array of ids)
  onChange,                 // formik: (ids) => setFieldValue(name, ids)
  onBlur,                   // formik: handleBlur
  error = false,            // formik: Boolean(touched[name] && errors[name])
  helperText = ' ',         // formik: errors[name] or ' '
  limitTags = 2,
  disabled = false,
  searchable = true,
  height = 45,
  fullWidth = true,
  width = 240,
  loading = false,
  sx = {},
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

  return (
    <Autocomplete
      multiple
      limitTags={limitTags}
      options={options}
      disabled={disabled}
      readOnly={!searchable}
      isOptionEqualToValue={(option, val) => option.id === val.id}
      value={selectedOptions}
      onChange={(_, newValues) => {
        onChange?.(newValues.map((v) => v.id));
      }}
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
          sx={{
            '& .MuiOutlinedInput-root': {
              minHeight: height,
              display: 'flex',
              alignItems: 'center',
              padding: '4px 10px !important',
            },
            '& .MuiInputBase-input': {
              fontSize: '0.8125rem',
              padding: '4px 0 !important',
            },
            '& .MuiInputLabel-root': {
              fontSize: '0.8125rem',
              transform: `translate(14px, ${height / 3.5}px) scale(1)`,
            },
            '& .MuiInputLabel-shrink': {
              transform: 'translate(14px, -6px) scale(0.75)',
            },
          }}
        />
      )}
    />
  );
}