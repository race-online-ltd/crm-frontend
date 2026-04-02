// src/components/shared/KanbanCard.jsx
import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  Box, Typography, Card, CardContent, Chip, 
  Button, ButtonGroup, Stack, useTheme, useMediaQuery 
} from '@mui/material';
import {
  FilterList as FilterListIcon,
  ViewKanban as ViewKanbanIcon,
  PersonOutline as PersonOutlineIcon,
  Language as LanguageIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';

export default function KanbanCard({ title = "Team Pipeline", data, setData }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const calculateColumnTotal = (items) => {
    const total = items.reduce((acc, item) => {
      const num = typeof item.amount === 'string' 
        ? parseInt(item.amount.replace(/[^0-9]/g, ''), 10) || 0 
        : item.amount || 0;
      return acc + num;
    }, 0);
    return `৳${total.toLocaleString()}`;
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceCol = data[source.droppableId];
    const destCol = data[destination.droppableId];
    const sourceItems = [...sourceCol.items];
    const destItems = [...destCol.items];
    const [removed] = sourceItems.splice(source.index, 1);

    if (source.droppableId === destination.droppableId) {
      sourceItems.splice(destination.index, 0, removed);
      setData({ ...data, [source.droppableId]: { ...sourceCol, items: sourceItems } });
    } else {
      destItems.splice(destination.index, 0, removed);
      setData({
        ...data,
        [source.droppableId]: { ...sourceCol, items: sourceItems },
        [destination.droppableId]: { ...destCol, items: destItems }
      });
    }
  };

  if (!data) return null;

  return (
    <Box sx={{ p: { xs: 1, sm: 2 }, bgcolor: '#fff', borderRadius: 4, width: '100%', overflow: 'hidden' }}>
      {/* Header Bar */}
      <Stack 
        direction={isMobile ? "column" : "row"} 
        justifyContent="space-between" 
        alignItems={isMobile ? "flex-start" : "center"} 
        spacing={2} 
        sx={{ mb: 3 }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <TrendingUpIcon sx={{ fontSize: 24, color: '#1976d2' }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a202c' }}>{title}</Typography>
        </Stack>
        <Stack direction="row" spacing={1} width={isMobile ? "100%" : "auto"}>
          <ButtonGroup size="small" fullWidth={isMobile} sx={{ bgcolor: '#f7f9fc' }}>
            <Button 
              startIcon={<ViewKanbanIcon />} 
              variant="contained" 
              sx={{ textTransform: 'none', bgcolor: '#fff', color: '#1a202c', border: '1px solid #e2e8f0', boxShadow: 'none', flexGrow: 1 }}
            >
              Kanban
            </Button>
          </ButtonGroup>
          <Button 
            variant="outlined" 
            startIcon={<FilterListIcon />} 
            size="small" 
            sx={{ textTransform: 'none', color: '#1a202c', borderColor: '#e2e8f0', bgcolor: '#f7f9fc' }}
          >
            Filters
          </Button>
        </Stack>
      </Stack>

      {/* Kanban Board Container */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          overflowX: 'auto', 
          pb: 1,
          alignItems: 'stretch',
          minHeight: isMobile ? 300 : isTablet ? 350 : 400,
          maxHeight: isMobile ? 500 : isTablet ? 550 : 600,
          '&::-webkit-scrollbar': { height: '8px' },
          '&::-webkit-scrollbar-thumb': { bgcolor: '#cbd5e0', borderRadius: '10px' }
        }}>
          {Object.values(data).map((col) => (
            <Box 
              key={col.id} 
              sx={{ 
                minWidth: { xs: 220, sm: 260, md: 300 }, 
                width: { xs: 220, sm: 260, md: 500 },
                display: 'flex', 
                flexDirection: 'column',
                borderLeft: `1px solid ${col.color || '#1976d2'}`,
                borderRight: `1px solid ${col.color || '#1976d2'}`,
                borderBottom: `1px solid ${col.color || '#1976d2'}`,
                borderRadius: '12px',
                bgcolor: '#f8fafc',
                maxHeight: '100%'
              }}
            >
              {/* Column Header */}
              <Box sx={{ 
                bgcolor: col.color || '#1976d2', 
                p: 1.5, 
                color: 'white', 
                borderRadius: '10px 10px 0 0',
                borderTop: `1px solid ${col.color || '#1976d2'}` // ensures top matches header color
              }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>{col.title}</Typography>
                    <Chip 
                      label={col.items.length} 
                      size="small" 
                      sx={{ bgcolor: 'rgba(255,255,255,0.3)', color: 'white', fontWeight: 700, height: 18, fontSize: '0.7rem' }} 
                    />
                  </Stack>
                  <Box sx={{ bgcolor: 'white', px: 1, py: 0.1, borderRadius: 10 }}>
                    <Typography sx={{ color: '#1a202c', fontSize: '0.7rem', fontWeight: 800 }}>
                      {calculateColumnTotal(col.items)}
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <Box
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    sx={{
                      p: 1,
                      bgcolor: snapshot.isDraggingOver ? '#edf2f7' : 'transparent',
                      flexGrow: 1,
                      overflowY: 'auto',
                      transition: 'background-color 0.2s ease',
                      '&::-webkit-scrollbar': { width: '4px' },
                      '&::-webkit-scrollbar-thumb': { bgcolor: '#e2e8f0', borderRadius: '10px' }
                    }}
                  >
                    {col.items.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            variant="outlined"
                            sx={{
                              mb: 1.2,
                              borderRadius: '8px',
                              boxShadow: snapshot.isDragging ? '0 6px 12px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.02)',
                              borderColor: '#e2e8f0',
                              bgcolor: 'white'
                            }}
                          >
                            <CardContent sx={{ p: '10px !important' }}>
                              <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.8, color: '#1e293b', fontSize: '0.8rem' }}>
                                {item.name}
                              </Typography>
                              
                              <Stack spacing={0.7}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <PersonOutlineIcon sx={{ fontSize: 13, color: '#94a3b8' }} />
                                  <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.65rem' }}>{item.user}</Typography>
                                </Stack>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <LanguageIcon sx={{ fontSize: 13, color: '#94a3b8' }} />
                                  <Chip 
                                    label={item.source} 
                                    size="small" 
                                    sx={{ height: 14, fontSize: '0.55rem', bgcolor: '#f1f5f9', fontWeight: 600 }} 
                                  />
                                </Stack>
                              </Stack>

                              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1, pt: 1, borderTop: '1px dashed #e2e8f0' }}>
                                <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: '#0f172a' }}>
                                  {typeof item.amount === 'number' ? `৳${item.amount.toLocaleString()}` : item.amount}
                                </Typography>
                                <Chip 
                                  label={item.status} 
                                  size="small" 
                                  sx={{ bgcolor: '#eff6ff', color: '#2563eb', fontWeight: 700, fontSize: '0.5rem', height: 16 }} 
                                />
                              </Stack>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </Box>
          ))}
        </Box>
      </DragDropContext>
    </Box>
  );
}