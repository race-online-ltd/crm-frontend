import React, { useMemo } from 'react';
import {
  Box,
  Button,
  Stack,
  Typography,
} from '@mui/material';
import AppDrawer from '../../../components/shared/AppDrawer';
import PeriodPickerField from '../../../components/shared/date-picker/PeriodPickerField';
import SelectDropdownSingle from '../../../components/shared/SelectDropdownSingle';
import SelectDropdownMultiple from '../../../components/shared/SelectDropdownMultiple';

const VIEW_MODES = [
  { id: 'monthly', label: 'Monthly' },
  { id: 'quarterly', label: 'Quarterly' },
];

export default function KAMTargetFilterDrawer({
  open,
  onClose,
  filters,
  onChange,
  onApply,
  onReset,
  kamOptions = [],
  productOptions = [],
}) {
  const values = useMemo(() => ({
    viewMode: 'monthly',
    fromMonth: null,
    toMonth: null,
    kam: '',
    products: [],
    ...(filters || {}),
  }), [filters]);

  return (
    <AppDrawer
      open={open}
      onClose={onClose}
      title="Filters"
      width={420}
      contentSx={{
        overflowY: values.viewMode === 'monthly' ? 'hidden' : 'auto',
      }}
      footerActions={(
        <Button
          variant="contained"
          onClick={() => onApply?.()}
          fullWidth
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: '10px',
            px: 2.5,
            py: 1.2,
            bgcolor: '#2563eb',
            '&:hover': { bgcolor: '#1d4ed8' },
          }}
        >
          Apply Filters
        </Button>
      )}
      paperProps={{ role: 'dialog', 'aria-label': 'KAM target filters' }}
    >
      <Stack spacing={2.5}>
        <Box>
          <Typography variant="body2" fontWeight={800} color="#94a3b8" sx={{ mb: 1 }}>
            VIEW MODE
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 1,
              p: 0.5,
              bgcolor: '#f8fafc',
              border: '1px solid #e5e7eb',
              borderRadius: '10px',
            }}
          >
            {VIEW_MODES.map((mode) => {
              const selected = values.viewMode === mode.id;
              return (
                <Button
                  key={mode.id}
                  type="button"
                  onClick={() => onChange?.('viewMode', mode.id)}
                  sx={{
                    minHeight: 38,
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 700,
                    bgcolor: selected ? '#fff' : 'transparent',
                    color: selected ? '#0f172a' : '#94a3b8',
                    boxShadow: 'none',
                    border: selected ? '1px solid #e5e7eb' : '1px solid transparent',
                    '&:hover': {
                      bgcolor: selected ? '#fff' : 'rgba(37,99,235,0.05)',
                      boxShadow: 'none',
                    },
                  }}
                >
                  {mode.label}
                </Button>
              );
            })}
          </Box>
        </Box>

        {values.viewMode === 'monthly' ? (
          <Box sx={{ pb: 0.5 }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 1.5,
              }}
            >
              <PeriodPickerField
                mode="monthly"
                label="From Month"
                placeholder="Select month"
                value={values.fromMonth}
                onChange={(value) => onChange?.('fromMonth', value)}
              />
              <PeriodPickerField
                mode="monthly"
                label="To Month"
                placeholder="Select month"
                value={values.toMonth}
                onChange={(value) => onChange?.('toMonth', value)}
              />
            </Box>
          </Box>
        ) : (
          <Stack spacing={1.75}>
            <Typography variant="body2" fontWeight={700} color="#94a3b8">
              Quarterly mode is selected in view mode.
            </Typography>
          </Stack>
        )}

        <Box>
          <SelectDropdownSingle
            name="kam"
            label="Select KAM"
            options={kamOptions}
            value={values.kam || ''}
            onChange={(value) => onChange?.('kam', value)}
            placeholder="Select KAM"
          />
        </Box>

        <Box>
          <SelectDropdownMultiple
            name="products"
            label="Select Product"
            options={productOptions}
            value={values.products || []}
            onChange={(value) => onChange?.('products', value)}
            placeholder="Select Product"
            limitTags={2}
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 0.5 }}>
          <Button
            variant="text"
            onClick={onReset}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              color: '#ef4444',
              '&:hover': { bgcolor: 'rgba(239,68,68,0.06)' },
            }}
          >
            Clear All Filters
          </Button>
        </Box>
      </Stack>
    </AppDrawer>
  );
}
