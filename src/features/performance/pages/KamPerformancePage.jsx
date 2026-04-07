import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import KamPerformanceTable from '../components/KamPerformanceTable';
import TopInvoiceCard from '../components/TopInvoiceCard';
import TopPerformersCard from '../components/TopPerformersCard';
import RevenueFlowChart from '../components/RevenueFlowChart';
import { fetchKamPerformanceData } from '../constants/kamPerformanceData';
import '../styles/kamPerformance.css';

export default function KamPerformancePage() {
  const [performanceData, setPerformanceData] = useState({
    performanceRows: [],
    topInvoices: [],
    topPerformers: [],
    revenueFlow: [],
  });

  useEffect(() => {
    let mounted = true;

    async function loadPerformanceData() {
      const response = await fetchKamPerformanceData();
      if (mounted) {
        setPerformanceData(response);
      }
    }

    loadPerformanceData();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Box className="kam-performance-page">
      <div className="kam-performance-page__header kam-performance-page__header--simple">
        <Typography variant="h5" className="kam-performance-page__title kam-performance-page__title--simple">
          KAM Performance
        </Typography>
      </div>

      <KamPerformanceTable rows={performanceData.performanceRows} />

      <div className="kam-performance-page__grid">
        <TopInvoiceCard items={performanceData.topInvoices} />
        <TopPerformersCard items={performanceData.topPerformers} />
      </div>

      <RevenueFlowChart data={performanceData.revenueFlow} />
    </Box>
  );
}
