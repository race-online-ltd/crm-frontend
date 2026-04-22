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
          {
            id: 'ggc-note-sharing',
            serviceId: 'GGC Note Sharing',
            existingInvoices: [
              { currentPrice: 1800, currentVolume: 10 },
            ],
          },
          {
            id: 'khulna-ix',
            serviceId: 'Khulna_IX',
            existingInvoices: [
              { currentPrice: 2450, currentVolume: 8 },
            ],
          },
        ],
      },
      {
        id: 'internet-link',
        label: '2. Internet Link',
        services: [
          {
            id: 'primary-internet',
            serviceId: 'Primary Internet',
            existingInvoices: [
              { currentPrice: 4200, currentVolume: 4 },
            ],
          },
          {
            id: 'backup-link',
            serviceId: 'Backup Link',
            existingInvoices: [],
          },
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
          {
            id: 'ggc-note-sharing',
            serviceId: 'GGC Note Sharing',
            existingInvoices: [
              { currentPrice: 1500, currentVolume: 12 },
            ],
          },
          {
            id: 'peering-support',
            serviceId: 'Peering Support',
            existingInvoices: [
              { currentPrice: 1900, currentVolume: 6 },
            ],
          },
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
          {
            id: 'metro-fiber',
            serviceId: 'Metro Fiber',
            existingInvoices: [
              { currentPrice: 5000, currentVolume: 5 },
            ],
          },
          {
            id: 'last-mile',
            serviceId: 'Last Mile',
            existingInvoices: [],
          },
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
          {
            id: 'helpdesk-bundle',
            serviceId: 'Helpdesk Bundle',
            existingInvoices: [
              { currentPrice: 2800, currentVolume: 15 },
            ],
          },
          {
            id: 'monitoring-service',
            serviceId: 'Monitoring Service',
            existingInvoices: [
              { currentPrice: 2100, currentVolume: 9 },
            ],
          },
        ],
      },
    ],
  },
];

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

function buildExistingRows(client, product, service) {
  if (!client || !product || !service) return [];

  return (service.existingInvoices || []).map((invoice, index) => enrichRow({
    id: `existing-${client.id}-${product.id}-${service.id}-${index}`,
    clientId: client.id,
    clientLabel: client.label,
    productId: product.id,
    productLabel: product.label,
    serviceKey: service.id,
    serviceId: service.serviceId,
    currentPrice: invoice.currentPrice,
    currentVolume: invoice.currentVolume,
    proposePrice: 0,
    proposeVolume: 0,
    effectiveDate: null,
  }));
}

function buildExistingRowsForServices(client, product, services = []) {
  return services.flatMap((service) => buildExistingRows(client, product, service));
}

function buildProposalRow(client, product, service, existingRows = [], suffix = Date.now()) {
  const baseRow = service
    ? existingRows.find((row) => row.serviceKey === service.id)
    : null;

  return enrichRow({
    id: `proposal-${client.id}-${product.id}-${service?.id || 'no-service'}-${suffix}`,
    clientId: client.id,
    clientLabel: client.label,
    productId: product.id,
    productLabel: product.label,
    serviceKey: service?.id || '',
    serviceId: service?.serviceId || '—',
    currentPrice: baseRow?.currentPrice || 0,
    currentVolume: baseRow?.currentVolume || 0,
    proposePrice: '',
    proposeVolume: '',
    effectiveDate: null,
  });
}

