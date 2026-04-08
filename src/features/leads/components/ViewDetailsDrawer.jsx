import React, { useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import NoteAddOutlinedIcon from '@mui/icons-material/NoteAddOutlined';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import AppDrawer from '../../../components/shared/AppDrawer';

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

function buildFallbackActivities(lead) {
  if (!lead) return [];

  const createdAt = lead.assignedDate || lead.deadline || new Date().toISOString();

  return [
    {
      id: `${lead.id}-created`,
      title: 'Lead added to pipeline',
      description: `${lead.name} was added to the ${STAGE_LABELS[lead.stageId || lead.stage] || 'pipeline'} stage.`,
      timestamp: createdAt,
    },
    {
      id: `${lead.id}-assignment`,
      title: 'Lead assigned',
      description: `Assigned to ${lead.user || 'Unassigned'}${lead.source ? ` from ${lead.source}` : ''}.`,
      timestamp: lead.assignedDate || createdAt,
    },
    {
      id: `${lead.id}-revenue`,
      title: 'Expected value captured',
      description: `Estimated value recorded as ${formatAmount(lead.amount)}.`,
      timestamp: lead.assignedDate || createdAt,
    },
  ];
}

function SectionHeader({ title, description, action }) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-start', sm: 'center' }}
      spacing={1.25}
      sx={{ mb: 1.5 }}
    >
      <Box>
        <Typography variant="subtitle1" fontWeight={800} color="#0f172a">
          {title}
        </Typography>
        {description ? (
          <Typography variant="body2" color="#64748b">
            {description}
          </Typography>
        ) : null}
      </Box>
      {action}
    </Stack>
  );
}

function DetailLine({ label, value }) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-start', sm: 'center' }}
      spacing={0.5}
      sx={{ py: 1.25 }}
    >
      <Typography variant="body2" color="#64748b">
        {label}
      </Typography>
      <Typography
        variant="body2"
        fontWeight={700}
        color="#0f172a"
        sx={{ textAlign: { xs: 'left', sm: 'right' } }}
      >
        {value}
      </Typography>
    </Stack>
  );
}

