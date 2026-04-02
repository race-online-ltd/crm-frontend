// // SelectDropdownSingle.jsx
// import React, { useEffect, useState } from 'react';
// import { useField, useFormikContext } from 'formik';
// import Autocomplete from '@mui/material/Autocomplete';
// import TextField from '@mui/material/TextField';
// import CircularProgress from '@mui/material/CircularProgress';
// import Chip from '@mui/material/Chip';
// import Skeleton from '@mui/material/Skeleton'; // Skeleton ইমপোর্ট করা হয়েছে

// /**
//  * Reusable Single-Select Dropdown with Skeleton Loader
//  */
// export default function SelectDropdownSingle({
//   name,
//   label = 'Select Item',
//   placeholder = '',
//   fetchOptions,
//   disabled = false,
//   searchable = true,
//   height = 45,
//   fullWidth = true,
//   width = 240,
//   sx = {},
// }) {
//   const { setFieldValue } = useFormikContext();
//   const [field, meta] = useField(name);

//   const [options, setOptions] = useState([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     let mounted = true;
//     const loadOptions = async () => {
//       setLoading(true);
//       try {
//         const data = await fetchOptions();
//         if (mounted) setOptions(data || []);
//       } catch (err) {
//         console.error('Error fetching options:', err);
//         if (mounted) setOptions([]);
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     };
//     loadOptions();
//     return () => { mounted = false; };
//   }, [fetchOptions]);

//   const selectedOption = options.find((opt) => opt.id === field.value) || null;

//   // লোডিং অবস্থায় স্কেলিটন দেখাবে
//   if (loading) {
//     return (
//       <Skeleton
//         variant="rounded"
//         animation="wave"
//         width={fullWidth ? '100%' : width}
//         height={height + 23} // ইনপুট হাইট + হেল্পার টেক্সট স্পেস
//         sx={{ 
//           borderRadius: '4px', 
//           mb: '4px', // মার্জিন অ্যাডজাস্টমেন্ট
//           ...sx 
//         }}
//       />
//     );
//   }

//   return (
//     <Autocomplete
//       options={options}
//       disabled={disabled}
//       readOnly={!searchable}
//       value={selectedOption}
//       loading={loading}
//       isOptionEqualToValue={(option, value) => option.id === value?.id}
//       getOptionLabel={(option) => option.label || ''}
//       onChange={(_, newValue) => {
//         setFieldValue(name, newValue ? newValue.id : '');
//       }}
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
//           InputProps={{
//             ...params.InputProps,
//             endAdornment: (
//               <>
//                 {loading && <CircularProgress color="inherit" size={18} />}
//                 {params.InputProps.endAdornment}
//               </>
//             ),
//           }}
//           sx={{
//             '& .MuiOutlinedInput-root': {
//               minHeight: height,
//               display: 'flex',
//               alignItems: 'center',
//               padding: '4px 10px !important',
//             },
//             '& .MuiInputBase-input': {
//               fontSize: '0.8125rem',
//               padding: '4px 0 !important',
//             },
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
import React, { useEffect, useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Skeleton from '@mui/material/Skeleton';

export default function SelectDropdownSingle({
  name,
  label = 'Select Item',
  placeholder = '',
  fetchOptions,
  value = '',               // formik: values[name]
  onChange,                 // formik: (id) => setFieldValue(name, id)
  onBlur,                   // formik: handleBlur
  error = false,            // formik: Boolean(touched[name] && errors[name])
  helperText,
  disabled = false,
  searchable = true,
  height = 45,
  fullWidth = true,
  width = 240,
  sx = {},
}) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadOptions = async () => {
      setLoading(true);
      try {
        const data = await fetchOptions();
        if (mounted) setOptions(data || []);
      } catch (err) {
        console.error('Error fetching options:', err);
        if (mounted) setOptions([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadOptions();
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
      onChange={(_, newValue) => {
        onChange?.(newValue ? newValue.id : '');
      }}
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
