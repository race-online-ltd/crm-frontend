import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import { 
  Box, Paper, Typography, IconButton, Chip, 
  Menu, MenuItem, Stack, Button, Fade 
} from "@mui/material";
import { 
  MoreVert, Visibility, Edit, CalendarMonth, 
  ChevronLeft, ChevronRight, Person 
} from "@mui/icons-material";
import { TbCurrencyTaka } from "react-icons/tb";

/**
 * 1. Internal LeadCard Component
 * Fixed: Added the actual Menu component and handled actions
 */
const LeadCard = ({ lead, products, formatCurrency, onView, onEdit }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const productNames = (lead.products || [])
    .map(id => products.find(p => p.id === id)?.name)
    .filter(Boolean);

  return (
    <Paper
      draggable
      onDragStart={(e) => e.dataTransfer.setData("leadId", lead.id)}
      elevation={1}
      sx={{
        p: 1.5, mb: 1.5, cursor: "grab", border: "1px solid", borderColor: "divider",
        transition: "0.2s",
        "&:hover": { boxShadow: 3, transform: "translateY(-2px)", borderColor: "primary.light" },
        "&:active": { cursor: "grabbing" }
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: 'flex-start' }}>
        <Box sx={{ mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{lead.company}</Typography>
          <Typography variant="caption" color="text.secondary">{lead.businessEntity}</Typography>
        </Box>
        <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
          <MoreVert fontSize="small" />
        </IconButton>
        
        <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)} TransitionComponent={Fade}>
          <MenuItem onClick={() => { onView(lead); setAnchorEl(null); }}><Visibility sx={{ mr: 1, fontSize: 18 }}/> View</MenuItem>
          <MenuItem onClick={() => { onEdit(lead); setAnchorEl(null); }}><Edit sx={{ mr: 1, fontSize: 18 }}/> Edit</MenuItem>
        </Menu>
      </Box>

      <Stack spacing={1}>
        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
          {productNames.map((name, i) => (
            <Chip key={i} label={name} size="small" variant="outlined" sx={{ height: 18, fontSize: "0.6rem" }} />
          ))}
        </Box>
        
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Person sx={{ fontSize: 14, color: "text.secondary" }} />
          <Typography variant="caption" color="text.secondary">{lead.assignedKamName}</Typography>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center", color: "success.main", fontWeight: 700 }}>
            <TbCurrencyTaka />
            <Typography variant="body2">{formatCurrency(lead.expectedValue)}</Typography>
          </Box>
          <Chip label={lead.status} color="primary" size="small" sx={{ height: 18, fontSize: "0.6rem" }} />
        </Box>
      </Stack>
    </Paper>
  );
};

/**
 * 2. Main Kanban Component
 */
export function LeadKanbanViewMUI({ 
  leads = [], 
  pipelineStages = [], 
  products = [],
  onStageChange = () => {},
  onView = () => {},
  onEdit = () => {},
  formatCurrency = (val) => val 
}) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - 300 : scrollLeft + 300;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <Box sx={{ position: "relative", width: "100%", group: "kanban" }}>
      {/* Scroll Buttons */}
      <IconButton 
        onClick={() => scroll('left')}
        sx={{ position: 'absolute', left: -20, top: '50%', zIndex: 2, bgcolor: 'background.paper', boxShadow: 2, '&:hover': { bgcolor: 'grey.100' } }}
      >
        <ChevronLeft />
      </IconButton>
      
      <IconButton 
        onClick={() => scroll('right')}
        sx={{ position: 'absolute', right: -20, top: '50%', zIndex: 2, bgcolor: 'background.paper', boxShadow: 2, '&:hover': { bgcolor: 'grey.100' } }}
      >
        <ChevronRight />
      </IconButton>

      <Box 
        ref={scrollRef}
        sx={{ 
          display: "flex", gap: 2, overflowX: "auto", pb: 2, px: 1,
          scrollBehavior: 'smooth',
          '&::-webkit-scrollbar': { height: 8 },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.1)', borderRadius: 4 }
        }}
      >
        {pipelineStages.map((stage) => {
          const stageLeads = leads.filter(l => l.stage === stage.id);
          const totalValue = stageLeads.reduce((sum, l) => sum + (l.expectedValue || 0), 0);

          return (
            <Box
              key={stage.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                const leadId = e.dataTransfer.getData("leadId");
                onStageChange(leadId, stage.id);
              }}
              sx={{ minWidth: 300, width: 300, flexShrink: 0 }}
            >
              <Paper 
                elevation={0}
                sx={{ 
                  bgcolor: stage.color, color: "white", p: 1.5, borderRadius: "8px 8px 0 0",
                  display: "flex", justifyContent: "space-between", alignItems: "center"
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {stage.name} ({stageLeads.length})
                </Typography>
                <Typography variant="caption" sx={{ bgcolor: "rgba(255,255,255,0.2)", px: 1, borderRadius: 1 }}>
                   ৳ {formatCurrency(totalValue)}
                </Typography>
              </Paper>

              <Box sx={{ 
                bgcolor: "grey.50", border: "1px solid", borderColor: "divider",
                borderTop: "none", borderRadius: "0 0 8px 8px", p: 1.5, minHeight: "60vh" 
              }}>
                {stageLeads.map(lead => (
                  <LeadCard 
                    key={lead.id} lead={lead} products={products} 
                    formatCurrency={formatCurrency} onView={onView} onEdit={onEdit}
                  />
                ))}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

// Add PropTypes for "Clean" documentation
LeadKanbanViewMUI.propTypes = {
  leads: PropTypes.array,
  pipelineStages: PropTypes.array.isRequired,
  products: PropTypes.array,
  onStageChange: PropTypes.func,
  onView: PropTypes.func,
  onEdit: PropTypes.func,
  formatCurrency: PropTypes.func,
};