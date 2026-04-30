// // src/features/leads/components/LeadFilterDrawer.jsx
// import React, { useMemo } from 'react';
// import {
//   Box, Button, MenuItem, Stack, TextField, Typography,
// } from '@mui/material';
// import { format } from 'date-fns';

// import AppDrawer from '../../../components/shared/AppDrawer';
// import { fieldSx } from '../../../components/shared/SelectDropdownSingle';
// import MonthPicker from '../../../components/shared/MonthPicker';

// const DEFAULT_FILTERS = {
//   business_entity_id: '',
//   group_id:           '',
//   team_id:            '',
//   kam_id:             '',
//   date_from:          null,
//   date_to:            null,
// };

// export default function LeadFilterDrawer({
//   open,
//   onClose,
//   filters,
//   onChange,
//   onApply,
//   onReset,
//   businessEntityOptions = [],
//   teamOptions           = [],
//   kamOptions            = [],
// }) {
//   const values = useMemo(() => ({
//     ...DEFAULT_FILTERS,
//     ...(filters || {}),
//   }), [filters]);

//   const footerActions = useMemo(() => (
//     <Button
//       variant="contained"
//       onClick={() => onApply?.(values)}
//       fullWidth
//       sx={{
//         textTransform: 'none',
//         fontWeight:    700,
//         borderRadius:  '10px',
//         px:            2.5,
//         py:            1.2,
//         bgcolor:       '#2563eb',
//         '&:hover':     { bgcolor: '#1d4ed8' },
//       }}
//     >
//       Apply Filters
//     </Button>
//   ), [onApply, values]);

//   const handleSelectChange = (field) => (event) => {
//     onChange?.(field, event.target.value);
//   };

//   const handleFromChange = (date) => {
//     if (!date) {
//       onChange?.('date_from', null);
//       return;
//     }
    
//     // Always set to the 1st of the month
//     const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
//     const dateString = format(firstDay, 'yyyy-MM-dd'); 
    
//     onChange?.('date_from', dateString);

//     // If 'From' is now after 'To', clear 'To'
//     if (values.date_to) {
//       const currentTo = new Date(values.date_to);
//       if (firstDay > currentTo) {
//         onChange?.('date_to', null);
//       }
//     }
//   };

//   const handleToChange = (date) => {
//     if (!date) {
//       onChange?.('date_to', null);
//       return;
//     }

//     // Set to last day of selected month
//     const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
//     const dateString = format(lastDay, 'yyyy-MM-dd');
    
//     onChange?.('date_to', dateString);

//     // If 'To' is now before 'From', move 'From' to the start of this month
//     if (values.date_from) {
//       const currentFrom = new Date(values.date_from);
//       if (lastDay < currentFrom) {
//         const startOfSelectedMonth = new Date(date.getFullYear(), date.getMonth(), 1);
//         onChange?.('date_from', format(startOfSelectedMonth, 'yyyy-MM-dd'));
//       }
//     }
//   };
//   return (
//     <AppDrawer
//       open={open}
//       onClose={onClose}
//       title="Lead Filters"
//       width={420}
//       footerActions={footerActions}
//       paperProps={{ role: 'dialog', 'aria-label': 'Lead filters' }}
//     >
//       <Stack spacing={2.25}>

//         {/* Business Entity */}
//         <TextField
//           select
//           fullWidth
//           size="small"
//           label="Business Entity"
//           value={values.business_entity_id}
//           onChange={handleSelectChange('business_entity_id')}
//           sx={fieldSx(45)}
//         >
//           <MenuItem value=""><em>All</em></MenuItem>
//           {businessEntityOptions.map((o) => (
//             <MenuItem key={o.id} value={o.id}>{o.label}</MenuItem>
//           ))}
//         </TextField>

//         {/* Team */}
//         <TextField
//           select
//           fullWidth
//           size="small"
//           label="Team"
//           value={values.team_id}
//           onChange={handleSelectChange('team_id')}
//           sx={fieldSx(45)}
//         >
//           <MenuItem value=""><em>All</em></MenuItem>
//           {teamOptions.map((o) => (
//             <MenuItem key={o.id} value={o.id}>{o.label}</MenuItem>
//           ))}
//         </TextField>

//         {/* KAM */}
//         <TextField
//           select
//           fullWidth
//           size="small"
//           label="KAM"
//           value={values.kam_id}
//           onChange={handleSelectChange('kam_id')}
//           sx={fieldSx(45)}
//         >
//           <MenuItem value=""><em>All</em></MenuItem>
//           {kamOptions.map((o) => (
//             <MenuItem key={o.id} value={o.id}>{o.label}</MenuItem>
//           ))}
//         </TextField>

