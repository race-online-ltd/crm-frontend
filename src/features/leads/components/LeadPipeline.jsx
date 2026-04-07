// src/features/leads/components/LeadPipeline.jsx
import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  Box, Typography, Card, CardContent, Chip, Stack, IconButton,
  Menu, MenuItem, ListItemIcon, ListItemText,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Select, Dialog, DialogTitle, DialogContent,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CloseIcon from '@mui/icons-material/Close';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LanguageIcon from '@mui/icons-material/Language';
import FilterListIcon from '@mui/icons-material/FilterList';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import ViewListIcon from '@mui/icons-material/ViewList';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import ForwardIcon from '@mui/icons-material/Forward';
import AddTaskIcon from '@mui/icons-material/AddTask';
import StageChangeDialog from './StageChangeDialog';
import LeadForwardDialog from './LeadForwardDialog';
import TaskForm from '../../task/components/TaskForm';

// ── Stage config ──
const STAGES = [
  { id: 'new',         title: 'New',         color: '#4786EE' },
  { id: 'contacted',   title: 'Contacted',   color: '#8ad0b2' },
  { id: 'qualified',   title: 'Qualified',   color: '#40be6e' },
  { id: 'proposal',    title: 'Proposal',    color: '#96ced8' },
  { id: 'negotiation', title: 'Negotiation', color: '#5b90ab' },
  { id: 'closed',      title: 'Closed',      color: '#66955d' },
];

const STATUS_COLORS = {
  'In Progress': { bg: '#eff6ff', color: '#2563eb' },
  'Won':         { bg: '#f0fdf4', color: '#16a34a' },
  'Lost':        { bg: '#fef2f2', color: '#ef4444' },
};

const SOURCE_COLORS = {
  'Self':      { bg: '#dcfce7', color: '#16a34a' },
  'Website':   { bg: '#dbeafe', color: '#2563eb' },
  'LinkedIn':  { bg: '#e0e7ff', color: '#4f46e5' },
  'WhatsApp':  { bg: '#dcfce7', color: '#16a34a' },
  'Direct':    { bg: '#fef3c7', color: '#d97706' },
};

function formatAmount(amount) {
  if (typeof amount === 'number') return `৳${amount.toLocaleString()}`;
  return amount || '৳0';
}

function calculateColumnTotal(items) {
  const total = items.reduce((acc, item) => {
    const num = typeof item.amount === 'string'
      ? parseInt(item.amount.replace(/[^0-9]/g, ''), 10) || 0
      : item.amount || 0;
    return acc + num;
  }, 0);
  return `৳${total.toLocaleString()}`;
}

