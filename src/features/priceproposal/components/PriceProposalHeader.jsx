import React from 'react';
import {
  Box,
  Stack,
  Button,
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
  productOptions,
  selectedProducts,
  onProductsChange,
  clientLoading = false,
  productsLoading = false,
}) {
  const scopeTabs = [
    {
      key: 'active',
      label: 'Active',
      color: '#16a34a',
      bg: '#dcfce7',
    },
    {
      key: 'inactive',
      label: 'Inactive',
      color: '#dc2626',
      bg: '#fee2e2',
    },
    {
      key: 'organization',
      label: 'Organization',
      color: '#7c3aed',
      bg: '#ede9fe',
    },
  ];

  return (
    <Box
      sx={{
        bgcolor: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        p: { xs: 2, sm: 2.5 },
      }}
    >
      <Stack spacing={2.25}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
            gap: 1,
            p: 0.5,
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            bgcolor: '#f8fafc',
          }}
        >
          {scopeTabs.map((tab) => {
            const selected = scope === tab.key;

            return (
              <Button
                key={tab.key}
                onClick={() => onScopeChange(tab.key)}
                variant="outlined"
                sx={{
                  minHeight: { xs: 44, sm: 38 },
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 800,
                  fontSize: 13,
                  color: selected ? '#fff' : tab.color,
                  bgcolor: selected ? tab.color : '#fff',
                  borderColor: selected ? tab.color : '#dbe4ef',
                  boxShadow: selected ? `0 8px 18px ${tab.color}2e` : 'none',
                  '&:hover': {
                    bgcolor: selected ? tab.color : tab.bg,
                    borderColor: tab.color,
                    boxShadow: selected ? `0 10px 22px ${tab.color}38` : 'none',
                  },
                }}
              >
                {tab.label}
              </Button>
            );
          })}
        </Box>

        <Stack
          direction={{ xs: 'column', md: 'row' }}
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

          <Box sx={{ flex: 1.2, minWidth: 0 }}>
            <SelectDropdownMultiple
              name="products"
              label="Select Products"
              placeholder="Search products"
              options={productOptions}
              value={selectedProducts}
              onChange={onProductsChange}
              searchable
              loading={productsLoading}
              fullWidth
              limitTags={3}
              sx={{
                '& .MuiAutocomplete-endAdornment': {
                  right: 8,
                },
              }}
            />
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
}
