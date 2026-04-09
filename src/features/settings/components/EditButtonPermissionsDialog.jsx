import React from 'react';
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

/**
 * EditButtonPermissionsDialog
 *
 * Props:
 *  - open         {boolean}   Dialog visibility
 *  - onClose      {function}  Called when dialog is dismissed
 *  - page         {object}    The ROLE_MAPPING_PAGES row: { id, label, buttons: [{ id, label }] }
 *  - permissions  {object}    Current permission map for the selected role: { [itemId]: boolean }
 *  - onSave       {function}  Called with updated permissions object { [itemId]: boolean }
 */
export default function EditButtonPermissionsDialog({ open, onClose, page, permissions = {}, onSave }) {
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: Object.fromEntries(
      (page?.buttons || []).map((btn) => [btn.id, Boolean(permissions[btn.id])])
    ),
    onSubmit: (values) => {
      onSave?.({ pageId: page.id, buttonPermissions: values });
      onClose();
    },
  });

  if (!page) return null;

  const enabledCount = Object.values(formik.values).filter(Boolean).length;
  const totalCount = page.buttons.length;
  const allEnabled = totalCount > 0 && enabledCount === totalCount;

  function handleToggleAll(enabled) {
    page.buttons.forEach((btn) => formik.setFieldValue(btn.id, enabled));
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography fontWeight={700} fontSize={16}>Edit Permissions</Typography>
        <Typography fontSize={12.5} color="text.secondary" mt={0.5}>
          Button permissions for {page.label}
        </Typography>
      </DialogTitle>

      <DialogContent>
        {page.buttons.length === 0 ? (
          <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 180 }}>
            <Typography fontSize={13} color="#94a3b8">
              No buttons defined for this page.
            </Typography>
          </Stack>
        ) : (
          <>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography fontSize={12.5} color="text.secondary">
                {enabledCount} of {totalCount} selected
              </Typography>
              <Button
                size="small"
                variant="text"
                onClick={() => handleToggleAll(!allEnabled)}
                sx={{ textTransform: 'none', fontWeight: 700, fontSize: 12, color: '#2563eb' }}
              >
                {allEnabled ? 'Unselect All' : 'Select All'}
              </Button>
            </Stack>

            <form id="edit-button-permissions-form" onSubmit={formik.handleSubmit}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Button</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, width: 90 }}>Allowed</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {page.buttons.map((btn) => {
                    const isEnabled = Boolean(formik.values[btn.id]);

                    return (
                      <TableRow key={btn.id} hover selected={isEnabled}>
                        <TableCell sx={{ fontSize: 13.5, fontWeight: isEnabled ? 600 : 400, color: isEnabled ? '#1e40af' : '#475569' }}>
                          {btn.label}
                        </TableCell>
                        <TableCell align="center">
                          <Checkbox
                            checked={isEnabled}
                            onChange={(e) => formik.setFieldValue(btn.id, e.target.checked)}
                            size="small"
                            sx={{
                              color: '#cbd5e1',
                              '&.Mui-checked': { color: '#2563eb' },
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </form>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" color="inherit" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="edit-button-permissions-form"
            variant="contained"
            disabled={page.buttons.length === 0}
          >
            Save Permissions
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
