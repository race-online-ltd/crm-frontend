// src/features/target/components/SetTarget.jsx
import React from 'react';
import {
  Box, Button, Typography, Stack, InputAdornment,
  TextField,
} from '@mui/material';
import { useFormik }              from 'formik';
import * as Yup                   from 'yup';
import CheckCircleOutlineIcon     from '@mui/icons-material/CheckCircleOutline';
import EmojiEventsIcon            from '@mui/icons-material/EmojiEvents';
import { useNavigate }            from 'react-router-dom';

import SelectDropdownSingle       from '../../../components/shared/SelectDropdownSingle';
import SelectDropdownMultiple     from '../../../components/shared/SelectDropdownMultiple';
import AmountInputField           from '../../../components/shared/AmountInputField';
import MonthPickerField           from '../components/MonthPickerField';

// ─── Mock data ────────────────────────────────────────────────────────────────
const fetchDivisions = async () => [
  { id: 'dv1', label: 'Dhaka Central' },
  { id: 'dv2', label: 'Chattogram' },
  { id: 'dv3', label: 'Sylhet' },
  { id: 'dv4', label: 'Khulna' },
  { id: 'dv5', label: 'Rajshahi' },
];
const fetchTargetTypes = async () => [
  { id: 'revenue', label: 'Revenue' },
  { id: 'client',  label: 'Clients'  },
];
const PRODUCT_OPTIONS = [
  { id: 'p1', label: 'Product Alpha' },
  { id: 'p2', label: 'Product Beta'  },
  { id: 'p3', label: 'Product Gamma' },
  { id: 'p4', label: 'Product Delta' },
];

// ─── Validation schema ────────────────────────────────────────────────────────
const setTargetSchema = Yup.object({
  businessEntities: Yup.array().min(1, 'Select at least one business entity'),
  division:         Yup.string().required('Division is required'),
  products:         Yup.array().min(1, 'Select at least one product'),
  targetType:       Yup.string().oneOf(['client', 'revenue']).required('Target type is required'),
  targetMonth:      Yup.date().nullable().required('Target month is required'),
  targetAmount:     Yup.number()
    .typeError('Must be a number')
    .positive('Must be greater than 0')
    .required('Target value is required'),
  reward:           Yup.string(),
});

const INITIAL_VALUES = {
  businessEntities: [],
  division:         '',
  products:         [],
  targetType:       'revenue',
  targetMonth:      null,
  targetAmount:     '',
  reward:           '',
};

