import React, { useCallback } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import TextInputField from '../../../components/shared/TextInputField';
import NumberInputField from '../../../components/shared/NumberInputField';
import PasswordField from '../../../components/shared/PasswordField';
import SelectDropdownSingle from '../../../components/shared/SelectDropdownSingle';
import SelectDropdownMultiple from '../../../components/shared/SelectDropdownMultiple';
import CustomToggle from '../../../components/shared/CustomToggle';

const phoneValidation = Yup.string()
  .matches(/^\d+$/, 'Phone must contain only numbers')
  .min(10, 'Phone must be at least 10 digits')
  .max(13, 'Phone must be at most 13 digits')
  .required('Phone is required');

const passwordValidation = Yup.string()
  .min(6, 'Password must be at least 6 characters')
  .matches(/[a-z]/, 'Password must include at least one lowercase letter')
  .matches(/[A-Z]/, 'Password must include at least one uppercase letter')
  .matches(/\d/, 'Password must include at least one number')
  .matches(/[^A-Za-z0-9]/, 'Password must include at least one special character');

const passwordHelperText = 'Minimum 6 characters with uppercase, lowercase, number, and special character.';

const validationSchema = Yup.object({
  fullName: Yup.string().required('Full Name is required'),
  userName: Yup.string().required('User Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phone: phoneValidation,
  password: passwordValidation,
  confirmPassword: Yup.string().oneOf([Yup.ref('password'), null], 'Passwords must match'),
  role: Yup.string().required('Role is required'),
  supervisors: Yup.array().of(Yup.string()),
  status: Yup.boolean(),
});

export default function SystemUserForm({ editData = null, onSubmit, onCancel }) {
  const isEdit = Boolean(editData);

  const formik = useFormik({
    initialValues: {
      fullName: editData?.fullName || '',
      userName: editData?.userName || '',
      email: editData?.email || '',
      phone: editData?.phone || '',
      password: '',
      confirmPassword: '',
      role: editData?.role || '',
      supervisors: editData?.supervisors || [],
      status: editData?.status ?? true,
    },
    validationSchema: isEdit
      ? validationSchema.shape({
          password: Yup.string().test(
            'optional-strong-password',
            'Password must be at least 6 characters and include lowercase, uppercase, number, and special character',
            (value) => !value || passwordValidation.isValidSync(value),
          ),
          confirmPassword: Yup.string().test(
            'confirm-password-on-edit',
            'Passwords must match',
            function validateConfirmPassword(value) {
              const { password } = this.parent;
              if (!password) return true;
              if (!value) return this.createError({ message: 'Confirm Password is required' });
              return value === password;
            },
          ),
        })
      : validationSchema.shape({
          password: passwordValidation.required('Password is required'),
          confirmPassword: Yup.string().oneOf([Yup.ref('password'), null], 'Passwords must match').required('Confirm Password is required'),
        }),
    enableReinitialize: true,
    onSubmit: (values) => {
      onSubmit?.(values);
    },
  });

  /* ── MOCK OPTIONS — remove when wiring backend ── */
  const fetchRoles = useCallback(async () => [
    { id: 'admin', label: 'Admin' },
    { id: 'manager', label: 'Manager' },
    { id: 'executive', label: 'Executive' },
    { id: 'viewer', label: 'Viewer' },
  ], []);

  const supervisorOptions = [
    { id: 'sup1', label: 'Supervisor One' },
    { id: 'sup2', label: 'Supervisor Two' },
    { id: 'sup3', label: 'Supervisor Three' },
    { id: 'sup4', label: 'Supervisor Four' },
  ];
  /* ── END MOCK ── */

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
          name="fullName"
          label="Full Name *"
          value={formik.values.fullName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.fullName && Boolean(formik.errors.fullName)}
          helperText={formik.touched.fullName && formik.errors.fullName ? formik.errors.fullName : ' '}
        />

        <TextInputField
          name="userName"
          label="User Name *"
          value={formik.values.userName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.userName && Boolean(formik.errors.userName)}
          helperText={formik.touched.userName && formik.errors.userName ? formik.errors.userName : ' '}
        />

        <TextInputField
          name="email"
          label="Email *"
          type="email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email ? formik.errors.email : ' '}
        />

        <NumberInputField
          name="phone"
          label="Phone *"
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
          helperText={formik.touched.password && formik.errors.password ? formik.errors.password : passwordHelperText}
        />

        <PasswordField
          name="confirmPassword"
          label={isEdit ? 'Confirm New Password' : 'Confirm Password *'}
          value={formik.values.confirmPassword}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
          helperText={formik.touched.confirmPassword && formik.errors.confirmPassword ? formik.errors.confirmPassword : ' '}
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

        <SelectDropdownMultiple
          name="supervisors"
          label="Supervisors"
          options={supervisorOptions}
          value={formik.values.supervisors}
          onChange={(ids) => formik.setFieldValue('supervisors', ids)}
          onBlur={formik.handleBlur}
          error={formik.touched.supervisors && Boolean(formik.errors.supervisors)}
          helperText={formik.touched.supervisors && formik.errors.supervisors ? formik.errors.supervisors : ' '}
        />

        <Box
          sx={{
            gridColumn: '1 / -1',
            display: 'flex',
            alignItems: 'center',
            minHeight: 32,
            px: 1.5,
            mt: -0.5,
            mb: -0.5,
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

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mt={2.5}>
        {onCancel && (
          <Button
            fullWidth
            variant="outlined"
            onClick={onCancel}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '10px',
              borderColor: '#e2e8f0',
              color: '#64748b',
            }}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '10px',
            bgcolor: '#2563eb',
            '&:hover': { bgcolor: '#1d4ed8' },
          }}
        >
          {isEdit ? 'Update User' : 'Create User'}
        </Button>
      </Stack>
    </Box>
  );
}
