import React, { useCallback } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import TextInputField from '../../../components/shared/TextInputField';
import NumberInputField from '../../../components/shared/NumberInputField';
import PasswordField from '../../../components/shared/PasswordField';
import SelectDropdownSingle from '../../../components/shared/SelectDropdownSingle';
import SelectDropdownMultiple from '../../../components/shared/SelectDropdownMultiple';
import CustomToggle from '../../../components/shared/CustomToggle';
import FormActionButtons from '../../../components/shared/FormActionButtons';

const optionalEmailValidation = Yup.string()
  .trim()
  .transform((value, originalValue) => (originalValue?.trim() === '' ? null : value))
  .nullable()
  .email('Invalid email');

const optionalPhoneValidation = Yup.string()
  .trim()
  .transform((value, originalValue) => (originalValue?.trim() === '' ? null : value))
  .nullable()
  .matches(/^\d+$/, {
    message: 'Phone must contain only numbers',
    excludeEmptyString: true,
  })
  .min(10, 'Phone must be at least 10 digits')
  .max(13, 'Phone must be at most 13 digits');

const passwordValidation = Yup.string()
  .min(6, 'Password must be at least 6 characters')
  .matches(/[a-z]/, 'Password must include at least one lowercase letter')
  .matches(/[A-Z]/, 'Password must include at least one uppercase letter')
  .matches(/\d/, 'Password must include at least one number')
  .matches(/[^A-Za-z0-9]/, 'Password must include at least one special character');

const passwordHelperText = 'Minimum 6 characters with uppercase, lowercase, number, and special character.';

const validationSchema = Yup.object({
  full_name: Yup.string().required('Full Name is required'),
  user_name: Yup.string().required('User Name is required'),
  email: optionalEmailValidation,
  phone: optionalPhoneValidation,
  password: passwordValidation,
  confirm_password: Yup.string().oneOf([Yup.ref('password'), null], 'Passwords must match'),
  role: Yup.mixed().required('Role is required'),
  status: Yup.boolean(),
});

export default function SystemUserForm({ editData = null, onSubmit, onCancel, fetchRoles: fetchRolesProp }) {
  const isEdit = Boolean(editData);

  const formik = useFormik({
    initialValues: {
      full_name: editData?.full_name || '',
      user_name: editData?.user_name || '',
      email: editData?.email || '',
      phone: editData?.phone || '',
      password: '',
      confirm_password: '',
      role: editData?.role || editData?.role_id || '',
      status: editData?.status ?? true,
    },
    validationSchema: isEdit
      ? validationSchema.shape({
          password: Yup.string().test(
            'optional-strong-password',
            'Password must be at least 6 characters and include lowercase, uppercase, number, and special character',
            (value) => !value || passwordValidation.isValidSync(value),
          ),
          confirm_password: Yup.string().test(
            'confirm-password-on-edit',
            'Passwords must match',
            function validateConfirm_password(value) {
              const { password } = this.parent;
              if (!password) return true;
              if (!value) return this.createError({ message: 'Confirm Password is required' });
              return value === password;
            },
          ),
        })
      : validationSchema.shape({
          password: passwordValidation.required('Password is required'),
          confirm_password: Yup.string().oneOf([Yup.ref('password'), null], 'Passwords must match').required('Confirm Password is required'),
        }),
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await onSubmit?.(values);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const fetchRoles = useCallback(
    async () => (await fetchRolesProp?.()) || [],
    [fetchRolesProp],
  );

  return (
    <Box component="form" onSubmit={formik.handleSubmit} noValidate sx={{ width: '100%' }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: '0px 20px',
          width: '100%',
        }}
      >
        <TextInputField
          name="full_name"
          label="Full Name *"
          value={formik.values.full_name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.full_name && Boolean(formik.errors.full_name)}
          helperText={formik.touched.full_name && formik.errors.full_name ? formik.errors.full_name : ' '}
        />

        <TextInputField
          name="user_name"
          label="User Name *"
          value={formik.values.user_name }
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.user_name && Boolean(formik.errors.user_name)}
          helperText={formik.touched.user_name && formik.errors.user_name ? formik.errors.user_name : ' '}
        />

        <TextInputField
          name="email"
          label="Email"
          type="email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email ? formik.errors.email : ' '}
        />

        <NumberInputField
          name="phone"
          label="Phone"
          value={formik.values.phone}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.phone && Boolean(formik.errors.phone)}
          helperText={formik.touched.phone && formik.errors.phone ? formik.errors.phone : ' '}
        />

        <PasswordField
          name="password"
          label={isEdit ? 'New Password' : 'Password *'}
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.password && Boolean(formik.errors.password)}
          helperText={formik.touched.password && formik.errors.password ? formik.errors.password : ' '}
          tooltipText={passwordHelperText}
        />

        <PasswordField
          name="confirm_password"
          label={isEdit ? 'Confirm New Password' : 'Confirm Password *'}
          value={formik.values.confirm_password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.confirm_password && Boolean(formik.errors.confirm_password)}
          helperText={formik.touched.confirm_password && formik.errors.confirm_password ? formik.errors.confirm_password : ' '}
        />

        <SelectDropdownSingle
          name="role"
          label="Role *"
          fetchOptions={fetchRoles}
          value={formik.values.role}
          onChange={(id) => formik.setFieldValue('role', id)}
          onBlur={formik.handleBlur}
          error={formik.touched.role && Boolean(formik.errors.role)}
          helperText={formik.touched.role && formik.errors.role ? formik.errors.role : ' '}
        />

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            minHeight: 45,
            justifyContent: { xs: 'flex-start', sm: 'flex-start' },
            transform: { xs: 'none', sm: 'translateY(-12px) translateX(15px)' },
          }}
        >
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Typography fontSize={13} fontWeight={600} color="#475569">
              Status
            </Typography>
            <CustomToggle
              size="sm"
              label={formik.values.status ? 'Active' : 'Inactive'}
              checked={formik.values.status}
              onChange={(e) => formik.setFieldValue('status', e.target.checked)}
            />
          </Stack>
        </Box>
      </Box>

      <FormActionButtons
        onCancel={onCancel}
        submitLabel={formik.isSubmitting ? 'Saving...' : isEdit ? 'Update User' : 'Create User'}
        disabled={formik.isSubmitting}
      />
    </Box>
  );
}