// ─── Main SetTarget component ─────────────────────────────────────────────────
export default function SetTarget({ onCancel, onSubmit }) {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues:    INITIAL_VALUES,
    validationSchema: setTargetSchema,
    onSubmit: (values, { setSubmitting }) => {
      onSubmit?.(values);
      setSubmitting(false);
      navigate('/target');
    },
  });

  const {
    values,
    errors,
    touched,
    isSubmitting,
    setFieldValue,
    handleBlur,
    handleChange,
    handleSubmit,
  } = formik;

  const amountLabel = values.targetType === 'client'
    ? 'Number of Clients *'
    : 'Revenue Target (৳) *';

  const handleCancel = () => {
    if (onCancel) onCancel();
    else navigate('/target');
  };

  return (
    <Box sx={{ width: '100%' }}>
      <form noValidate onSubmit={handleSubmit}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: '4px 20px',
            width: '100%',
          }}
        >
          {/* Business Entities — full width, multi-select */}
          <Box sx={{ gridColumn: '1 / -1' }}>
            <SelectDropdownMultiple
              name="businessEntities"
              label="Business Entity *"
              options={[
                { id: 'be1', label: 'Alpha Corp'      },
                { id: 'be2', label: 'Beta Holdings'   },
                { id: 'be3', label: 'Gamma Ltd'       },
              ]}
              value={values.businessEntities}
              onChange={(ids) => setFieldValue('businessEntities', ids)}
              onBlur={handleBlur}
              error={Boolean(touched.businessEntities && errors.businessEntities)}
              helperText={
                touched.businessEntities && errors.businessEntities
                  ? errors.businessEntities
                  : ' '
              }
            />
          </Box>

          {/* Division — single */}
          <Box sx={{ gridColumn: { xs: '1 / -1', sm: 'span 1' } }}>
            <SelectDropdownSingle
              name="division"
              label="Division *"
              fetchOptions={fetchDivisions}
              value={values.division}
              onChange={(id) => setFieldValue('division', id)}
              onBlur={handleBlur}
              error={Boolean(touched.division && errors.division)}
              helperText={touched.division && errors.division ? errors.division : ' '}
            />
          </Box>

          {/* Target Month — single */}
          <Box sx={{ gridColumn: { xs: '1 / -1', sm: 'span 1' } }}>
            <MonthPickerField
              label="Target Month *"
              value={values.targetMonth}
              onChange={(val) => setFieldValue('targetMonth', val)}
              error={Boolean(touched.targetMonth && errors.targetMonth)}
              helperText={
                touched.targetMonth && errors.targetMonth
                  ? errors.targetMonth
                  : ' '
              }
            />
          </Box>

          {/* Products — full width, multi-select */}
          <Box sx={{ gridColumn: '1 / -1' }}>
            <SelectDropdownMultiple
              name="products"
              label="Select Products *"
              options={PRODUCT_OPTIONS}
              value={values.products}
              onChange={(ids) => setFieldValue('products', ids)}
              onBlur={handleBlur}
              error={Boolean(touched.products && errors.products)}
              helperText={
                touched.products && errors.products ? errors.products : ' '
              }
            />
          </Box>

          {/* Target Type — single */}
          <Box sx={{ gridColumn: { xs: '1 / -1', sm: 'span 1' } }}>
            <SelectDropdownSingle
              name="targetType"
              label="Target Type *"
              fetchOptions={fetchTargetTypes}
              value={values.targetType}
              onChange={(id) => {
                setFieldValue('targetType', id);
                setFieldValue('targetAmount', '');
              }}
              onBlur={handleBlur}
              error={Boolean(touched.targetType && errors.targetType)}
              helperText={touched.targetType && errors.targetType ? errors.targetType : ' '}
            />
          </Box>

          {/* Target Amount — dynamic label */}
          <AmountInputField
            name="targetAmount"
            label={amountLabel}
            value={values.targetAmount}
            onChange={(e) => setFieldValue('targetAmount', e.target.value)}
            onBlur={handleBlur}
            error={Boolean(touched.targetAmount && errors.targetAmount)}
            helperText={
              touched.targetAmount && errors.targetAmount
                ? errors.targetAmount
                : values.targetType === 'client'
                ? 'Enter number of new clients to acquire'
                : 'Enter revenue target in BDT'
            }
            {...(values.targetType === 'client' ? { currencySymbol: '#' } : {})}
          />

          {/* Reward — optional, full width */}
          <Box sx={{ gridColumn: '1 / -1' }}>
            <Typography
              variant="caption"
              fontWeight={600}
              color="#475569"
              display="block"
              mb={0.5}
              ml={0.25}
            >
              Reward{' '}
              <Typography component="span" variant="caption" color="text.disabled">
                (optional)
              </Typography>
            </Typography>
            <TextField
              fullWidth
              name="reward"
              placeholder="e.g. iPhone 15, Cash ৳10,000, Trip to Cox's Bazar…"
              value={values.reward}
              onChange={handleChange}
              onBlur={handleBlur}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmojiEventsIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  minHeight: '45px',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px 10px !important',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  '& fieldset': { borderColor: '#e2e8f0' },
                  '&:hover fieldset': { borderColor: '#94a3b8' },
                  '&.Mui-focused fieldset': { borderColor: '#2563eb' },
                },
                '& .MuiInputBase-input': {
                  fontSize: '0.8125rem',
                  padding: '4px 0 !important',
                },
                '& .MuiInputLabel-root': {
                  fontSize: '0.8125rem',
                  transform: 'translate(14px, 12.857px) scale(1)',
                },
                '& .MuiInputLabel-shrink': {
                  transform: 'translate(14px, -6px) scale(0.75)',
                },
              }}
              helperText=" "
            />
          </Box>
        </Box>

        {/* ── Actions ── */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mt={4}>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleCancel}
            sx={{
              fontWeight: 600,
              borderRadius: '10px',
              borderColor: '#e2e8f0',
              color: '#64748b',
              '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' },
            }}
          >
            Cancel
          </Button>
          <Button
            fullWidth
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={<CheckCircleOutlineIcon />}
            sx={{
              fontWeight: 700,
              borderRadius: '10px',
              bgcolor: '#2563eb',
              py: 1.2,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#1d4ed8', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' },
              '&.Mui-disabled': { bgcolor: '#e2e8f0', color: '#94a3b8' },
            }}
          >
            Set Target
          </Button>
        </Stack>
      </form>
    </Box>
  );
}
