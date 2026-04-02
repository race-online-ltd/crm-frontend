import React from 'react';
import BarChart from '../../components/shared/charts/BarChart';
import DonutChart from '../../components/shared/charts/DonutChart';


const DUMMY_DATA = [
  { month: "Jan", sales: 4000, profit: 2400 },
  { month: "Feb", sales: 3000, profit: 1398 },
  { month: "Mar", sales: 2000, profit: 9800 },
  { month: "Apr", sales: 2780, profit: 3908 },
  { month: "May", sales: 1890, profit: 4800 },
  { month: "Jun", sales: 2390, profit: 3800 },
];

const BAR_CONFIG = [
  { 
    dataKey: "sales", 
    name: "Monthly Sales ($)", 
    color: "#8884d8", 
    yAxisId: "left" 
  },
  { 
    dataKey: "profit", 
    name: "Net Profit ($)", 
    color: "#82ca9d", 
    yAxisId: "right" 
  },
];

// Format data for DonutChart
const donutFormattedData = [
        {
            data: DUMMY_DATA.map((item, index) => ({
                id: index,
                value: item.sales, // Use sales or profit here
                label: item.month,
            })),
        },
    ];

const ChartComponents = () => {
    return (
        <div>
            {/* Barchart component */}
            <h3>Barchat</h3>
            <BarChart 
                title="Revenue vs Profit"
                data={DUMMY_DATA}
                xKey="month"
                bars={BAR_CONFIG}
                height={400}
            />

            {/* Donut chart */}
            <DonutChart 
                seriesData={donutFormattedData} 
                centerLabel="2,263 Total" 
                innerRadius={70} 
                outerRadius={120}
            />
        </div>
    );
};

export default ChartComponents;