//         {/* Month Range (Professional Way) */}
//         <Box>
//           <Typography
//             sx={{ fontSize: '12px', color: '#64748b', fontWeight: 600, mb: 1 }}
//           >
//             Month Range
//           </Typography>

//           <Stack direction="row" spacing={1.25}>
//             <MonthPicker
//               label="From Month"
//               value={values.date_from}
//               onChange={handleFromChange}
//               fullWidth
//             />

//             <MonthPicker
//               label="To Month"
//               value={values.date_to}
//               onChange={handleToChange}
//               fullWidth
//             />
//           </Stack>
//         </Box>

//         {/* Clear All */}
//         <Box sx={{ display: 'flex', justifyContent: 'center', pt: 0.5 }}>
//           <Button
//             variant="text"
//             onClick={onReset}
//             sx={{
//               textTransform: 'none',
//               fontWeight:    700,
//               color:         '#ef4444',
//               '&:hover':     { bgcolor: 'rgba(239,68,68,0.06)' },
//             }}
//           >
//             Clear All Filters
//           </Button>
//         </Box>

//       </Stack>
//     </AppDrawer>
//   );
// }



import React, { useMemo } from 'react';
import {
  Box, Button, MenuItem, Stack, TextField, Typography, FormHelperText,
} from '@mui/material';
import { format } from 'date-fns';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

import AppDrawer from '../../../components/shared/AppDrawer';
import { fieldSx } from '../../../components/shared/SelectDropdownSingle';
import MonthPicker from '../../../components/shared/MonthPicker';

const DEFAULT_FILTERS = {
  business_entity_id: '',
  group_id:           '',
  team_id:            '',
  kam_id:             '',
  date_from:          null,
  date_to:            null,
};

// ─── Validation Schema (Formik + Yup) ────────────────────────────────────────
const filterValidationSchema = Yup.object().shape({
  business_entity_id: Yup.string(),
  team_id: Yup.string(),
  kam_id: Yup.string(),
  date_from: Yup.mixed().required('From month is required'),
  date_to: Yup.mixed().required('To month is required'),
}).test(
  'date-range-valid',
  'From date cannot be after To date',
  function (values) {
    const { date_from, date_to } = values || {};
    if (date_from && date_to) {
      const from = new Date(date_from);
      const to = new Date(date_to);
      if (from > to) {
        return this.createError({
          path: 'date_from',
          message: 'From date cannot be after To date',
        });
      }
    }
    return true;
  }
);

