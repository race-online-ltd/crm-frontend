// src/dummy/data.js
// Column definitions
export const columns = [
  { id: "name", label: "Dessert", numeric: false, sortable: true },
  { id: "calories", label: "Calories", numeric: true, sortable: true },
  { id: "fat", label: "Fat (g)", numeric: true, sortable: true },
  { id: "carbs", label: "Carbs (g)", numeric: true, sortable: true },
  { id: "protein", label: "Protein (g)", numeric: true, sortable: true },
];

// Row data
export const rows = [
  { id: 1, name: "Cupcake", calories: 305, fat: 3.7, carbs: 67, protein: 4.3 },
  { id: 2, name: "Donut", calories: 452, fat: 25, carbs: 51, protein: 4.9 },
  { id: 3, name: "Eclair", calories: 262, fat: 16, carbs: 24, protein: 6.0 },
  { id: 4, name: "Frozen Yogurt", calories: 159, fat: 6.0, carbs: 24, protein: 4.0 },
  { id: 5, name: "Gingerbread", calories: 356, fat: 16.0, carbs: 49, protein: 3.9 },
];

// Kanban board sales data
export const salesBoardData = {
  lead: { 
    id: 'lead', 
    title: 'New Leads', 
    color: '#3b82f6', 
    items: [
      { id: 's1', name: 'Global Tech', user: 'Alice', source: 'Web', amount: '৳50,000', status: 'New' }
    ] 
  },
  contacted: { 
    id: 'contacted', 
    title: 'Contacted', 
    color: '#f59e0b', 
    items: [
      { id: 's3', name: 'Quantum Soft', user: 'Charlie Day', source: 'LinkedIn', amount: '৳85,500', status: 'Contacted' }
    ] 
  },
  qualified: { 
    id: 'qualified', 
    title: 'Qualified', 
    color: '#a855f7', 
    items: [
      { id: 's2', name: 'Nexus Solutions', user: 'Bob Smith', source: 'Referral', amount: '৳1,20,000', status: 'In Progress' }
    ] 
  },
  proposal: { id: 'proposal', title: 'Proposal', color: '#0ea5e9', items: [] },
  completed: { id: 'completed', title: 'Finished', color: '#10b981', items: [] },
};

// Add this export to fix your SyntaxError!
export const projectBoardData = {
  todo: { id: 'todo', title: 'To Do', color: '#64748b', items: [] }
};

export const productOptions = [
  { id: 1, label: "CRM Software" },
  { id: 2, label: "Analytics Suite" },
  { id: 3, label: "Marketing Tools" },
];
