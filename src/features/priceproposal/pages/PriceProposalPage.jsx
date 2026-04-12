import React, { useCallback, useMemo, useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';

import PriceProposalHeader from '../components/PriceProposalHeader';
import ProposalTable from '../components/ProposalTable';

const PROPOSAL_CLIENTS = [
  {
    id: 'arpon',
    label: 'Arpon Communication Limited',
    scope: 'active',
    products: [
      {
        id: 'support-maintenance',
        label: '1. Support & Maintenance',
        services: [
          { serviceId: 'GGC Note Sharing', currentPrice: 1800, currentVolume: 10 },
          { serviceId: 'Khulna_IX', currentPrice: 2450, currentVolume: 8 },
        ],
      },
      {
        id: 'internet-link',
        label: '2. Internet Link',
        services: [
          { serviceId: 'Primary Internet', currentPrice: 4200, currentVolume: 4 },
          { serviceId: 'Backup Link', currentPrice: 2600, currentVolume: 3 },
        ],
      },
    ],
  },
  {
    id: 'khulna',
    label: 'Khulna_IX',
    scope: 'active',
    products: [
      {
        id: 'mix-support',
        label: '1. Support & Maintenance',
        services: [
          { serviceId: 'GGC Note Sharing', currentPrice: 1500, currentVolume: 12 },
          { serviceId: 'Peering Support', currentPrice: 1900, currentVolume: 6 },
        ],
      },
    ],
  },
  {
    id: 'delta',
    label: 'Delta Network Solutions',
    scope: 'inactive',
    products: [
      {
        id: 'enterprise-connectivity',
        label: '1. Enterprise Connectivity',
        services: [
          { serviceId: 'Metro Fiber', currentPrice: 5000, currentVolume: 5 },
          { serviceId: 'Last Mile', currentPrice: 3200, currentVolume: 7 },
        ],
      },
    ],
  },
  {
    id: 'org-batch',
    label: 'Organization Wide',
    scope: 'organization',
    products: [
      {
        id: 'shared-support',
        label: '1. Shared Support Package',
        services: [
          { serviceId: 'Helpdesk Bundle', currentPrice: 2800, currentVolume: 15 },
          { serviceId: 'Monitoring Service', currentPrice: 2100, currentVolume: 9 },
        ],
      },
    ],
  },
];

const UNIT_OPTIONS = ['MB', 'Unit', 'GB', 'Month'];

function buildEmptyRows(client, productIds = []) {
  if (!client || !productIds.length) return [];

  return productIds.flatMap((productId) => {
    const product = client.products.find((item) => item.id === productId);
    if (!product) return [];

    return product.services.map((service) => ({
      id: `${client.id}-${product.id}-${service.serviceId}`,
      clientId: client.id,
      clientLabel: client.label,
      productId: product.id,
      productLabel: product.label,
      serviceId: service.serviceId,
      currentPrice: service.currentPrice,
      currentVolume: service.currentVolume,
      proposePrice: 0,
      priceUnit: UNIT_OPTIONS[0],
      proposeVolume: 0,
      effectiveDate: null,
    })).map(enrichRow);
  });
}

function enrichRow(row) {
  const proposePrice = Number(row.proposePrice || 0);
  const proposeVolume = Number(row.proposeVolume || 0);
  const currentPrice = Number(row.currentPrice || 0);
  const currentVolume = Number(row.currentVolume || 0);
  const proposedAmount = proposePrice * proposeVolume;
  const currentUnitInvoice = currentPrice;
  const unitBasedInvoiceDifference = proposePrice - currentPrice;
  const currentTotalInvoice = currentPrice * currentVolume;
  const newTotalInvoice = proposedAmount;
  const invoiceDifference = newTotalInvoice - currentTotalInvoice;

  return {
    ...row,
    currentUnitInvoice,
    proposedAmount,
    unitBasedInvoiceDifference,
    currentTotalInvoice,
    newTotalInvoice,
    invoiceDifference,
  };
}

export default function PriceProposalPage() {
  const [scope, setScope] = useState('active');
  const [clientId, setClientId] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [rows, setRows] = useState([]);

  const filteredClients = useMemo(
    () => PROPOSAL_CLIENTS.filter((client) => client.scope === scope),
    [scope]
  );

  const clientFetchOptions = useCallback(async () => (
    filteredClients.map((client) => ({ id: client.id, label: client.label }))
  ), [filteredClients]);

  const selectedClient = useMemo(
    () => filteredClients.find((client) => client.id === clientId) || null,
    [clientId, filteredClients]
  );

  const productOptions = useMemo(
    () => (selectedClient ? selectedClient.products.map((product) => ({ id: product.id, label: product.label })) : []),
    [selectedClient]
  );

  const handleClientChange = (nextClientId) => {
    setClientId(nextClientId);
    setSelectedProducts([]);
    setRows([]);
  };

  const handleScopeChange = (nextScope) => {
    setScope(nextScope);
    setClientId('');
    setSelectedProducts([]);
    setRows([]);
  };

  const handleProductsChange = (nextProductIds) => {
    setSelectedProducts(nextProductIds);
    setRows(buildEmptyRows(selectedClient, nextProductIds));
  };

  const handleRowChange = (rowId, key, value) => {
    setRows((prev) => prev.map((row) => (
      row.id === rowId
        ? enrichRow({ ...row, [key]: value })
        : row
    )));
  };

  const handleDeleteRow = (rowId) => {
    const nextRows = rows.filter((row) => row.id !== rowId);
    setRows(nextRows);

    const remainingProductIds = Array.from(new Set(nextRows.map((row) => row.productId)));
    setSelectedProducts(remainingProductIds);
  };

  const isSubmitDisabled = rows.length === 0 || rows.some((row) => {
    const proposePrice = Number(row.proposePrice);
    const proposeVolume = Number(row.proposeVolume);
    return !proposePrice || !proposeVolume;
  });

  const submitLabel = `Submit for Approval${rows.length ? ` (${rows.length})` : ''}`;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', px: { xs: 1.5, sm: 3 }, py: { xs: 2.5, sm: 3 } }}>
      <Box sx={{ width: '100%', mx: 'auto' }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
          mb={3}
          flexWrap="wrap"
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
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
              <AssignmentTurnedInOutlinedIcon sx={{ fontSize: 22, color: '#2563eb' }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h5" fontWeight={800} color="#0f172a" lineHeight={1.2}>
                Price Proposal
              </Typography>
              <Typography variant="body2" color="#64748b" sx={{ mt: 0.4 }}>
                Auto-build pricing rows from client and product selection.
              </Typography>
            </Box>
          </Stack>

        </Stack>

        <PriceProposalHeader
          scope={scope}
          onScopeChange={handleScopeChange}
          clientFetchOptions={clientFetchOptions}
          clientValue={clientId}
          onClientChange={handleClientChange}
          productOptions={productOptions}
          selectedProducts={selectedProducts}
          onProductsChange={handleProductsChange}
          clientLoading={false}
          productsLoading={false}
        />

        <ProposalTable
          rows={rows}
          onChangeRow={handleRowChange}
          onDeleteRow={handleDeleteRow}
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button
            variant="contained"
            disabled={isSubmitDisabled}
            sx={{
              minWidth: 220,
              height: 44,
              textTransform: 'none',
              fontWeight: 800,
              borderRadius: '10px',
              bgcolor: '#2563eb',
              boxShadow: '0 8px 18px rgba(37,99,235,0.18)',
              opacity: isSubmitDisabled ? 0.55 : 1,
              '&:hover': {
                bgcolor: '#1d4ed8',
                boxShadow: '0 10px 22px rgba(37,99,235,0.22)',
              },
              '&.Mui-disabled': {
                color: '#fff',
              },
            }}
          >
            {submitLabel}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
