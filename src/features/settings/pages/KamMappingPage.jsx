import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import SelectDropdownMultiple from '../../../components/shared/SelectDropdownMultiple';
import SelectDropdownSingle from '../../../components/shared/SelectDropdownSingle';
import {
  fetchKamMappingOptions,
  fetchKamProductMapping,
  fetchProductsByBusinessEntity,
  saveKamProductMapping,
} from '../api/settingsApi';

const EMPTY_FORM = {
  user_id: '',
  business_entity_id: '',
  product_ids: [],
};

export default function KamMappingPage() {
  const [formValues, setFormValues] = useState(EMPTY_FORM);
  const [systemUsers, setSystemUsers] = useState([]);
  const [businessEntities, setBusinessEntities] = useState([]);
  const [products, setProducts] = useState([]);
  const [pageError, setPageError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const [isMappingLoading, setIsMappingLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let active = true;

    const loadOptions = async () => {
      try {
        setIsBootstrapping(true);
        setPageError('');
        const data = await fetchKamMappingOptions();

        if (!active) {
          return;
        }

        setSystemUsers(data.system_users ?? []);
        setBusinessEntities(data.business_entities ?? []);
      } catch (error) {
        if (active) {
          setPageError(error?.message || 'Unable to load KAM mapping options.');
        }
      } finally {
        if (active) {
          setIsBootstrapping(false);
        }
      }
    };

    loadOptions();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      if (!formValues.business_entity_id) {
        setProducts([]);
        setFormValues((prev) => ({ ...prev, product_ids: [] }));
        return;
      }

      try {
        setIsProductsLoading(true);
        setPageError('');
        const data = await fetchProductsByBusinessEntity(formValues.business_entity_id);

        if (!active) {
          return;
        }

        setProducts(
          data.map((product) => ({
            id: String(product.id),
            label: product.product_name || product.label,
          })),
        );
      } catch (error) {
        if (active) {
          setProducts([]);
          setFormValues((prev) => ({ ...prev, product_ids: [] }));
          setPageError(error?.message || 'Unable to load products for the selected business entity.');
        }
      } finally {
        if (active) {
          setIsProductsLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      active = false;
    };
  }, [formValues.business_entity_id]);

  useEffect(() => {
    let active = true;

    const loadSavedMapping = async () => {
      if (!formValues.user_id || !formValues.business_entity_id) {
        setFormValues((prev) => ({ ...prev, product_ids: [] }));
        setSuccessMessage('');
        setSaveError('');
        return;
      }

      try {
        setIsMappingLoading(true);
        setSaveError('');
        setSuccessMessage('');
        const data = await fetchKamProductMapping({
          user_id: formValues.user_id,
          business_entity_id: formValues.business_entity_id,
        });

        if (!active) {
          return;
        }

        setFormValues((prev) => ({
          ...prev,
          product_ids: Array.isArray(data.product_ids) ? data.product_ids.map((id) => String(id)) : [],
        }));
      } catch (error) {
        if (active) {
          setSaveError(error?.message || 'Unable to load saved KAM product mapping.');
          setFormValues((prev) => ({ ...prev, product_ids: [] }));
        }
      } finally {
        if (active) {
          setIsMappingLoading(false);
        }
      }
    };

    loadSavedMapping();

    return () => {
      active = false;
    };
  }, [formValues.user_id, formValues.business_entity_id]);

  const systemUserFetcher = useMemo(() => async () => systemUsers, [systemUsers]);
  const businessEntityFetcher = useMemo(() => async () => businessEntities, [businessEntities]);

  const handleSave = async () => {
    try {
      setSaveError('');
      setSuccessMessage('');

      if (!formValues.user_id || !formValues.business_entity_id || formValues.product_ids.length === 0) {
        setSaveError('Select a system user, business entity, and at least one product.');
        return;
      }

      setIsSaving(true);
      await saveKamProductMapping({
        user_id: formValues.user_id,
        business_entity_id: formValues.business_entity_id,
        product_ids: formValues.product_ids,
      });

      setSuccessMessage('KAM product mapping saved successfully.');
    } catch (error) {
      setSaveError(error?.message || 'Unable to save KAM product mapping.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff', px: { xs: 2, sm: 3, md: 3 }, py: { xs: 3, sm: 3 } }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 3 }}>
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: '12px',
            bgcolor: '#eff6ff',
            border: '1px solid #bfdbfe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <HubOutlinedIcon sx={{ fontSize: 22, color: '#2563eb' }} />
        </Box>

        <Box>
          <Typography variant="h5" fontWeight={800} color="#111827" letterSpacing="-0.3px">
            KAM Mapping
          </Typography>
          <Typography variant="body2" color="#64748b">
            Map system users to products by business entity.
          </Typography>
        </Box>
      </Stack>

      <Paper
        elevation={0}
        sx={{
          borderRadius: '14px',
          border: '1px solid #d1d9e0',
          bgcolor: '#fff',
          p: { xs: 2, sm: 2.5 },
        }}
      >
        <Typography variant="subtitle1" fontWeight={700} color="#0f172a" mb={0.5}>
          Product Assignment
        </Typography>
        <Typography variant="body2" color="#64748b" mb={2}>
          Choose a system user, then a business entity, then assign one or more products from that entity.
        </Typography>

        {pageError && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
            {pageError}
          </Alert>
        )}

        {saveError && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
            {saveError}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: '12px' }}>
            {successMessage}
          </Alert>
        )}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: { xs: '16px', md: '18px 20px' },
            alignItems: 'start',
            width: '100%',
          }}
        >
          <SelectDropdownSingle
            name="user_id"
            label="System User"
            fetchOptions={systemUserFetcher}
            value={formValues.user_id}
            onChange={(id) => setFormValues((prev) => ({ ...prev, user_id: id }))}
            disabled={isBootstrapping}
          />

          <SelectDropdownSingle
            name="business_entity_id"
            label="Business Entity"
            fetchOptions={businessEntityFetcher}
            value={formValues.business_entity_id}
            onChange={(id) => setFormValues((prev) => ({ ...prev, business_entity_id: id, product_ids: [] }))}
            disabled={isBootstrapping}
          />

          <Box sx={{ gridColumn: '1 / -1' }}>
            <SelectDropdownMultiple
              name="product_ids"
              label="Products"
              options={products}
              value={formValues.product_ids}
              onChange={(ids) => setFormValues((prev) => ({ ...prev, product_ids: ids }))}
              disabled={!formValues.business_entity_id || isMappingLoading}
              helperText={!formValues.business_entity_id ? 'Select a business entity first' : ' '}
              loading={isProductsLoading || isMappingLoading}
              limitTags={5}
            />
          </Box>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="flex-end" mt={2.5}>
          <Button
            variant="outlined"
            onClick={() => {
              setFormValues(EMPTY_FORM);
              setProducts([]);
              setPageError('');
              setSaveError('');
              setSuccessMessage('');
            }}
            sx={{
              minWidth: { xs: '100%', sm: 120 },
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '10px',
              borderColor: '#e2e8f0',
              color: '#64748b',
            }}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={isSaving || isBootstrapping || isProductsLoading || isMappingLoading}
            sx={{
              minWidth: { xs: '100%', sm: 140 },
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '10px',
              bgcolor: '#2563eb',
              boxShadow: '0 1px 3px rgba(37,99,235,0.25)',
              '&:hover': { bgcolor: '#1d4ed8' },
            }}
          >
            {isSaving ? 'Saving...' : 'Save Mapping'}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
