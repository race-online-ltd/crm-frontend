// src/features/target/components/SetTarget.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  InputAdornment,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useNavigate } from 'react-router-dom';

import SelectDropdownSingle from '../../../components/shared/SelectDropdownSingle';
import SelectDropdownMultiple from '../../../components/shared/SelectDropdownMultiple';
import { CustomPeriodPicker } from '../../../components/shared/date-picker';
import {
  fetchBackoffices,
  fetchBusinessEntities,
  fetchProductsByBusinessEntity,
} from '../../settings/api/settingsApi';

const TARGET_MODES = [
  { id: 'monthly', label: 'Monthly' },
  { id: 'quarterly', label: 'Quarterly' },
];

const periodSchema = Yup.object({
  year: Yup.number().required(),
});

const monthlySchema = periodSchema.shape({
  month: Yup.number().required(),
});

const quarterlySchema = periodSchema.shape({
  quarter: Yup.number().required(),
});

const setTargetSchema = Yup.object({
  businessEntityId: Yup.string().required('Business entity is required'),
  kamId: Yup.string().required('KAM is required'),
  targetMode: Yup.string().oneOf(['monthly', 'quarterly']).required('Target mode is required'),
  targetMonth: monthlySchema.nullable().when('targetMode', {
    is: 'monthly',
    then: (schema) => schema.required('Month target is required'),
    otherwise: (schema) => schema.nullable().notRequired(),
  }),
  targetQuarter: quarterlySchema.nullable().when('targetMode', {
    is: 'quarterly',
    then: (schema) => schema.required('Quarter target is required'),
    otherwise: (schema) => schema.nullable().notRequired(),
  }),
  products: Yup.array().min(1, 'Select at least one product'),
  revenueTarget: Yup.number()
    .typeError('Must be a number')
    .positive('Must be greater than 0')
    .required('Revenue target is required'),
  reward: Yup.string(),
});

const INITIAL_VALUES = {
  businessEntityId: '',
  kamId: '',
  targetMode: 'monthly',
  targetMonth: null,
  targetQuarter: null,
  products: [],
  revenueTarget: '',
  reward: '',
};

function toOptionList(items = [], labelKey = 'label') {
  return items
    .map((item) => ({
      id: String(item.id),
      label: String(item[labelKey] ?? item.label ?? ''),
    }))
    .filter((item) => item.label);
}

function buildKamOptions(backoffices = [], businessEntityId = '') {
  if (!businessEntityId) {
    return [];
  }

  const rows = backoffices.filter(
    (backoffice) => String(backoffice.business_entity_id) === String(businessEntityId)
  );

  const options = rows.flatMap((backoffice) => (
    Array.isArray(backoffice.system_users)
      ? backoffice.system_users.map((user) => ({
        id: String(user.id),
        label: user.full_name || user.user_name || `User ${user.id}`,
      }))
      : []
  ));

  return Array.from(
    new Map(options.map((option) => [option.id, option])).values()
  ).sort((a, b) => a.label.localeCompare(b.label));
}

