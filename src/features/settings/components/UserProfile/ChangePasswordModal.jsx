import React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

import PasswordField from '../../../../components/shared/PasswordField';

const passwordSchema = Yup.object({
  oldPassword: Yup.string().required('Old password is required'),
  newPassword: Yup.string()
    .min(6, 'New password must be at least 6 characters')
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Confirm password is required'),
});

export default function ChangePasswordModal({ open, onClose, onSave }) {
  const initialValues = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  };
  const [submitError, setSubmitError] = React.useState('');

  return (
    <Dialog
      open={open}
      onClose={() => {
        setSubmitError('');
        onClose?.();
      }}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 4 },
          boxShadow: '0px 10px 20px rgba(0,0,0,0.06)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle sx={{ px: 3.5, pt: 3, pb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '12px',
              bgcolor: '#eff6ff',
              border: '1px solid #bfdbfe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <LockOutlinedIcon sx={{ fontSize: 20, color: '#2563eb' }} />
          </Box>

          <Box>
            <Typography fontWeight={800} fontSize="1rem" color="#0f172a" lineHeight={1.2}>
              Change Password
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Use your current password and set a new one.
            </Typography>
          </Box>

          <Box flex={1} />

          <IconButton
            size="small"
            onClick={onClose}
            sx={{ color: '#94a3b8', '&:hover': { bgcolor: '#f1f5f9' }, '&:focus': { outline: 'none' } }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Formik
        initialValues={initialValues}
        validationSchema={passwordSchema}
        onSubmit={async (values, { resetForm, setSubmitting }) => {
          setSubmitError('');

          try {
            await onSave?.(values);
            resetForm();
            onClose?.();
          } catch (error) {
            setSubmitError(error?.message || 'Unable to update password.');
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ values, errors, touched, handleChange, handleBlur, isSubmitting, dirty, isValid }) => (
          <Form>
            <DialogContent sx={{ px: 3.5, py: 3 }}>
              <Stack spacing={2}>
                <PasswordField
                  name="oldPassword"
                  label="Old Password *"
                  value={values.oldPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.oldPassword && Boolean(errors.oldPassword)}
                  helperText={touched.oldPassword && errors.oldPassword ? errors.oldPassword : ' '}
                />

                <PasswordField
                  name="newPassword"
                  label="New Password *"
                  value={values.newPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.newPassword && Boolean(errors.newPassword)}
                  helperText={touched.newPassword && errors.newPassword ? errors.newPassword : ' '}
                />

                <PasswordField
                  name="confirmPassword"
                  label="Confirm Password *"
                  value={values.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                  helperText={touched.confirmPassword && errors.confirmPassword ? errors.confirmPassword : ' '}
                />

                {submitError && (
                  <Typography variant="body2" color="#dc2626">
                    {submitError}
                  </Typography>
                )}
              </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3.5, pb: 3.5, pt: 0, gap: 1.5 }}>
              <Button
                variant="outlined"
                onClick={onClose}
                fullWidth
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: '10px',
                  height: 36,
                  borderColor: '#c7d2fe',
                  color: '#2563eb',
                  '&:hover': {
                    borderColor: '#a5b4fc',
                    bgcolor: '#f8fbff',
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                fullWidth
                disabled={!(isValid && dirty) || isSubmitting}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: '10px',
                  height: 36,
                  bgcolor: '#2563eb',
                  color: 'white',
                  '&:hover': { bgcolor: '#1d4ed8' },
                  '&.Mui-disabled': { bgcolor: '#e0e0e0', color: '#9e9e9e' },
                }}
              >
                {isSubmitting ? 'Updating...' : 'Update'}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
}
