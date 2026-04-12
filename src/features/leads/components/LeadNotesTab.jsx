import React from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AttachmentField from '../../../components/shared/AttachmentField';

function SectionHeader({ action }) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-start', sm: 'center' }}
      spacing={1.25}
      sx={{ mb: 1.5 }}
    >
      <Box />
      {action}
    </Stack>
  );
}

export default function LeadNotesTab({
  notes,
  isAddingNote,
  noteText,
  attachments,
  onToggleAddNote,
  onChangeNoteText,
  onChangeAttachments,
  onCancelAddNote,
  onSubmitNote,
  formatDateTime,
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, height: '100%' }}>
      <SectionHeader
        action={
          <Button
            onClick={onToggleAddNote}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              backgroundColor: '#2563eb',
              color: '#fff',
              borderRadius: '10px',
            }}
          >
            + Add Note
          </Button>
        }
      />

      {isAddingNote ? (
        <Paper
          variant="outlined"
          sx={{
            p: 1.75,
            mb: 1.5,
            borderRadius: '16px',
            borderColor: '#bfdbfe',
            bgcolor: '#f8fbff',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}
        >
          <Stack spacing={1.5}>
            <TextField
              multiline
              minRows={3}
              maxRows={6}
              autoFocus
              value={noteText}
              onChange={(event) => onChangeNoteText(event.target.value)}
              placeholder="Add a note for follow-up, context, or next steps..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  bgcolor: '#fff',
                },
              }}
            />
            <AttachmentField
              label="Attachments"
              helperText="Optional. Attach documents, screenshots, or any supporting file for this note."
              value={attachments}
              onChange={onChangeAttachments}
            />
            <Stack direction="row" justifyContent="flex-end" spacing={1}>
              <Button
                onClick={onCancelAddNote}
                sx={{ textTransform: 'none', fontWeight: 700, color: '#64748b' }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={onSubmitNote}
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

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          p: 0,
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-thumb': { bgcolor: '#cbd5e1', borderRadius: 999 },
        }}
      >
        <Stack spacing={1.25} sx={{ pt: 0, pb: 0 }}>
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
                    {Array.isArray(note.attachments) && note.attachments.length > 0 ? (
                      <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
                        {note.attachments.map((file) => (
                          <Box
                            key={`${file.name}-${file.lastModified}`}
                            sx={{
                              px: 1,
                              py: 0.5,
                              borderRadius: '999px',
                              bgcolor: '#eff6ff',
                              border: '1px solid #dbeafe',
                              color: '#1d4ed8',
                              fontSize: 12,
                              fontWeight: 700,
                            }}
                          >
                            {file.name}
                          </Box>
                        ))}
                      </Stack>
                    ) : null}
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
    </Box>
  );
}
