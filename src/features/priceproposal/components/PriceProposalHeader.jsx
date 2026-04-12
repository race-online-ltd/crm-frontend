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
    },
    {
      key: 'inactive',
      label: 'Inactive',
    },
    {
      key: 'organization',
      label: 'Organization',
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
                  color: selected ? '#fff' : '#2563eb',
                  bgcolor: selected ? '#2563eb' : '#fff',
                  borderColor: selected ? '#2563eb' : '#dbe4ef',
                  boxShadow: selected ? '0 8px 18px rgba(37,99,235,0.18)' : 'none',
                  '&:hover': {
                    bgcolor: selected ? '#1d4ed8' : '#edf2f7',
                    borderColor: '#2563eb',
                    boxShadow: selected ? '0 10px 22px rgba(37,99,235,0.22)' : 'none',
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
