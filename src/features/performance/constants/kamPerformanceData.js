export const KAM_PERFORMANCE_TABLE_COLUMNS = [
  { key: 'kamName', label: 'KAM' },
  { key: 'assignedClients', label: 'Assigned Clients' },
  { key: 'activeLeads', label: 'Active Leads' },
  { key: 'wonLeads', label: 'Won Leads' },
  { key: 'conversionRate', label: 'Conversion Rate' },
  { key: 'totalRevenue', label: 'Total Revenue' },
];

export const MOCK_KAM_PERFORMANCE = {
  performanceRows: [
    {
      id: 'kam-1',
      kamName: 'Ahsan Rahman',
      assignedClients: 24,
      activeLeads: 9,
      wonLeads: 4,
      conversionRate: '44%',
      totalRevenue: '৳ 12,40,000',
    },
    {
      id: 'kam-2',
      kamName: 'Nadia Islam',
      assignedClients: 19,
      activeLeads: 7,
      wonLeads: 3,
      conversionRate: '43%',
      totalRevenue: '৳ 10,85,000',
    },
    {
      id: 'kam-3',
      kamName: 'Tanvir Hossain',
      assignedClients: 27,
      activeLeads: 11,
      wonLeads: 5,
      conversionRate: '45%',
      totalRevenue: '৳ 14,15,000',
    },
    {
      id: 'kam-4',
      kamName: 'Farzana Kabir',
      assignedClients: 16,
      activeLeads: 6,
      wonLeads: 2,
      conversionRate: '33%',
      totalRevenue: '৳ 8,90,000',
    },
  ],
  topInvoices: [
    { id: 'inv-1', clientName: 'Race Online Ltd.', amount: '৳ 4,25,000', month: 'April 2026' },
    { id: 'inv-2', clientName: 'Earth Telecommunication', amount: '৳ 3,80,000', month: 'April 2026' },
    { id: 'inv-3', clientName: 'Orbit Internet', amount: '৳ 3,10,000', month: 'April 2026' },
  ],
  topPerformers: [
    { id: 'perf-1', kamName: 'Tanvir Hossain', revenue: '৳ 14,15,000', growth: '+18%' },
    { id: 'perf-2', kamName: 'Ahsan Rahman', revenue: '৳ 12,40,000', growth: '+12%' },
    { id: 'perf-3', kamName: 'Nadia Islam', revenue: '৳ 10,85,000', growth: '+9%' },
  ],
  revenueFlow: [
    { month: 'Jan', revenue: 620000 },
    { month: 'Feb', revenue: 780000 },
    { month: 'Mar', revenue: 910000 },
    { month: 'Apr', revenue: 1240000 },
    { month: 'May', revenue: 1360000 },
    { month: 'Jun', revenue: 1490000 },
  ],
};

export async function fetchKamPerformanceData() {
  // Backend-ready shape. Replace with axios.get(...) later.
  return Promise.resolve(MOCK_KAM_PERFORMANCE);
}
