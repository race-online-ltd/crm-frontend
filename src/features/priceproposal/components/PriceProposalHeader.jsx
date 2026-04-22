import React from 'react';
import {
  Box,
  Stack,
  Typography,
} from '@mui/material';

import SelectDropdownMultiple from '@/components/shared/SelectDropdownMultiple';
import SelectDropdownSingle from '@/components/shared/SelectDropdownSingle';

export default function PriceProposalHeader({
  scope,
  onScopeChange,
  clientFetchOptions,
  clientValue,
  onClientChange,
  productFetchOptions,
  productValue,
  onProductChange,
  serviceOptions,
  serviceValue = [],
  onServiceChange,
  clientLoading = false,
  productsLoading = false,
  serviceLoading = false,
}) {
  const scopeTabs = [
    {
      key: 'active',
      label: 'Active',
      color: '#16a34a',
    },
    {
      key: 'inactive',
      label: 'Inactive',
      color: '#dc2626',
    },
    {
      key: 'organization',
      label: 'Organization',
      color: '#7c3aed',
    },
  ];

  return (
    <Stack spacing={2.25}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            p: '2px',
            width: { xs: '100%', sm: 'auto' },
            overflowX: 'auto',
            borderRadius: '999px',
            bgcolor: '#ffffff',
            border: '1px solid #e2e8f0',
          }}
        >
          {scopeTabs.map((tab) => {
            const selected = scope === tab.key;

            return (
              <Box
                component="button"
                key={tab.key}
                type="button"
                onClick={() => onScopeChange(tab.key)}
                sx={{
                  minHeight: { xs: 38, sm: 34 },
                  px: { xs: 1.5, sm: 1.75 },
                  borderRadius: '999px',
                  border: 'none',
                  bgcolor: selected ? '#ffffff' : 'transparent',
                  color: selected ? tab.color : '#6b7280',
                  boxShadow: selected ? '0 1px 3px rgba(0, 0, 0, 0.1), 0 0 0 0.5px rgba(0,0,0,0.06)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  fontFamily: 'inherit',
                  whiteSpace: 'nowrap',
                  '&:hover': {
                    bgcolor: selected ? '#ffffff' : '#e5e7eb',
                    color: selected ? tab.color : '#374151',
                  },
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: tab.color,
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    component="span"
                    sx={{
                      fontSize: { xs: 14, sm: 15.5 },
                      fontWeight: 600,
                      lineHeight: 1,
                    }}
                  >
                    {tab.label}
                  </Typography>
                </Stack>
              </Box>
            );
          })}
        </Box>
      </Box>

      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', md: 'flex-start' }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <SelectDropdownSingle
            name="client"
            label="Select Client"
            placeholder="Search client"
            fetchOptions={clientFetchOptions}
            value={clientValue}
            onChange={onClientChange}
            searchable
            loading={clientLoading}
            fullWidth
          />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <SelectDropdownSingle
            name="product"
            label="Select Product"
            placeholder="Search product"
            fetchOptions={productFetchOptions}
            value={productValue}
            onChange={onProductChange}
            searchable
            loading={productsLoading}
            disabled={!clientValue}
            fullWidth
          />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <SelectDropdownMultiple
            name="serviceId"
            label="Service ID"
            placeholder="Search service"
            options={serviceOptions}
            value={serviceValue}
            onChange={onServiceChange}
            searchable
            loading={serviceLoading}
            disabled={!productValue}
            fullWidth
            limitTags={2}
            sx={{
              '& .MuiAutocomplete-endAdornment': { right: 8 },
            }}
          />
        </Box>
      </Stack>
    </Stack>
  );
}
