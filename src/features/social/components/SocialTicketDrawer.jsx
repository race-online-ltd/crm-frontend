import { useEffect, useMemo, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  Divider,
  Stack,
} from '@mui/material';
import SelectDropdownSingle from '../../../components/shared/SelectDropdownSingle';
import TextAreaInputField from '../../../components/shared/TextAreaInputField';
import AttachmentField from '../../../components/shared/AttachmentField';
import SocialFloatingPanel from './SocialFloatingPanel';
import { useSocial } from '../context/SocialContext';
import { entities } from '../data/mockData';

const TICKET_CATEGORY_OPTIONS = [
  { id: 'technical', label: 'Technical Support' },
  { id: 'billing', label: 'Billing' },
  { id: 'sales', label: 'Sales' },
  { id: 'service', label: 'Service Request' },
];

const TICKET_SUB_CATEGORY_OPTIONS = {
  technical: [
    { id: 'network_down', label: 'Network Down' },
    { id: 'slow_speed', label: 'Slow Speed' },
    { id: 'router_issue', label: 'Router Issue' },
  ],
  billing: [
    { id: 'invoice_query', label: 'Invoice Query' },
    { id: 'payment_issue', label: 'Payment Issue' },
    { id: 'refund_request', label: 'Refund Request' },
  ],
  sales: [
    { id: 'new_connection', label: 'New Connection' },
    { id: 'plan_upgrade', label: 'Plan Upgrade' },
    { id: 'demo_request', label: 'Demo Request' },
  ],
  service: [
    { id: 'site_visit', label: 'Site Visit' },
    { id: 'relocation', label: 'Relocation' },
    { id: 'general_follow_up', label: 'General Follow Up' },
  ],
};

const ENTITY_OPTIONS = entities.map((entity) => ({
  id: entity,
  label: entity,
}));

const validationSchema = Yup.object({
  businessEntity: Yup.string().required('Business entity is required'),
  category: Yup.string().required('Category is required'),
  subCategory: Yup.string().required('Sub category is required'),
  description: Yup.string().trim().required('Description is required'),
  attachment: Yup.array().default([]),
});

export default function SocialTicketDrawer({ open, onClose, onSubmitted }) {
  const { activeEntity, showToast } = useSocial();

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      businessEntity: activeEntity || '',
      category: '',
      subCategory: '',
      description: '',
      attachment: [],
    },
    validationSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        console.log('Convert chat to ticket payload:', values);
        showToast?.('Ticket conversion draft created.');
        resetForm({
          values: {
            businessEntity: activeEntity || '',
            category: '',
            subCategory: '',
            description: '',
            attachment: [],
          },
        });
        onClose();
        onSubmitted?.();
      } finally {
        setSubmitting(false);
      }
    },
  });

  const subCategoryOptions = useMemo(
    () => TICKET_SUB_CATEGORY_OPTIONS[formik.values.category] || [],
    [formik.values.category],
  );

  useEffect(() => {
    formik.setFieldValue('businessEntity', activeEntity || '', false);
  }, [activeEntity]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (open) {
      formik.setFieldValue('businessEntity', activeEntity || '', false);
    }
  }, [activeEntity, open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const hasSelectedSubCategory = subCategoryOptions.some(
      (option) => option.id === formik.values.subCategory,
    );

    if (!hasSelectedSubCategory && formik.values.subCategory) {
      formik.setFieldValue('subCategory', '');
    }
  }, [formik.values.subCategory, subCategoryOptions]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <SocialFloatingPanel
      open={open}
      onClose={onClose}
      title="Convert to Ticket"
      width={420}
      height={680}
    >
      <Box
        component="form"
        onSubmit={formik.handleSubmit}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Stack spacing={2} sx={{ flex: 1, minHeight: 0 }}>
          <SelectDropdownSingle
            name="businessEntity"
            label="Business Entity"
            options={ENTITY_OPTIONS}
            value={formik.values.businessEntity}
            onChange={(value) => formik.setFieldValue('businessEntity', value)}
            onBlur={formik.handleBlur}
            error={formik.touched.businessEntity && Boolean(formik.errors.businessEntity)}
            helperText={formik.touched.businessEntity ? formik.errors.businessEntity : ''}
            disabled
          />

          <SelectDropdownSingle
            name="category"
            label="Category"
            options={TICKET_CATEGORY_OPTIONS}
            value={formik.values.category}
            onChange={(value) => {
              formik.setFieldValue('category', value);
              formik.setFieldValue('subCategory', '');
            }}
            onBlur={() => formik.setFieldTouched('category', true)}
            error={formik.touched.category && Boolean(formik.errors.category)}
            helperText={formik.touched.category ? formik.errors.category : ''}
          />

          <SelectDropdownSingle
            name="subCategory"
            label="Sub Category"
            options={subCategoryOptions}
            value={formik.values.subCategory}
            onChange={(value) => formik.setFieldValue('subCategory', value)}
            onBlur={() => formik.setFieldTouched('subCategory', true)}
            error={formik.touched.subCategory && Boolean(formik.errors.subCategory)}
            helperText={formik.touched.subCategory ? formik.errors.subCategory : ''}
            disabled={!formik.values.category}
          />

          <TextAreaInputField
            name="description"
            label="Description"
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            minRows={2}
            maxRows={8}
            resize="vertical"
            error={formik.touched.description && Boolean(formik.errors.description)}
            helperText={formik.touched.description ? formik.errors.description : ''}
          />

          <AttachmentField
            value={formik.values.attachment}
            onChange={(files) => formik.setFieldValue('attachment', files)}
          />
        </Stack>

        <Divider sx={{ mt: 2 }} />
        <Stack
          direction="row"
          spacing={1.5}
          justifyContent="flex-end"
          sx={{ pt: 2, bgcolor: '#fff' }}
        >
          <Button
            type="button"
            variant="outlined"
            onClick={onClose}
            sx={{ textTransform: 'none', borderRadius: '10px' }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={formik.isSubmitting}
            sx={{ textTransform: 'none', borderRadius: '10px', boxShadow: 'none' }}
          >
            Create Ticket
          </Button>
        </Stack>
      </Box>
    </SocialFloatingPanel>
  );
}