// ── Action Menu for List view ──
function LeadActionMenu({ anchorEl, open, onClose, onAction }) {
  return (
    <Menu anchorEl={anchorEl} open={open} onClose={onClose}
      PaperProps={{ sx: { borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', minWidth: 180 } }}
    >
      {[
        { key: 'view', icon: <VisibilityIcon fontSize="small" />, label: 'View Details' },
        { key: 'edit', icon: <EditIcon fontSize="small" />, label: 'Edit' },
        { key: 'addTask', icon: <AddTaskIcon fontSize="small" />, label: 'Add Task' },
        { key: 'forward', icon: <ForwardIcon fontSize="small" />, label: 'Forward Lead' },
      ].map((item) => (
        <MenuItem key={item.key} onClick={() => { onAction(item.key); onClose(); }}
          sx={{ fontSize: '0.85rem', py: 1 }}>
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText>{item.label}</ListItemText>
        </MenuItem>
      ))}
    </Menu>
  );
}

// ── List View ──
function LeadListView({ leads, onStageChange, onAction }) {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuLead, setMenuLead] = useState(null);

  const allLeads = Object.entries(leads).flatMap(([stageId, stage]) =>
    stage.items.map((item) => ({ ...item, stageId, stageTitle: stage.title }))
  );

  const handleStageSelect = (lead, newStageId) => {
    if (newStageId !== lead.stageId) {
      onStageChange(lead, lead.stageId, newStageId);
    }
  };

  return (
    <Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#f8fafc' }}>
              {['Client', 'Products', 'Source', 'Assigned KAM', 'Stage', 'Status', 'Value', 'Assigned Date', 'Duration', ''].map((h) => (
                <TableCell key={h} sx={{ fontWeight: 700, color: '#475569', fontSize: '0.82rem', borderBottom: '1px solid #e2e8f0' }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {allLeads.map((lead) => {
              const stageCfg = STAGES.find((s) => s.id === lead.stageId);
              const statusCfg = STATUS_COLORS[lead.status] || { bg: '#f1f5f9', color: '#64748b' };
              const sourceCfg = SOURCE_COLORS[lead.source] || { bg: '#f1f5f9', color: '#64748b' };

              return (
                <TableRow key={lead.id} hover sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600} color="#1e293b">{lead.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{lead.subtitle || '-'}</Typography>
                  </TableCell>
                  <TableCell sx={{ color: '#64748b', fontSize: '0.82rem' }}>{lead.products || '-'}</TableCell>
                  <TableCell>
                    <Chip label={lead.source} size="small"
                      sx={{ fontWeight: 600, fontSize: '0.72rem', bgcolor: sourceCfg.bg, color: sourceCfg.color, height: 22 }} />
                  </TableCell>
                  <TableCell sx={{ color: '#475569', fontSize: '0.82rem' }}>{lead.user}</TableCell>
                  <TableCell>
                    <Select
                      size="small"
                      value={lead.stageId}
                      onChange={(e) => handleStageSelect(lead, e.target.value)}
                      sx={{
                        fontSize: '0.75rem', fontWeight: 600, height: 28, borderRadius: '8px',
                        bgcolor: stageCfg?.color + '18', color: stageCfg?.color,
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: stageCfg?.color + '40' },
                        '& .MuiSelect-icon': { color: stageCfg?.color },
                      }}
                    >
                      {STAGES.map((s) => (
                        <MenuItem key={s.id} value={s.id} sx={{ fontSize: '0.8rem' }}>{s.title}</MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Chip label={lead.status} size="small"
                      sx={{ fontWeight: 600, fontSize: '0.72rem', bgcolor: statusCfg.bg, color: statusCfg.color, height: 22 }} />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.82rem' }}>
                    {formatAmount(lead.amount)}
                  </TableCell>
                  <TableCell sx={{ color: '#64748b', fontSize: '0.82rem' }}>{lead.assignedDate || '-'}</TableCell>
                  <TableCell sx={{ color: '#64748b', fontSize: '0.82rem' }}>{lead.duration || '-'}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={(e) => { setMenuAnchor(e.currentTarget); setMenuLead(lead); }}>
                      <MoreHorizIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Footer count */}
      <Box sx={{ p: 1.5, borderTop: '1px solid #e2e8f0' }}>
        <Typography variant="caption" color="text.secondary">
          Showing 1 - {allLeads.length} of {allLeads.length} leads
        </Typography>
      </Box>

      <LeadActionMenu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        onAction={(action) => { onAction(action, menuLead); setMenuAnchor(null); }}
      />
    </Box>
  );
}

// ── Kanban Card with action menu ──
function KanbanLeadCard({ item, index, onAction }) {
  const [anchorEl, setAnchorEl] = useState(null);

  return (
    <Draggable key={item.id} draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          variant="outlined"
          sx={{
            mb: 1, borderRadius: '8px',
            boxShadow: snapshot.isDragging ? '0 6px 12px rgba(0,0,0,0.12)' : '0 1px 2px rgba(0,0,0,0.03)',
            borderColor: '#e2e8f0', bgcolor: '#fff',
          }}
        >
          <CardContent sx={{ p: '10px !important' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.8, color: '#1e293b', fontSize: '0.78rem' }}>
                {item.name}
              </Typography>
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); setAnchorEl(e.currentTarget); }}
                sx={{ mt: -0.5, mr: -0.5 }}>
                <MoreHorizIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
              </IconButton>
            </Stack>
            <Stack spacing={0.5}>
              <Stack direction="row" spacing={0.75} alignItems="center">
                <PersonOutlineIcon sx={{ fontSize: 12, color: '#94a3b8' }} />
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.65rem' }}>{item.user}</Typography>
              </Stack>
              <Stack direction="row" spacing={0.75} alignItems="center">
                <LanguageIcon sx={{ fontSize: 12, color: '#94a3b8' }} />
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.65rem' }}>{item.source}</Typography>
              </Stack>
            </Stack>
            <Stack direction="row" justifyContent="space-between" alignItems="center"
              sx={{ mt: 1, pt: 0.75, borderTop: '1px dashed #e2e8f0' }}>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: '#0f172a' }}>
                {formatAmount(item.amount)}
              </Typography>
              {item.status && (
                <Chip label={item.status} size="small"
                  sx={{
                    bgcolor: (STATUS_COLORS[item.status] || {}).bg || '#f1f5f9',
                    color: (STATUS_COLORS[item.status] || {}).color || '#64748b',
                    fontWeight: 700, fontSize: '0.5rem', height: 16,
                  }} />
              )}
            </Stack>
          </CardContent>

          <LeadActionMenu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            onAction={(action) => { onAction(action, item); setAnchorEl(null); }}
          />
        </Card>
      )}
    </Draggable>
  );
}

// ── Main Pipeline Component ──
export default function LeadPipeline({ leads, setLeads, onFilterClick, onEditLead }) {
  const [view, setView] = useState('kanban');
  const [kanbanMenuAnchor, setKanbanMenuAnchor] = useState(null);
  const [kanbanMenuLeadId, setKanbanMenuLeadId] = useState(null);
  const [forwardDialog, setForwardDialog] = useState({ open: false, lead: null });
  const [taskDialog, setTaskDialog] = useState({ open: false, lead: null });
  const [stageChangeDialog, setStageChangeDialog] = useState({
    open: false, lead: null, fromStage: '', toStage: '', pendingResult: null,
  });
  const getStageTitle = (id) => STAGES.find((s) => s.id === id)?.title || id;

  // Called from both kanban drag and list dropdown
  const handleStageChangeRequest = (lead, fromStageId, toStageId, pendingResult) => {
    setStageChangeDialog({
      open: true,
      lead,
      fromStage: getStageTitle(fromStageId),
      toStage: getStageTitle(toStageId),
      fromStageId,
      toStageId,
      pendingResult,
    });
  };

  const handleDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Same column reorder — no confirmation needed
    if (source.droppableId === destination.droppableId) {
      const col = leads[source.droppableId];
      const items = [...col.items];
      const [removed] = items.splice(source.index, 1);
      items.splice(destination.index, 0, removed);
      setLeads({ ...leads, [source.droppableId]: { ...col, items } });
      return;
    }

    // Different column — open confirmation
    const lead = leads[source.droppableId].items[source.index];
    handleStageChangeRequest(lead, source.droppableId, destination.droppableId, result);
  };

  const handleConfirmStageChange = (note) => {
    const { lead, fromStageId, toStageId, pendingResult } = stageChangeDialog;

    // Update lead with note
    const updatedLead = { ...lead, stageChangeNote: note };

    const sourceCol = leads[fromStageId];
    const destCol = leads[toStageId];
    const sourceItems = sourceCol.items.filter((item) => item.id !== lead.id);
    const destItems = [...destCol.items, updatedLead];

    const newLeads = {
      ...leads,
      [fromStageId]: { ...sourceCol, items: sourceItems },
      [toStageId]: { ...destCol, items: destItems },
    };

    setLeads(newLeads);

    // TODO: Send stage change to backend API
    // api.updateLeadStage(lead.id, toStageId, note);
    console.log('Stage changed:', { leadId: lead.id, from: fromStageId, to: toStageId, note });

    setStageChangeDialog({ open: false, lead: null, fromStage: '', toStage: '', pendingResult: null });
  };

  const handleCancelStageChange = () => {
    setStageChangeDialog({ open: false, lead: null, fromStage: '', toStage: '', pendingResult: null });
  };

  // List view stage change handler
  const handleListStageChange = (lead, fromStageId, toStageId) => {
    handleStageChangeRequest(lead, fromStageId, toStageId, null);
  };

  // Unified action handler for menu items
  const handleLeadAction = (action, lead) => {
    switch (action) {
      case 'forward':
        setForwardDialog({ open: true, lead });
        break;
      case 'addTask':
        setTaskDialog({ open: true, lead });
        break;
      case 'view':
        console.log('View details:', lead.id);
        break;
      case 'edit':
        onEditLead?.(lead);
        break;
      default:
        break;
    }
  };

  return (
    <Box sx={{ bgcolor: '#fff', borderRadius: '16px', border: '1px solid #e9eef4', overflow: 'hidden' }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <TrendingUpIcon sx={{ fontSize: 22, color: '#1e293b' }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', fontSize: '1.05rem' }}>
            Sales Pipeline
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1.5} alignItems="center">
          {/* View Toggle */}
          <Box sx={{ display: 'inline-flex', bgcolor: '#f1f5f9', borderRadius: '10px', p: '3px' }}>
            {[
              { key: 'list', icon: <ViewListIcon sx={{ fontSize: 16 }} />, label: 'List' },
              { key: 'kanban', icon: <ViewKanbanIcon sx={{ fontSize: 16 }} />, label: 'Kanban' },
            ].map(({ key, icon, label }) => (
              <Box
                key={key}
                onClick={() => setView(key)}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 0.5,
                  px: 1.5, py: 0.5, borderRadius: '8px', cursor: 'pointer',
                  fontSize: '0.8rem', fontWeight: view === key ? 700 : 500,
                  color: view === key ? '#1e293b' : '#64748b',
                  bgcolor: view === key ? '#fff' : 'transparent',
                  boxShadow: view === key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s ease', userSelect: 'none',
                }}
              >
                {icon} {label}
              </Box>
            ))}
          </Box>

          {/* Filter */}
          <Box
            onClick={onFilterClick}
            sx={{
              display: 'flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 0.6,
              border: '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer',
              fontSize: '0.82rem', fontWeight: 600, color: '#475569',
              '&:hover': { bgcolor: '#f8fafc' },
            }}
          >
            <FilterListIcon sx={{ fontSize: 16 }} /> Filter
          </Box>
        </Stack>
      </Stack>

      {/* Content */}
      {view === 'kanban' ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Box sx={{
            display: 'flex', gap: 1.5, overflowX: 'auto', px: 2, pb: 2,
            '&::-webkit-scrollbar': { height: 6 },
            '&::-webkit-scrollbar-thumb': { bgcolor: '#cbd5e0', borderRadius: 10 },
          }}>
            {STAGES.map((stage) => {
              const col = leads[stage.id] || { items: [] };
              return (
                <Box key={stage.id} sx={{
                  minWidth: 220, flex: '1 1 0',
                  display: 'flex', flexDirection: 'column',
                  borderRadius: '12px', bgcolor: '#f8fafc',
                  border: `1px solid ${stage.color}30`,
                }}>
                  {/* Column Header */}
                  <Box sx={{ bgcolor: stage.color, p: 1.5, borderRadius: '10px 10px 0 0' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <Typography sx={{ fontWeight: 700, color: '#fff', fontSize: '0.78rem' }}>
                          {stage.title}
                        </Typography>
                        <Chip label={col.items.length} size="small"
                          sx={{ bgcolor: 'rgba(255,255,255,0.3)', color: '#fff', fontWeight: 700, height: 18, fontSize: '0.65rem' }} />
                      </Stack>
                      <Box sx={{ bgcolor: '#fff', px: 1, py: 0.1, borderRadius: 10 }}>
                        <Typography sx={{ color: '#1a202c', fontSize: '0.68rem', fontWeight: 800 }}>
                          {calculateColumnTotal(col.items)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                  {/* Droppable Area */}
                  <Droppable droppableId={stage.id}>
                    {(provided, snapshot) => (
                      <Box
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        sx={{
                          p: 1, minHeight: 120, flexGrow: 1,
                          bgcolor: snapshot.isDraggingOver ? '#edf2f7' : 'transparent',
                          transition: 'background-color 0.2s ease',
                          overflowY: 'auto', maxHeight: 400,
                          '&::-webkit-scrollbar': { width: 4 },
                          '&::-webkit-scrollbar-thumb': { bgcolor: '#e2e8f0', borderRadius: 10 },
                        }}
                      >
                        {col.items.map((item, index) => (
                          <KanbanLeadCard key={item.id} item={item} index={index} onAction={handleLeadAction} />
                        ))}
                        {provided.placeholder}
                      </Box>
                    )}
                  </Droppable>
                </Box>
              );
            })}
          </Box>
        </DragDropContext>
      ) : (
        <LeadListView leads={leads} onStageChange={handleListStageChange} onAction={handleLeadAction} />
      )}

      {/* Stage Change Confirmation Dialog */}
      <StageChangeDialog
        open={stageChangeDialog.open}
        onClose={handleCancelStageChange}
        onConfirm={handleConfirmStageChange}
        leadName={stageChangeDialog.lead?.name || ''}
        fromStage={stageChangeDialog.fromStage}
        toStage={stageChangeDialog.toStage}
      />

      {/* Forward Lead Dialog */}
      <LeadForwardDialog
        open={forwardDialog.open}
        onClose={() => setForwardDialog({ open: false, lead: null })}
        onForward={(data) => {
          console.log('Forward lead:', { leadId: forwardDialog.lead?.id, ...data });
          // TODO: Send to backend API
        }}
        leadName={forwardDialog.lead?.name || ''}
      />

      {/* Add Task Dialog */}
      <Dialog
        open={taskDialog.open}
        onClose={() => setTaskDialog({ open: false, lead: null })}
        fullWidth maxWidth="sm"
        PaperProps={{ sx: { borderRadius: '14px' } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={700}>Add Task</Typography>
          <IconButton size="small" onClick={() => setTaskDialog({ open: false, lead: null })}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5, overflow: 'visible' }}>
          <TaskForm
            initialValues={{ lead: taskDialog.lead?.id || '', client: '', taskType: '', title: '', details: '', scheduledAt: null, location: null, attachment: [] }}
            lockedAssociation={taskDialog.lead ? {
              mode: 'lead',
              option: { id: taskDialog.lead.id, label: taskDialog.lead.name },
            } : null}
            onCancel={() => setTaskDialog({ open: false, lead: null })}
            onSubmit={(payload, formData) => {
              console.log('Task created:', payload);
              console.log('Task multipart payload:', Array.from(formData.entries()));
              // TODO: Send to backend API
              setTaskDialog({ open: false, lead: null });
            }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
