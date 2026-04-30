import { useCallback, useEffect, useRef, useState } from 'react';
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
  const [draftValues, setDraftValues] = useState(null);
  const [loadedContextKey, setLoadedContextKey] = useState('');
  const draftRef = useRef(null);
  const contextKey = `${activeEntity || ''}::${activeMedium || ''}`;

  const handleDraftChange = useCallback((values) => {
    draftRef.current = values;
  }, []);

  const handleClose = useCallback(() => {
    if (draftRef.current) {
      setDraftValues(draftRef.current);
    }
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;
    if (draftInitialValues) {
      setDraftValues(draftInitialValues);
      draftRef.current = draftInitialValues;
      setLoadedContextKey(contextKey);
      return undefined;
    }
    if (loadedContextKey === contextKey && draftValues) return undefined;

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

        const nextDraftValues = {
          business_entity_id: matchedEntity?.id ? String(matchedEntity.id) : '',
          source_id: matchedSource?.id ? String(matchedSource.id) : '',
        };
        setDraftValues(nextDraftValues);
        draftRef.current = nextDraftValues;
        setLoadedContextKey(contextKey);
      } catch {
        if (active) {
          const fallbackDraftValues = {
            business_entity_id: '',
            source_id: '',
          };
          setDraftValues(fallbackDraftValues);
          draftRef.current = fallbackDraftValues;
          setLoadedContextKey(contextKey);
        }
      }
    };

    loadInitialValues();

    return () => {
      active = false;
    };
  }, [activeEntity, activeMedium, contextKey, draftInitialValues, draftValues, loadedContextKey, open]);

  return (
    <SocialFloatingPanel
      open={open}
      onClose={handleClose}
      title="Convert to Lead"
      width={780}
      height={620}
      contentSx={{ p: 0 }}
    >
      <Box sx={{ p: 2.5 }}>
        {open && draftValues ? (
          <LeadForm
            initialValues={draftValues}
            onCancel={handleClose}
            onAddClient={onAddClientRequested}
            onDraftChange={handleDraftChange}
            actionWidth="100%"
            actionMarginTop={3}
            lockedFields={{
              business_entity_id: true,
              source_id: true,
            }}
            onSubmit={() => {
              showToast?.('Lead created from chat.');
              onLeadSubmitted?.();
              draftRef.current = null;
              setDraftValues(null);
              setLoadedContextKey('');
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