export default function LeadFilterDrawer({
  open,
  onClose,
  filters,
  onChange,
  onApply,
  onReset,
  businessEntityOptions = [],
  teamOptions           = [],
  kamOptions            = [],
}) {
  const initialValues = useMemo(() => ({
    ...DEFAULT_FILTERS,
    ...(filters || {}),
  }), [filters]);

  const handleSubmit = (values, { setSubmitting }) => {
    onApply?.(values);
    setSubmitting(false);
  };

  const handleSelectChange = (field, setFieldValue) => (event) => {
    setFieldValue(field, event.target.value);
  };

  const handleFromChange = (setFieldValue, values) => (date) => {
    if (!date) {
      setFieldValue('date_from', null);
      return;
    }
    
    // Always set to the 1st of the month
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const dateString = format(firstDay, 'yyyy-MM-dd'); 
    
    setFieldValue('date_from', dateString);

    // If 'From' is now after 'To', clear 'To'
    if (values.date_to) {
      const currentTo = new Date(values.date_to);
      if (firstDay > currentTo) {
        setFieldValue('date_to', null);
      }
    }
  };

  const handleToChange = (setFieldValue, values) => (date) => {
    if (!date) {
      setFieldValue('date_to', null);
      return;
    }

    // Set to last day of selected month
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const dateString = format(lastDay, 'yyyy-MM-dd');
    
    setFieldValue('date_to', dateString);

    // If 'To' is now before 'From', move 'From' to the start of this month
    if (values.date_from) {
      const currentFrom = new Date(values.date_from);
      if (lastDay < currentFrom) {
        const startOfSelectedMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        setFieldValue('date_from', format(startOfSelectedMonth, 'yyyy-MM-dd'));
      }
    }
  };

  return (
    <AppDrawer
      open={open}
      onClose={onClose}
      title="Lead Filters"
      width={420}
      footerActions={null} // We'll render buttons inside Formik form
      paperProps={{ role: 'dialog', 'aria-label': 'Lead filters' }}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={filterValidationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, setFieldValue, setFieldTouched, isSubmitting, touched, errors, submitCount }) => (
          <Form style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Stack spacing={2.25} sx={{ flexGrow: 1, overflowY: 'auto', pr: 1 }}>

              {/* Business Entity */}
              <Box>
                <Field
                  component={TextField}
                  select
                  fullWidth
                  size="small"
                  label="Business Entity"
                  name="business_entity_id"
                  value={values.business_entity_id}
                  onChange={handleSelectChange('business_entity_id', setFieldValue)}
                  sx={fieldSx(45)}
                  error={touched.business_entity_id && Boolean(errors.business_entity_id)}
                  helperText={touched.business_entity_id && errors.business_entity_id}
                >
                  <MenuItem value=""><em>Select Business Entity</em></MenuItem>
                  {businessEntityOptions.map((o) => (
                    <MenuItem key={o.id} value={o.id}>{o.label}</MenuItem>
                  ))}
                </Field>
              </Box>

              {/* Team */}
              <Box>
                <Field
                  component={TextField}
                  select
                  fullWidth
                  size="small"
                  label="Team"
                  name="team_id"
                  value={values.team_id}
                  onChange={handleSelectChange('team_id', setFieldValue)}
                  sx={fieldSx(45)}
                  error={touched.team_id && Boolean(errors.team_id)}
                  helperText={touched.team_id && errors.team_id}
                >
                  <MenuItem value=""><em>All Teams</em></MenuItem>
                  {teamOptions.map((o) => (
                    <MenuItem key={o.id} value={o.id}>{o.label}</MenuItem>
                  ))}
                </Field>
                {/* <FormHelperText sx={{ ml: 1.75, mt: 0.5, fontSize: '0.7rem' }}>
                  Select Team OR KAM (at least one required)
                </FormHelperText> */}
              </Box>

              {/* KAM */}
              <Box>
                <Field
                  component={TextField}
                  select
                  fullWidth
                  size="small"
                  label="KAM"
                  name="kam_id"
                  value={values.kam_id}
                  onChange={handleSelectChange('kam_id', setFieldValue)}
                  sx={fieldSx(45)}
                  error={touched.kam_id && Boolean(errors.kam_id)}
                  helperText={touched.kam_id && errors.kam_id}
                >
                  <MenuItem value=""><em>All KAMs</em></MenuItem>
                  {kamOptions.map((o) => (
                    <MenuItem key={o.id} value={o.id}>{o.label}</MenuItem>
                  ))}
                </Field>
              </Box>

              {/* Month Range (Professional Way) */}
              <Box>
                {/* <Typography
                  sx={{ fontSize: '12px', color: '#64748b', fontWeight: 600, mb: 1 }}
                >
                  Month Range *
                </Typography> */}

                <Stack direction="row" spacing={1.25}>
                  <MonthPicker
                    label="From Month"
                    value={values.date_from ? new Date(values.date_from) : null}
                    onChange={(date) => {
                      setFieldTouched('date_from', true, false);
                      handleFromChange(setFieldValue, values)(date);
                    }}
                    fullWidth
                    error={(touched.date_from || submitCount > 0) && Boolean(errors.date_from)}
                  />

                  <MonthPicker
                    label="To Month"
                    value={values.date_to ? new Date(values.date_to) : null}
                    onChange={(date) => {
                      setFieldTouched('date_to', true, false);
                      handleToChange(setFieldValue, values)(date);
                    }}
                    fullWidth
                    error={(touched.date_to || submitCount > 0) && Boolean(errors.date_to)}
                  />
                </Stack>
                
                {/* Show date errors */}
                {((touched.date_from || submitCount > 0) && errors.date_from) ||
                ((touched.date_to || submitCount > 0) && errors.date_to) ? (
                  <FormHelperText error sx={{ ml: 0, mt: 0.5 }}>
                    {errors.date_from || errors.date_to}
                  </FormHelperText>
                ) : null}
              </Box>

              {/* Clear All */}
              <Box sx={{ display: 'flex', justifyContent: 'center', pt: 0.5 }}>
                <Button
                  type="button"
                  variant="text"
                  onClick={() => {
                    onReset?.();
                  }}
                  sx={{
                    textTransform: 'none',
                    fontWeight:    700,
                    color:         '#ef4444',
                    '&:hover':     { bgcolor: 'rgba(239,68,68,0.06)' },
                  }}
                >
                  Clear All Filters
                </Button>
              </Box>

            </Stack>

            {/* Footer Actions */}
            <Box sx={{ pt: 2, borderTop: '1px solid #e2e8f0' }}>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                fullWidth
                sx={{
                  textTransform: 'none',
                  fontWeight:    700,
                  borderRadius:  '10px',
                  px:            2.5,
                  py:            1.2,
                  bgcolor:       '#2563eb',
                  '&:hover':     { bgcolor: '#1d4ed8' },
                  '&:disabled':  { bgcolor: '#94a3b8' },
                }}
              >
                {isSubmitting ? 'Applying...' : 'Apply Filters'}
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </AppDrawer>
  );
}
