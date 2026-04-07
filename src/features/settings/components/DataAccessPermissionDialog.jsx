import React, { useEffect } from 'react';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { BUSINESS_ENTITIES } from '../constants/dataAccessControl';

const validationSchema = Yup.object({
  permissions: Yup.array().of(
    Yup.object({
      entityName: Yup.string().required(),
      read: Yup.boolean().required(),
      write: Yup.boolean().required(),
    }),
  ),
});

export default function DataAccessPermissionDialog({
  open,
  fieldConfig,
  roleLabel,
  featureLabel,
  onClose,
  onSave,
}) {
  const formik = useFormik({
    initialValues: {
      permissions: BUSINESS_ENTITIES.map((entityName) => ({
        entityName,
        read: false,
        write: false,
      })),
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      const permissions = values.permissions.reduce((acc, item) => {
        acc[item.entityName] = { read: item.read, write: item.write };
        return acc;
      }, {});

      onSave?.(fieldConfig.fieldName, permissions);
    },
  });

  const { values, setValues, setFieldValue, handleSubmit, resetForm } = formik;

  useEffect(() => {
    if (!open || !fieldConfig) {
      resetForm();
      return;
    }

    setValues({
      permissions: BUSINESS_ENTITIES.map((entityName) => ({
        entityName,
        read: Boolean(fieldConfig.permissions?.[entityName]?.read),
        write: Boolean(fieldConfig.permissions?.[entityName]?.write),
      })),
    });
  }, [open, fieldConfig, resetForm, setValues]);

  function handleReadChange(index, checked) {
    setFieldValue(`permissions.${index}.read`, checked);
    if (!checked) {
      setFieldValue(`permissions.${index}.write`, false);
    }
  }

  function handleWriteChange(index, checked) {
    setFieldValue(`permissions.${index}.write`, checked);
    if (checked) {
      setFieldValue(`permissions.${index}.read`, true);
    }
  }

  function handleClose() {
    resetForm();
    onClose?.();
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Typography fontWeight={700} fontSize={16}>Edit Permissions</Typography>
        <Typography fontSize={12.5} color="text.secondary" mt={0.5}>
          {fieldConfig?.fieldName} for {roleLabel || 'Selected Role'} in {featureLabel || 'Selected Feature'}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Business Entity</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Read</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Write</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {values.permissions.map((item, index) => (
              <TableRow key={item.entityName}>
                <TableCell>{item.entityName}</TableCell>
                <TableCell align="center">
                  <Checkbox
                    checked={item.read}
                    onChange={(e) => handleReadChange(index, e.target.checked)}
                  />
                </TableCell>
                <TableCell align="center">
                  <Checkbox
                    checked={item.write}
                    onChange={(e) => handleWriteChange(index, e.target.checked)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" color="inherit" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmit}>
            Save Permissions
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
