import React, { useMemo, useState } from 'react';
import { Alert, Box, Button, Stack } from '@mui/material';
import AppDrawer from '../../../components/shared/AppDrawer';
import LeadDetailsTab from './LeadDetailsTab';
import LeadNotesTab from './LeadNotesTab';
import LeadTasksTab from './LeadTasksTab';

const STATUS_COLORS = {
  'In Progress': { bg: '#eff6ff', color: '#2563eb' },
  Won: { bg: '#f0fdf4', color: '#16a34a' },
  Lost: { bg: '#fef2f2', color: '#ef4444' },
};

const SOURCE_COLORS = {
  Self: { bg: '#dcfce7', color: '#16a34a' },
  Website: { bg: '#dbeafe', color: '#2563eb' },
  LinkedIn: { bg: '#e0e7ff', color: '#4f46e5' },
  WhatsApp: { bg: '#dcfce7', color: '#16a34a' },
  Direct: { bg: '#fef3c7', color: '#d97706' },
};

const STAGE_LABELS = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  closed: 'Closed',
  closed_won: 'Closed Won',
  closed_lost: 'Closed Lost',
};

function formatDateTime(value) {
  if (!value) return 'Not available';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function formatAmount(amount) {
  if (typeof amount === 'number') return `৳${amount.toLocaleString()}`;
  return amount || '৳0';
}

function formatTaskType(taskType) {
  if (!taskType) return 'General';

  return taskType
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default function ViewDetailsDrawer({
  open,
  onClose,
  lead,
  notes = [],
  tasks = [],
  onAddNote,
}) {
  const [activeTab, setActiveTab] = useState('details');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [noteAttachments, setNoteAttachments] = useState([]);

  const taskHistory = useMemo(() => {
    return [...tasks]
      .filter(Boolean)
      .sort((a, b) => new Date(b.createdAt || b.scheduledAt || 0).getTime() - new Date(a.createdAt || a.scheduledAt || 0).getTime());
  }, [tasks]);

  const handleSubmitNote = () => {
    const value = noteText.trim();
    if (!value || !lead?.id) return;

    onAddNote?.(lead.id, {
      content: value,
      attachments: noteAttachments,
    });
    setNoteText('');
    setNoteAttachments([]);
    setIsAddingNote(false);
  };

  const handleToggleAddNote = () => {
    setIsAddingNote((prev) => !prev);
  };

  const handleCancelAddNote = () => {
    setIsAddingNote(false);
    setNoteText('');
    setNoteAttachments([]);
  };

  const leadOverview = [
    // { label: 'Lead Name', value: lead?.name || 'Not available' },
    // { label: 'Client', value: lead?.client || lead?.subtitle || 'Not available' },
    { label: 'Products', value: lead?.products || 'Not available' },
  ];

  const commercialInfo = [
    { label: 'Business Entity', value: lead?.businessEntity || 'Not available' },
    { label: 'Source', value: lead?.source || 'Not available' },
    { label: 'Current Stage', value: STAGE_LABELS[lead?.stageId || lead?.stage] || 'Not available' },
    { label: 'Expected Revenue', value: formatAmount(lead?.amount) },
  ];

  const ownershipInfo = [
    { label: 'Assigned KAM', value: lead?.user || 'Not assigned' },
    { label: 'Assigned Date', value: formatDateTime(lead?.assignedDate) },
    { label: 'Deadline', value: formatDateTime(lead?.deadline) },
  ];

  const detailItems = [...leadOverview, ...commercialInfo, ...ownershipInfo];

  return (
    <AppDrawer open={open} onClose={onClose} title="View Details" width={560}>
      {!lead ? (
        <Alert severity="info" sx={{ borderRadius: '12px' }}>
          Select a lead to see the details.
        </Alert>
      ) : (
        <Stack spacing={3} sx={{ flex: 1, minHeight: 0 }}>
          <Stack direction="row" spacing={1} sx={{ p: 0.5, bgcolor: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
            {[
              { key: 'details', label: 'Details' },
              { key: 'notes', label: `Notes${notes.length ? ` (${notes.length})` : ''}` },
              { key: 'tasks', label: `Task${taskHistory.length ? ` (${taskHistory.length})` : ''}` },
            ].map((item) => (
              <Button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                variant={activeTab === item.key ? 'contained' : 'text'}
                sx={{
                  flex: 1,
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: '10px',
                  boxShadow: 'none',
                  bgcolor: activeTab === item.key ? '#0f172a' : 'transparent',
                  color: activeTab === item.key ? '#fff' : '#475569',
                  '&:hover': {
                    bgcolor: activeTab === item.key ? '#0f172a' : '#edf2f7',
                    boxShadow: 'none',
                  },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Stack>

          <Box sx={{ flex: 1, minHeight: 0 }}>
            {activeTab === 'details' ? (
              <LeadDetailsTab
                lead={lead}
                detailItems={detailItems}
                statusColors={STATUS_COLORS}
                sourceColors={SOURCE_COLORS}
              />
            ) : activeTab === 'notes' ? (
              <LeadNotesTab
                notes={notes}
                isAddingNote={isAddingNote}
                noteText={noteText}
                attachments={noteAttachments}
                onToggleAddNote={handleToggleAddNote}
                onChangeNoteText={setNoteText}
                onChangeAttachments={setNoteAttachments}
                onCancelAddNote={handleCancelAddNote}
                onSubmitNote={handleSubmitNote}
                formatDateTime={formatDateTime}
              />
            ) : (
              <LeadTasksTab
                taskHistory={taskHistory}
                formatDateTime={formatDateTime}
                formatTaskType={formatTaskType}
              />
            )}
          </Box>
        </Stack>
      )}
    </AppDrawer>
  );
}