export default function PriceProposalPage() {
  const [scope, setScope] = useState('active');
  const [clientId, setClientId] = useState('');
  const [productId, setProductId] = useState('');
  const [serviceKeys, setServiceKeys] = useState([]);
  const [existingRows, setExistingRows] = useState([]);
  const [proposalRows, setProposalRows] = useState([]);

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

  const productFetchOptions = useCallback(async () => (
    (selectedClient?.products || []).map((product) => ({ id: product.id, label: product.label }))
  ), [selectedClient]);

  const selectedProduct = useMemo(
    () => selectedClient?.products.find((product) => product.id === productId) || null,
    [selectedClient, productId]
  );

  const serviceOptions = useMemo(
    () => (selectedProduct?.services || []).map((service) => ({ id: service.id, label: service.serviceId })),
    [selectedProduct]
  );

  const selectedServices = useMemo(
    () => (selectedProduct?.services || []).filter((service) => serviceKeys.includes(service.id)),
    [selectedProduct, serviceKeys]
  );

  const comparisonRows = useMemo(
    () => proposalRows.map((row) => enrichRow(row)),
    [proposalRows]
  );

  const handleScopeChange = (nextScope) => {
    setScope(nextScope);
    setClientId('');
    setProductId('');
    setServiceKeys([]);
    setExistingRows([]);
    setProposalRows([]);
  };

  const handleClientChange = (nextClientId) => {
    setClientId(nextClientId);
    setProductId('');
    setServiceKeys([]);
    setExistingRows([]);
    setProposalRows([]);
  };

  const handleProductChange = (nextProductId) => {
    setProductId(nextProductId);
    setServiceKeys([]);
    setExistingRows([]);
    setProposalRows([]);
  };

  const handleServiceChange = (nextServiceKeys) => {
    setServiceKeys(nextServiceKeys);

    const nextServices = (selectedProduct?.services || []).filter((service) => nextServiceKeys.includes(service.id));
    if (!selectedClient || !selectedProduct || !nextServices.length) {
      setExistingRows([]);
      setProposalRows([]);
      return;
    }

    const nextExistingRows = buildExistingRowsForServices(selectedClient, selectedProduct, nextServices);
    setExistingRows(nextExistingRows);

    const nextProposalRows = nextServices
      .filter((service) => nextExistingRows.some((row) => row.serviceKey === service.id))
      .map((service, index) => buildProposalRow(selectedClient, selectedProduct, service, nextExistingRows, `${Date.now()}-${index}`));

    setProposalRows(nextProposalRows);
  };

  const handleCreateNew = () => {
    if (!selectedClient || !selectedProduct) return;

    if (!selectedServices.length) {
      setProposalRows((prev) => [
        ...prev,
        buildProposalRow(selectedClient, selectedProduct, null, existingRows, `${Date.now()}-${prev.length}`),
      ]);
      return;
    }

    const selectedServiceIds = new Set(selectedServices.map((service) => service.id));
    const pendingService = selectedServices.find((service) => (
      !proposalRows.some((row) => row.serviceKey === service.id)
    ));
    const targetService = pendingService || selectedServices.find((service) => selectedServiceIds.has(service.id)) || null;
    if (!targetService) return;

    setProposalRows((prev) => [
      ...prev,
      buildProposalRow(selectedClient, selectedProduct, targetService, existingRows, `${Date.now()}-${prev.length}`),
    ]);
  };

  const handleRowChange = (rowId, key, value) => {
    setProposalRows((prev) => prev.map((row) => (
      row.id === rowId
        ? enrichRow({ ...row, [key]: value })
        : row
    )));
  };

  const handleDeleteRow = (rowId) => {
    setProposalRows((prev) => prev.filter((row) => row.id !== rowId));
  };

  const isSubmitDisabled = proposalRows.length === 0 || proposalRows.some((row) => {
    const proposePrice = Number(row.proposePrice);
    const proposeVolume = Number(row.proposeVolume);
    return !proposePrice || !proposeVolume || !row.effectiveDate;
  });

  const submitLabel = `Submit for Approval${proposalRows.length ? ` (${proposalRows.length})` : ''}`;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff', px: { xs: 1.5, sm: 3 }, py: { xs: 2.5, sm: 3 } }}>
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
                Build proposals from client, product, and service selections with side-by-side invoice comparison.
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
          productFetchOptions={productFetchOptions}
          productValue={productId}
          onProductChange={handleProductChange}
          serviceOptions={serviceOptions}
          serviceValue={serviceKeys}
          onServiceChange={handleServiceChange}
          clientLoading={false}
          productsLoading={false}
          serviceLoading={false}
        />

        <ProposalTable
          existingRows={existingRows}
          proposalRows={proposalRows}
          comparisonRows={comparisonRows}
          canCreateNew={Boolean(selectedClient && selectedProduct)}
          onCreateNew={handleCreateNew}
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
