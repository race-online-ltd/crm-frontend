// src/features/target/components/SetTarget.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Autocomplete,
  TextField,
  Typography,
  InputAdornment,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

import { fieldSx } from '../../../components/shared/SelectDropdownSingle';
import { CustomPeriodPicker } from '../../../components/shared/date-picker';
import {
  fetchBackoffices,
  fetchBusinessEntities,
  fetchProductsByBusinessEntity,
} from '../../settings/api/settingsApi';
import FormActionButtons from '../../../components/shared/FormActionButtons';

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
  productId: Yup.string().required('Product is required'),
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
  revenueTarget: Yup.number()
    .typeError('Must be a number')
    .positive('Must be greater than 0')
    .required('Revenue target is required'),
});

const INITIAL_VALUES = {
  businessEntityId: '',
  kamId: '',
  productId: '',
  targetMode: 'monthly',
  targetMonth: null,
  targetQuarter: null,
  revenueTarget: '',
};

function toInitialValues(target) {
  if (!target) {
    return { ...INITIAL_VALUES };
  }

  const businessEntityId = String(target.business_entity_id ?? target.businessEntity?.id ?? '');
  const kamId = String(target.kam_id ?? target.kam?.id ?? '');
  const productId = String(target.product_id ?? target.product?.id ?? '');
  const targetMode = target.target_mode === 'quarterly' ? 'quarterly' : 'monthly';
  const targetYear = Number(target.target_year);
  const targetValue = Number(target.target_value);

  return {
    businessEntityId,
    kamId,
    productId,
    targetMode,
    targetMonth: targetMode === 'monthly' && Number.isFinite(targetYear) && Number.isFinite(targetValue)
      ? { year: targetYear, month: Math.max(targetValue - 1, 0) }
      : null,
    targetQuarter: targetMode === 'quarterly' && Number.isFinite(targetYear) && Number.isFinite(targetValue)
      ? { year: targetYear, quarter: targetValue }
      : null,
    revenueTarget: String(target.revenue_target ?? ''),
  };
}

function buildPayload(values) {
  const isMonthly = values.targetMode === 'monthly';
  const period = isMonthly ? values.targetMonth : values.targetQuarter;

  return {
    business_entity_id: Number(values.businessEntityId),
    kam_id: Number(values.kamId),
    product_id: Number(values.productId),
    target_mode: values.targetMode,
    target_value: isMonthly ? Number(period?.month) + 1 : Number(period?.quarter),
    target_year: Number(period?.year),
    revenue_target: Number(values.revenueTarget),
  };
}

function resolveSelectedOptionId(value, options = []) {
  const rawValue = String(value ?? '').trim();
  if (!rawValue) {
    return '';
  }

  const exactMatch = options.find((option) => String(option.id) === rawValue);
  if (exactMatch) {
    return String(exactMatch.id);
  }

  const normalizedValue = rawValue.toLowerCase();
  const labelMatch = options.find((option) => String(option.label ?? '').trim().toLowerCase() === normalizedValue);
  return labelMatch ? String(labelMatch.id) : rawValue;
}

function toOptionList(items = [], labelKey = 'label') {
  return items
    .map((item) => ({
      id: String(item.id),
      label: String(item[labelKey] ?? item.label ?? ''),
    }))
    .filter((item) => item.label);
}

function mergeUniqueOptions(primaryOptions, fallbackOption) {
  if (!fallbackOption) {
    return primaryOptions;
  }

  return Array.from(
    new Map([fallbackOption, ...primaryOptions].map((option) => [option.id, option])).values()
  );
}

function buildInitialOption(option, label) {
  if (!option?.id || !label) {
    return null;
  }

  return {
    id: String(option.id),
    label: String(label),
  };
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

function StableSingleSelect({
  name,
  label,
  value,
  options,
  onChange,
  onBlur,
  error = false,
  helperText,
  disabled = false,
  fullWidth = true,
  placeholder = '',
}) {
  const selectedOption = options.find((option) => option.id === value) || null;

  return (
    <Autocomplete
      options={options}
      disabled={disabled}
      value={selectedOption}
      isOptionEqualToValue={(option, currentValue) => option.id === currentValue?.id}
      getOptionLabel={(option) => option.label || ''}
      onChange={(_, nextValue) => onChange?.(nextValue ? nextValue.id : '')}
      onBlur={onBlur}
      sx={{ width: fullWidth ? '100%' : 240 }}
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
          sx={fieldSx(45)}
        />
      )}
    />
  );
}

