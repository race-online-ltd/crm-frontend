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
import OrbitLoader from '../../../components/shared/OrbitLoader';
import useInitialTableLoading from '../../../components/shared/useInitialTableLoading';

const validationSchema = Yup.object({
  entityPermissions: Yup.array().of(
    Yup.object({
      entityName: Yup.string().required(),
      read: Yup.boolean().required(),
    }),
  ),
  fieldPermissions: Yup.object({
    read: Yup.boolean().required(),
    write: Yup.boolean().required(),
    modify: Yup.boolean().required(),
  }),
});

export default function DataAccessPermissionDialog({
  open,
  criteria,
  fieldConfig,
  roleLabel,
  featureLabel,
  onClose,
  onSave,
}) {
  const isLoading = useInitialTableLoading();
  const formik = useFormik({
    initialValues: {
      entityPermissions: BUSINESS_ENTITIES.map((entity) => ({
        entityName: entity.label,
        read: false,
      })),
      fieldPermissions: {
        read: false,
        write: false,
        modify: false,
      },
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      if (criteria === 'business_entity') {
        const permissions = values.entityPermissions.reduce((acc, item) => {
          acc[item.entityName] = { read: item.read };
          return acc;
        }, {});

        onSave?.(fieldConfig.fieldName, permissions);
        return;
      }

      onSave?.(fieldConfig.fieldName, values.fieldPermissions);
    },
  });

  const { values, setValues, setFieldValue, handleSubmit, resetForm } = formik;

  useEffect(() => {
    if (!open || !fieldConfig) {
      resetForm();
      return;
    }

    setValues({
      entityPermissions: BUSINESS_ENTITIES.map((entity) => ({
        entityName: entity.label,
        read: Boolean(fieldConfig.permissions?.[entity.label]?.read),
      })),
      fieldPermissions: {
        read: Boolean(fieldConfig.permissions?.read),
        write: Boolean(fieldConfig.permissions?.write),
        modify: Boolean(fieldConfig.permissions?.modify),
      },
    });
  }, [open, fieldConfig, resetForm, setValues]);

  function handleEntityReadChange(index, checked) {
    setFieldValue(`entityPermissions.${index}.read`, checked);
  }

  function handleFieldPermissionChange(permissionKey, checked) {
    setFieldValue(`fieldPermissions.${permissionKey}`, checked);

    if (permissionKey === 'read' && !checked) {
      setFieldValue('fieldPermissions.write', false);
      setFieldValue('fieldPermissions.modify', false);
    }

    if ((permissionKey === 'write' || permissionKey === 'modify') && checked) {
      setFieldValue('fieldPermissions.read', true);
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
        {isLoading ? (
          <OrbitLoader title="Loading permissions" minHeight={220} />
        ) : criteria === 'business_entity' ? (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Business Entity</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Read</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {values.entityPermissions.map((item, index) => (
                <TableRow key={item.entityName}>
                  <TableCell>{item.entityName}</TableCell>
                  <TableCell align="center">
                    <Checkbox
                      checked={item.read}
                      onChange={(e) => handleEntityReadChange(index, e.target.checked)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Access Type</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Allowed</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {['read', 'write', 'modify'].map((permissionKey) => (
                <TableRow key={permissionKey}>
                  <TableCell sx={{ textTransform: 'capitalize' }}>{permissionKey}</TableCell>
                  <TableCell align="center">
                    <Checkbox
                      checked={Boolean(values.fieldPermissions[permissionKey])}
                      onChange={(e) => handleFieldPermissionChange(permissionKey, e.target.checked)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
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
