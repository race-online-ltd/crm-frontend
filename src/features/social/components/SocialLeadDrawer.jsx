import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LeadForm from '../../leads/components/LeadForm';
import { fetchLeadFormOptions } from '../../leads/api/leadApi';
import SocialFloatingPanel from './SocialFloatingPanel';
import { useSocial } from '../context/SocialContext';

function normalizeText(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ');
}

function findMatchingOption(options, candidates) {
  const normalizedCandidates = candidates
    .map(normalizeText)
    .filter(Boolean);

  return options.find((option) => {
    const optionLabel = normalizeText(option.label);
    return normalizedCandidates.some((candidate) => (
      optionLabel === candidate
      || optionLabel.includes(candidate)
      || candidate.includes(optionLabel)
    ));
  }) || null;
}

const SOURCE_CANDIDATES_BY_MEDIUM = {
  messenger: ['facebook', 'messenger', 'fb', 'facebook messenger'],
  whatsapp: ['whatsapp', 'wa', 'whats app'],
  email: ['email', 'mail', 'e-mail'],
};

export default function SocialLeadDrawer({
  open,
  onClose,
  draftInitialValues = null,
  onAddClientRequested,
  onLeadSubmitted,
}) {
  const { activeEntity, activeMedium, showToast } = useSocial();
  const [initialValues, setInitialValues] = useState(null);

  useEffect(() => {
    if (!open) return undefined;
    if (draftInitialValues) {
      setInitialValues(draftInitialValues);
      return undefined;
    }

    let active = true;

    const loadInitialValues = async () => {
      try {
        const options = await fetchLeadFormOptions();
        if (!active) return;

        const matchedEntity = findMatchingOption(
          options.business_entities || [],
          [
            activeEntity,
            String(activeEntity || '').replace(/\bLtd\.?\b/i, 'Limited'),
            String(activeEntity || '').replace(/\bLimited\b/i, 'Ltd'),
          ],
        );
        const matchedSource = findMatchingOption(
          options.sources || [],
          SOURCE_CANDIDATES_BY_MEDIUM[activeMedium] || [],
        );

        setInitialValues({
          business_entity_id: matchedEntity?.id ? String(matchedEntity.id) : '',
          source_id: matchedSource?.id ? String(matchedSource.id) : '',
        });
      } catch {
        if (active) {
          setInitialValues({
            business_entity_id: '',
            source_id: '',
          });
        }
      }
    };

    loadInitialValues();

    return () => {
      active = false;
    };
  }, [activeEntity, activeMedium, draftInitialValues, open]);

  return (
    <SocialFloatingPanel
      open={open}
      onClose={onClose}
      title="Convert to Lead"
      width={780}
      height={620}
      contentSx={{ p: 0 }}
    >
      <Box sx={{ p: 2.5 }}>
        {open && initialValues ? (
          <LeadForm
            initialValues={initialValues}
            onCancel={onClose}
            onAddClient={onAddClientRequested}
            actionWidth="100%"
            actionMarginTop={3}
            lockedFields={{
              business_entity_id: true,
              source_id: true,
            }}
            onSubmit={() => {
              showToast?.('Lead created from chat.');
              onLeadSubmitted?.();
              onClose();
            }}
          />
        ) : (
          <Typography sx={{ fontSize: '0.9rem', color: '#64748b' }}>
            Loading form...
          </Typography>
        )}
      </Box>
    </SocialFloatingPanel>
  );
}