export default function SetTarget({
  onCancel,
  onSubmit,
  onSuccess,
  initialTarget = null,
  submitLabel = 'Set Target',
}) {
  const [businessEntities, setBusinessEntities] = useState(() => {
    const fallback = buildInitialOption(
      initialTarget?.businessEntity || initialTarget?.business_entity,
      initialTarget?.businessEntity?.name || initialTarget?.business_entity?.name
    );
    return fallback ? [fallback] : [];
  });
  const [backoffices, setBackoffices] = useState([]);
  const [products, setProducts] = useState(() => {
    const fallback = buildInitialOption(initialTarget?.product, initialTarget?.product?.product_name);
    return fallback ? [fallback] : [];
  });
  const initialBusinessEntityIdRef = useRef(String(initialTarget?.business_entity_id ?? initialTarget?.businessEntity?.id ?? ''));

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const [entities, backofficeRows] = await Promise.all([
          fetchBusinessEntities(),
          fetchBackoffices(),
        ]);

        if (!active) {
          return;
        }

        const fetchedBusinessEntities = toOptionList(entities, 'name');
        const fallbackBusinessEntity = buildInitialOption(
          initialTarget?.businessEntity || initialTarget?.business_entity,
          initialTarget?.businessEntity?.name || initialTarget?.business_entity?.name
        );

        setBusinessEntities(mergeUniqueOptions(fetchedBusinessEntities, fallbackBusinessEntity));
        setBackoffices(Array.isArray(backofficeRows) ? backofficeRows : []);
      } catch {
        if (active) {
          setBusinessEntities([]);
          setBackoffices([]);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    initialBusinessEntityIdRef.current = String(
      initialTarget?.business_entity_id ?? initialTarget?.businessEntity?.id ?? ''
    );
  }, [initialTarget]);

  const formik = useFormik({
    initialValues: toInitialValues(initialTarget),
    enableReinitialize: true,
    validationSchema: setTargetSchema,
    onSubmit: async (values, { setSubmitting }) => {
      const payload = buildPayload({
        ...values,
        businessEntityId: resolveSelectedOptionId(values.businessEntityId, businessEntities),
        kamId: resolveSelectedOptionId(values.kamId, kamOptions),
        productId: resolveSelectedOptionId(values.productId, products),
      });

      try {
        await onSubmit?.(payload, values);
        onSuccess?.(payload, values);
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
    () => mergeUniqueOptions(
      buildKamOptions(backoffices, values.businessEntityId),
      buildInitialOption(
        initialTarget?.kam,
        initialTarget?.kam?.full_name || initialTarget?.kam?.user_name
      )
    ),
    [backoffices, values.businessEntityId]
  );

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      if (!values.businessEntityId) {
        setProducts([]);
        return;
      }

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
          }));

        const fallbackProduct = buildInitialOption(
          initialTarget?.product,
          initialTarget?.product?.product_name
        );

        setProducts(mergeUniqueOptions(filtered, fallbackProduct));
      } catch {
        if (active) {
          setProducts([]);
        }
      }
    };

    loadProducts();

    return () => {
      active = false;
    };
  }, [values.businessEntityId]);

  useEffect(() => {
    if (initialBusinessEntityIdRef.current === values.businessEntityId) {
      return;
    }

    initialBusinessEntityIdRef.current = values.businessEntityId;
    setFieldValue('kamId', '');
    setFieldValue('productId', '');
    setFieldValue('targetMonth', null);
    setFieldValue('targetQuarter', null);
    setProducts([]);
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
  const productDisabled = !values.businessEntityId;

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
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
            <StableSingleSelect
              name="businessEntityId"
              label="Business Entity *"
              value={values.businessEntityId}
              onChange={(id) => setFieldValue('businessEntityId', id)}
              onBlur={handleBlur}
              error={Boolean(touched.businessEntityId && errors.businessEntityId)}
              helperText={touched.businessEntityId && errors.businessEntityId ? errors.businessEntityId : ' '}
              options={businessEntities}
            />
          </Box>

          <Box>
            <StableSingleSelect
              name="kamId"
              label="Select KAM *"
              value={values.kamId}
              onChange={(id) => setFieldValue('kamId', id)}
              onBlur={handleBlur}
              disabled={!values.businessEntityId}
              error={Boolean(touched.kamId && errors.kamId)}
              helperText={touched.kamId && errors.kamId ? errors.kamId : ' '}
              options={kamOptions}
            />
          </Box>

          <Box>
            <StableSingleSelect
              name="productId"
              label="Select Product *"
              value={values.productId}
              onChange={(id) => setFieldValue('productId', id)}
              onBlur={handleBlur}
              disabled={productDisabled}
              error={Boolean(touched.productId && errors.productId)}
              helperText={touched.productId && errors.productId ? errors.productId : ' '}
              options={products}
            />
          </Box>

          <Box>
            <StableSingleSelect
              name="targetMode"
              label="Target Mode *"
              value={values.targetMode}
              onChange={(mode) => {
                setFieldValue('targetMode', mode);
                setFieldValue('targetMonth', null);
                setFieldValue('targetQuarter', null);
              }}
              onBlur={handleBlur}
              error={Boolean(touched.targetMode && errors.targetMode)}
              helperText={targetModeError}
              options={TARGET_MODES}
            />
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

            <Box>
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
          </Box>
        </Box>

        <FormActionButtons
          onCancel={handleCancel}
          submitLabel={submitLabel}
          submitIcon={<CheckCircleOutlineIcon />}
          loading={isSubmitting}
          disabled={isSubmitting}
          mt={4}
        />
      </form>
    </Box>
  );
}
