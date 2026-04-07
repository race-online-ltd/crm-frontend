// src/features/leads/pages/LeadListPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Stack, Divider, Button, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import LeadStatCards from "../components/LeadStatCards";
import LeadPipeline from "../components/LeadPipeline";
import TaskCalendar from "../../task/components/TaskCalendar";

export default function LeadListPage() {
  /* ── MOCK LEAD DATA — inline so it can be removed easily when backend is wired ── */
  const [leads, setLeads] = useState({
    new: { title: "New", items: [] },
    contacted: { title: "Contacted", items: [] },
    qualified: {
      title: "Qualified",
      items: [
        {
          id: "lead-1",
          name: "StartupXYZ",
          user: "John Smith",
          source: "Website",
          sourceId: "bt3",
          businessEntity: "Alpha Corp",
          businessEntityId: "be1",
          client: "Global Systems Inc",
          clientId: "c1",
          productsIds: ["p1", "p3"],
          amount: 24000,
          expectedRevenue: "24000",
          stage: "qualified",
          deadline: "2026-04-25T00:00:00.000Z",
          status: "In Progress",
          products: "Product Alpha, Product Gamma",
          subtitle: "-",
        },
      ],
    },
    proposal: {
      title: "Proposal",
      items: [
        {
          id: "lead-2",
          name: "Tech Corporation",
          user: "John Smith",
          source: "Direct",
          sourceId: "bt1",
          businessEntity: "Beta Holdings",
          businessEntityId: "be2",
          client: "Nexus Solutions",
          clientId: "c2",
          productsIds: ["p2"],
          amount: 150000,
          expectedRevenue: "150000",
          stage: "proposal",
          deadline: "2026-05-02T00:00:00.000Z",
          status: "In Progress",
          products: "Product Beta",
          subtitle: "-",
        },
      ],
    },
    negotiation: { title: "Negotiation", items: [] },
    closed: {
      title: "Closed",
      items: [
        {
          id: "lead-3",
          name: "MedTech Solutions",
          user: "John Smith",
          source: "LinkedIn",
          sourceId: "bt3",
          businessEntity: "Gamma Ltd",
          businessEntityId: "be3",
          client: "Global Systems Inc",
          clientId: "c1",
          productsIds: ["p4"],
          amount: 275000,
          expectedRevenue: "275000",
          stage: "closed_won",
          deadline: "2026-03-28T00:00:00.000Z",
          status: "Won",
          products: "Product Delta",
          subtitle: "-",
        },
        {
          id: "lead-4",
          name: "dataSafe Inc",
          user: "Rimon Ahmed",
          source: "WhatsApp",
          sourceId: "bt2",
          businessEntity: "Alpha Corp",
          businessEntityId: "be1",
          client: "Nexus Solutions",
          clientId: "c2",
          productsIds: ["p1", "p2"],
          amount: 275000,
          expectedRevenue: "275000",
          stage: "closed_won",
          deadline: "2026-03-30T00:00:00.000Z",
          status: "Won",
          products: "Product Alpha, Product Beta",
          subtitle: "-",
        },
      ],
    },
  });
  /* ── END MOCK LEAD DATA ── */

  const navigate = useNavigate();

  const handleEditLead = (lead) => {
    navigate(`/leads/${lead.id}/edit`, {
      state: {
        lead: {
          id: lead.id,
          businessEntity: lead.businessEntityId || "",
          source: lead.sourceId || "",
          products: lead.productsIds || [],
          client: lead.clientId || "",
          expectedRevenue: lead.expectedRevenue || String(lead.amount || ""),
          stage: lead.stage || lead.stageId || "",
          deadline: lead.deadline ? new Date(lead.deadline) : null,
        },
      },
    });
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#ffffff", px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
      {/* Top row */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
        <Box>
          <Typography variant="h5" fontWeight={700} color="#0f172a">Leads</Typography>
          <Typography variant="body2" color="#64748b">Manage and track your leads</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/leads/new")}
          sx={{
            textTransform: "none", fontWeight: 600, borderRadius: "10px",
            bgcolor: "#2563eb", px: 2.5, py: 1,
            "&:hover": { bgcolor: "#1d4ed8" },
          }}
        >
          New Lead
        </Button>
      </Stack>

      {/* Stat Cards */}
      <LeadStatCards />

      {/* Pipeline */}
      <Box sx={{ mt: 3 }}>
        <LeadPipeline
          leads={leads}
          setLeads={setLeads}
          onFilterClick={() => console.log("Filter clicked")}
          onEditLead={handleEditLead}
        />
      </Box>

      {/* Divider */}
      <Divider sx={{ my: 3 }} />

      {/* Task Calendar */}
      <TaskCalendar />
    </Box>
  );
}
