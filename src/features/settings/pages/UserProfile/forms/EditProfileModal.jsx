import React, { useState } from 'react';
import {
  Avatar,
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
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import CloseIcon from '@mui/icons-material/Close';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

import TextInputField from '../../../../../components/shared/TextInputField';

const profileSchema = Yup.object({
  fullName: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  mobile: Yup.string()
    .matches(/^[+\d][\d\s()-]*$/, 'Enter a valid mobile number')
    .required('Mobile number is required'),
});

export default function EditProfileModal({ open, profile, onClose, onSave }) {
  const [avatarError, setAvatarError] = useState('');

  const initialValues = {
    fullName: profile?.fullName || '',
    email: profile?.email || '',
    mobile: profile?.mobile || '',
    avatar: profile?.avatar || '',
  };

  const handleAvatarChange = (event, setFieldValue) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024) {
      setAvatarError('Avatar image must be 100KB or smaller.');
      return;
    }

    setAvatarError('');

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setFieldValue('avatar', result);
    };
    reader.readAsDataURL(file);
  };

  const handleClose = () => {
    setAvatarError('');
    onClose?.();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <PersonOutlineIcon sx={{ fontSize: 20, color: '#2563eb' }} />
          </Box>

          <Box>
            <Typography fontWeight={800} fontSize="1rem" color="#0f172a" lineHeight={1.2}>
              Edit Profile
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Update name, email, mobile, and photo.
            </Typography>
          </Box>

          <Box flex={1} />

          <IconButton
            size="small"
            onClick={handleClose}
            sx={{ color: '#94a3b8', '&:hover': { bgcolor: '#f1f5f9' }, '&:focus': { outline: 'none' } }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Formik
        initialValues={initialValues}
        validationSchema={profileSchema}
        enableReinitialize
        onSubmit={(values, { setSubmitting }) => {
          onSave?.(values);
          setSubmitting(false);
          onClose?.();
        }}
      >
        {({ values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting, dirty }) => (
          <Form>
            <DialogContent sx={{ px: 3.5, py: 3 }}>
              <Stack spacing={2}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ position: 'relative' }}>
                    <Avatar
                      src={values.avatar || profile?.avatar || ''}
                      sx={{
                        width: 82,
                        height: 82,
                        bgcolor: '#2563eb',
                        fontSize: 30,
                        fontWeight: 800,
                      }}
                    >
                      {!values.avatar && !profile?.avatar ? values.fullName?.charAt(0) || 'U' : null}
                    </Avatar>
                    <Button
                      component="label"
                      variant="contained"
                      size="small"
                      sx={{
                        position: 'absolute',
                        right: -6,
                        bottom: -6,
                        minWidth: 34,
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        p: 0,
                      }}
                    >
                      <PhotoCameraOutlinedIcon sx={{ fontSize: 16 }} />
                      <input
                        hidden
                        accept="image/*"
                        type="file"
                        onChange={(event) => handleAvatarChange(event, setFieldValue)}
                      />
                    </Button>
                  </Box>

                  <Box>
                    <Typography fontWeight={800} color="#0f172a">
                      {values.fullName || 'User Name'}
                    </Typography>
                    <Typography variant="body2" color="#64748b">
                      Avatar image must be 100KB or smaller
                    </Typography>
                  </Box>
                </Stack>

                {avatarError && (
                  <Typography variant="body2" color="#dc2626">
                    {avatarError}
                  </Typography>
                )}

                <TextInputField
                  name="fullName"
                  label="Name *"
                  value={values.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.fullName && Boolean(errors.fullName)}
                  helperText={touched.fullName && errors.fullName ? errors.fullName : ' '}
                />

                <TextInputField
                  name="email"
                  label="Email *"
                  type="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email ? errors.email : ' '}
                />

                <TextInputField
                  name="mobile"
                  label="Mobile *"
                  value={values.mobile}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.mobile && Boolean(errors.mobile)}
                  helperText={touched.mobile && errors.mobile ? errors.mobile : ' '}
                />
              </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3.5, pb: 3.5, pt: 0, gap: 1.5 }}>
              <Button
                variant="outlined"
                onClick={handleClose}
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
                disabled={!dirty || isSubmitting}
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
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
}
