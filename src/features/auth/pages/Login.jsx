import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Box, Paper, Typography, Button } from '@mui/material';

import TextInputField from '@shared/TextInputField';
import PasswordInputField from '@shared/PasswordField';

const LoginSchema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  password: Yup.string().required('Password is required'),
});

export default function Login() {
  const initialValues = {
    username: '',
    password: '',
  };

  const handleSubmit = (values) => {
    console.log('Login payload:', values);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        bgcolor: '#f8f9fa',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Center content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: { xs: '90%', sm: 380, md: 400 },
            p: { xs: 4, sm: 5 },
            borderRadius: 4,
            bgcolor: '#fff',
            boxShadow: '0px 10px 20px rgba(0,0,0,0.06)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, mb: 4, textAlign: 'center' }}
          >
            Login
          </Typography>

          <Formik
  initialValues={initialValues}
  validationSchema={LoginSchema}
  onSubmit={async (values, { setSubmitting }) => {
    // Simulate API Call
    await new Promise(r => setTimeout(r, 2000));
    console.log('Login payload:', values);
    setSubmitting(false);
  }}
>
  {({ values, errors, touched, handleChange, handleBlur, isValid, dirty, isSubmitting }) => (
    <Form style={{ width: '100%' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        
        <TextInputField
          name="username"
          label="Username"
          value={values.username}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.username && Boolean(errors.username)}
          helperText={touched.username && errors.username ? errors.username : ' '}
        />

        <PasswordInputField
          name="password"
          label="Password"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.password && Boolean(errors.password)}
          helperText={touched.password && errors.password ? errors.password : ' '}
        />

        <Button
          type="submit"
          fullWidth
          disabled={!(isValid && dirty) || isSubmitting}
          sx={{
            mt: 1,
            height: 45,
            borderRadius: 2,
            bgcolor: '#698ab6',
             color: 'white',
            '&:hover': { bgcolor: '#1b58a9' },
            '&.Mui-disabled': { bgcolor: '#e0e0e0', color: '#9e9e9e' },
          }}
        >
          {isSubmitting ? 'Verifying...' : 'Log In'}
        </Button>
      </Box>
    </Form>
  )}
</Formik>
        </Paper>
      </Box>

      {/* Sticky Footer */}
      <Box
        sx={{
          width: '100%',
          py: 2,
          bgcolor: '#f8f9fa',
          textAlign: 'center',
        }}
      >
        <Typography variant="body2" sx={{ color: '#999', fontWeight: 500 }}>
                &copy; {new Date().getFullYear()}{' '} 
                <a 
                    href='https://www.race.net.bd/' 
                    target='_blank' 
                    rel="noopener noreferrer"
                    style={{ 
                    color: '#88B644', // A professional "Success" green
                    textDecoration: 'none',
                    fontWeight: 600 
                    }}
                >
                    Race Online Ltd.
                </a>
                {' '}Software Division
                </Typography>
      </Box>
    </Box>
  );
}