export default function ViewDetailsDrawer({
  open,
  onClose,
  lead,
  notes = [],
  activities = [],
  onAddNote,
}) {
  const [activeTab, setActiveTab] = useState('details');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteText, setNoteText] = useState('');

  const mergedActivities = useMemo(() => {
    const seeded = buildFallbackActivities(lead);
    const all = [...activities, ...seeded];

    return all
      .filter(Boolean)
      .sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
  }, [activities, lead]);

  const handleSubmitNote = () => {
    const value = noteText.trim();
    if (!value || !lead?.id) return;

    onAddNote?.(lead.id, value);
    setNoteText('');
    setIsAddingNote(false);
  };

  const leadOverview = [
    { label: 'Lead Name', value: lead?.name || 'Not available' },
    { label: 'Client', value: lead?.client || lead?.subtitle || 'Not available' },
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

  return (
    <AppDrawer open={open} onClose={onClose} title="View Details" width={560}>
      {!lead ? (
        <Alert severity="info" sx={{ borderRadius: '12px' }}>
          Select a lead to see the details.
        </Alert>
      ) : (
        <Stack spacing={3}>

          <Stack direction="row" spacing={1} sx={{ p: 0.5, bgcolor: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
            {[
              { key: 'details', label: 'Details' },
              { key: 'activities', label: `Activities${mergedActivities.length ? ` (${mergedActivities.length})` : ''}` },
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

          {activeTab === 'details' ? (
            <Box>
              <SectionHeader
                title="Lead Details"
                description="A single selected lead profile with the most relevant business and assignment information."
              />
              <Stack spacing={1.5}>
                <Paper
                  variant="outlined"
                  sx={{ p: 2, borderRadius: '16px', borderColor: '#e2e8f0', bgcolor: '#fff' }}
                >
                  <Typography variant="subtitle2" fontWeight={800} color="#0f172a" sx={{ mb: 0.5 }}>
                    Lead Overview
                  </Typography>
                  <Typography variant="body2" color="#64748b" sx={{ mb: 0.5 }}>
                    Core identity and opportunity summary for this selected lead.
                  </Typography>
                  {leadOverview.map((item, index) => (
                    <Box
                      key={item.label}
                      sx={{
                        borderTop: index === 0 ? 'none' : '1px solid #eef2f7',
                      }}
                    >
                      <DetailLine label={item.label} value={item.value} />
                    </Box>
                  ))}
                </Paper>

                <Paper
                  variant="outlined"
                  sx={{ p: 2, borderRadius: '16px', borderColor: '#e2e8f0', bgcolor: '#fff' }}
                >
                  <Typography variant="subtitle2" fontWeight={800} color="#0f172a" sx={{ mb: 0.5 }}>
                    Commercial Info
                  </Typography>
                  <Typography variant="body2" color="#64748b" sx={{ mb: 0.5 }}>
                    Stage, source, revenue, and business information tied to this lead.
                  </Typography>
                  {commercialInfo.map((item, index) => (
                    <Box
                      key={item.label}
                      sx={{
                        borderTop: index === 0 ? 'none' : '1px solid #eef2f7',
                      }}
                    >
                      <DetailLine label={item.label} value={item.value} />
                    </Box>
                  ))}
                </Paper>

                <Paper
                  variant="outlined"
                  sx={{ p: 2, borderRadius: '16px', borderColor: '#e2e8f0', bgcolor: '#fff' }}
                >
                  <Typography variant="subtitle2" fontWeight={800} color="#0f172a" sx={{ mb: 0.5 }}>
                    Ownership & Timeline
                  </Typography>
                  <Typography variant="body2" color="#64748b" sx={{ mb: 0.5 }}>
                    Team ownership and important dates for follow-up and delivery.
                  </Typography>
                  {ownershipInfo.map((item, index) => (
                    <Box
                      key={item.label}
                      sx={{
                        borderTop: index === 0 ? 'none' : '1px solid #eef2f7',
                      }}
                    >
                      <DetailLine label={item.label} value={item.value} />
                    </Box>
                  ))}
                </Paper>
              </Stack>

              <SectionHeader
                title="Notes"
                description="Keep contextual updates, reminders, and handoff comments on this lead."
                action={
                  <Button
                    startIcon={<NoteAddOutlinedIcon />}
                    onClick={() => setIsAddingNote((prev) => !prev)}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 700,
                      color: '#2563eb',
                      borderRadius: '10px',
                    }}
                  >
                    Add Note +
                  </Button>
                }
              />

              {isAddingNote ? (
                <Paper
                  variant="outlined"
                  sx={{ p: 1.5, mb: 1.5, borderRadius: '14px', borderColor: '#bfdbfe', bgcolor: '#f8fbff' }}
                >
                  <Stack spacing={1.5}>
                    <TextField
                      multiline
                      minRows={3}
                      maxRows={6}
                      autoFocus
                      value={noteText}
                      onChange={(event) => setNoteText(event.target.value)}
                      placeholder="Add a note for follow-up, context, or next steps..."
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#fff' } }}
                    />
                    <Stack direction="row" justifyContent="flex-end" spacing={1}>
                      <Button
                        onClick={() => {
                          setIsAddingNote(false);
                          setNoteText('');
                        }}
                        sx={{ textTransform: 'none', fontWeight: 700, color: '#64748b' }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleSubmitNote}
                        disabled={!noteText.trim()}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 700,
                          borderRadius: '10px',
                          boxShadow: 'none',
                        }}
                      >
                        Save Note
                      </Button>
                    </Stack>
                  </Stack>
                </Paper>
              ) : null}

              <Stack
                spacing={1.25}
                sx={{
                  maxHeight: 280,
                  overflowY: 'auto',
                  pr: 0.5,
                  '&::-webkit-scrollbar': { width: 6 },
                  '&::-webkit-scrollbar-thumb': { bgcolor: '#cbd5e1', borderRadius: 999 },
                }}
              >
                {notes.length ? (
                  notes.map((note) => (
                    <Paper
                      key={note.id}
                      variant="outlined"
                      sx={{ p: 1.5, borderRadius: '14px', borderColor: '#e2e8f0', bgcolor: '#fff' }}
                    >
                      <Stack direction="row" spacing={1.25} alignItems="flex-start">
                        <Avatar sx={{ width: 34, height: 34, bgcolor: '#dbeafe', color: '#1d4ed8', fontWeight: 700 }}>
                          {(note.author || 'U').slice(0, 1)}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                            <Typography variant="body2" fontWeight={700} color="#0f172a">
                              {note.author || 'System User'}
                            </Typography>
                            <Typography variant="caption" color="#94a3b8">
                              {formatDateTime(note.createdAt)}
                            </Typography>
                          </Stack>
                          <Typography variant="body2" color="#334155" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>
                            {note.content}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  ))
                ) : (
                  <Alert severity="info" sx={{ borderRadius: '12px' }}>
                    No notes added yet. Use Add Note + to capture context for this lead.
                  </Alert>
                )}
              </Stack>
            </Box>
          ) : (
            <Box>
              <SectionHeader
                title="Activities"
                description="A running timeline of important lead journey updates and operational actions."
              />

              <Stack spacing={1.5}>
                {mergedActivities.length ? (
                  mergedActivities.map((activity) => (
                    <Stack key={activity.id} direction="row" spacing={1.5} alignItems="flex-start">
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: '#eff6ff',
                          color: '#2563eb',
                        }}
                      >
                        <AccessTimeRoundedIcon sx={{ fontSize: 18 }} />
                      </Avatar>
                      <Paper
                        variant="outlined"
                        sx={{
                          flex: 1,
                          p: 1.5,
                          borderRadius: '14px',
                          borderColor: '#e2e8f0',
                          bgcolor: '#fff',
                        }}
                      >
                        <Stack
                          direction={{ xs: 'column', sm: 'row' }}
                          justifyContent="space-between"
                          alignItems={{ xs: 'flex-start', sm: 'center' }}
                          spacing={0.75}
                        >
                          <Typography variant="body2" fontWeight={700} color="#0f172a">
                            {activity.title}
                          </Typography>
                          <Typography variant="caption" color="#94a3b8">
                            {formatDateTime(activity.timestamp)}
                          </Typography>
                        </Stack>
                        <Typography variant="body2" color="#475569" sx={{ mt: 0.5 }}>
                          {activity.description}
                        </Typography>
                      </Paper>
                    </Stack>
                  ))
                ) : (
                  <Alert severity="info" sx={{ borderRadius: '12px' }}>
                    No activity history is available for this lead yet.
                  </Alert>
                )}
              </Stack>
            </Box>
          )}
        </Stack>
      )}
    </AppDrawer>
  );
}