export default function SetTarget({ onCancel, onSubmit }) {
  const navigate = useNavigate();
  const [businessEntities, setBusinessEntities] = useState([]);
  const [backoffices, setBackoffices] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingBusinessEntities, setLoadingBusinessEntities] = useState(false);
  const [loadingBackoffices, setLoadingBackoffices] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoadingBusinessEntities(true);
      setLoadingBackoffices(true);

      try {
        const [entities, backofficeRows] = await Promise.all([
          fetchBusinessEntities(),
          fetchBackoffices(),
        ]);

        if (!active) {
          return;
        }

        setBusinessEntities(toOptionList(entities, 'name'));
        setBackoffices(Array.isArray(backofficeRows) ? backofficeRows : []);
      } catch {
        if (active) {
          setBusinessEntities([]);
          setBackoffices([]);
        }
      } finally {
        if (active) {
          setLoadingBusinessEntities(false);
          setLoadingBackoffices(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  const formik = useFormik({
    initialValues: INITIAL_VALUES,
    validationSchema: setTargetSchema,
    onSubmit: async (values, { setSubmitting }) => {
      const payload = {
        ...values,
        targetType: 'revenue',
        targetMonth: values.targetMode === 'monthly' ? values.targetMonth : null,
        targetQuarter: values.targetMode === 'quarterly' ? values.targetQuarter : null,
      };

      try {
        await onSubmit?.(payload);
        navigate('/target');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const {
    values,
    errors,
    touched,
    submitCount,
    isSubmitting,
    setFieldValue,
    handleBlur,
    handleChange,
    handleSubmit,
  } = formik;

  const kamOptions = useMemo(
    () => buildKamOptions(backoffices, values.businessEntityId),
    [backoffices, values.businessEntityId]
  );

  const businessEntityFetcher = useCallback(async () => businessEntities, [businessEntities]);
  const kamFetcher = useCallback(async () => kamOptions, [kamOptions]);
  const targetModeFetcher = useCallback(async () => TARGET_MODES, []);

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      if (!values.businessEntityId) {
        setProducts([]);
        setLoadingProducts(false);
        return;
      }

      setLoadingProducts(true);

      try {
        const entityProducts = await fetchProductsByBusinessEntity(values.businessEntityId);

        if (!active) {
          return;
        }

        const filtered = (Array.isArray(entityProducts) ? entityProducts : [])
          .map((product) => ({
            id: String(product.id),
            label: product.product_name || product.label || `Product ${product.id}`,
            business_entity_id: product.business_entity_id,
          }))

        setProducts(filtered);
      } catch {
        if (active) {
          setProducts([]);
        }
      } finally {
        if (active) {
          setLoadingProducts(false);
        }
      }
    };

    loadProducts();

    return () => {
      active = false;
    };
  }, [values.businessEntityId]);

  useEffect(() => {
    setFieldValue('kamId', '');
    setFieldValue('products', []);
    setFieldValue('targetMonth', null);
    setFieldValue('targetQuarter', null);
  }, [values.businessEntityId, setFieldValue]);

  const targetPeriodError = submitCount > 0 || touched.targetMonth || touched.targetQuarter
    ? (
      values.targetMode === 'monthly' && !values.targetMonth
        ? 'Month target is required'
        : values.targetMode === 'quarterly' && !values.targetQuarter
          ? 'Quarter target is required'
          : ''
    )
    : '';

  const targetModeError = touched.targetMode && errors.targetMode ? errors.targetMode : ' ';
  const productDisabled = !values.businessEntityId || !values.kamId;
  const productHelperText = !values.businessEntityId ? 'Select a business entity first' : ' ';

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
      return;
    }

    navigate('/target');
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
          <Box>
            <SelectDropdownSingle
              name="businessEntityId"
              label="Business Entity *"
              fetchOptions={businessEntityFetcher}
              value={values.businessEntityId}
              onChange={(id) => setFieldValue('businessEntityId', id)}
              onBlur={handleBlur}
              error={Boolean(touched.businessEntityId && errors.businessEntityId)}
              helperText={touched.businessEntityId && errors.businessEntityId ? errors.businessEntityId : ' '}
              loading={loadingBusinessEntities}
            />
          </Box>

          <Box>
            <SelectDropdownSingle
              name="kamId"
              label="Select KAM *"
              fetchOptions={kamFetcher}
              value={values.kamId}
              onChange={(id) => setFieldValue('kamId', id)}
              onBlur={handleBlur}
              disabled={!values.businessEntityId}
              error={Boolean(touched.kamId && errors.kamId)}
              helperText={touched.kamId && errors.kamId ? errors.kamId : productDisabled ? 'Select a business entity first' : ' '}
              loading={loadingBackoffices}
            />
          </Box>

          <Box>
            <SelectDropdownSingle
              name="targetMode"
              label="Target Mode *"
              fetchOptions={targetModeFetcher}
              value={values.targetMode}
              onChange={(mode) => {
                setFieldValue('targetMode', mode);
                setFieldValue('targetMonth', null);
                setFieldValue('targetQuarter', null);
              }}
              onBlur={handleBlur}
              error={Boolean(touched.targetMode && errors.targetMode)}
              helperText={targetModeError}
            />
          </Box>

          <Box>
            {values.targetMode === 'monthly' ? (
              <CustomPeriodPicker
                mode="monthly"
                label="Month-Year *"
                value={values.targetMonth}
                onChange={(val) => {
                  setFieldValue('targetMonth', val);
                  setFieldValue('targetQuarter', null);
                }}
                placeholder="Select month"
                error={Boolean(targetPeriodError)}
                helperText={targetPeriodError || ' '}
              />
            ) : (
              <CustomPeriodPicker
                mode="quarterly"
                label="Quarter-Year *"
                value={values.targetQuarter}
                onChange={(val) => {
                  setFieldValue('targetQuarter', val);
                  setFieldValue('targetMonth', null);
                }}
                placeholder="Select quarter"
                error={Boolean(targetPeriodError)}
                helperText={targetPeriodError || ' '}
                tooltipText="Q1 = Jan-Mar, Q2 = Apr-Jun, Q3 = Jul-Sep, Q4 = Oct-Dec"
              />
            )}
          </Box>

          <Box
            sx={{
              gridColumn: '1 / -1',
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 2,
              alignItems: 'start',
            }}
          >
            <SelectDropdownMultiple
              name="products"
              label="Select Product *"
              options={products}
              value={values.products}
              onChange={(ids) => setFieldValue('products', ids)}
              onBlur={handleBlur}
              disabled={!values.businessEntityId}
              loading={loadingProducts}
              error={Boolean(touched.products && errors.products)}
              helperText={touched.products && errors.products ? errors.products : productHelperText}
            />

            <TextField
              fullWidth
              name="revenueTarget"
              label="Revenue Target *"
              value={values.revenueTarget}
              onChange={handleChange}
              onBlur={handleBlur}
              error={Boolean(touched.revenueTarget && errors.revenueTarget)}
              helperText={touched.revenueTarget && errors.revenueTarget ? errors.revenueTarget : ' '}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Typography component="span" sx={{ fontSize: 18, color: '#94a3b8', fontWeight: 700, lineHeight: 1 }}>
                      ৳
                    </Typography>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  minHeight: '45px',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '8px',
                  '& fieldset': { borderColor: '#e2e8f0' },
                  '&:hover fieldset': { borderColor: '#94a3b8' },
                  '&.Mui-focused fieldset': { borderColor: '#2563eb' },
                },
                '& .MuiInputBase-input': {
                  fontSize: '0.8125rem',
                  padding: '4px 0 !important',
                },
              }}
            />
          </Box>

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

        <Box sx={{ display: 'flex', gap: 2, mt: 4, flexDirection: { xs: 'column', sm: 'row' } }}>
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
        </Box>
      </form>
    </Box>
  );
}
