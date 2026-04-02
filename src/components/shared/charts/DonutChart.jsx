import * as React from 'react';
import { PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';
import SettingsIcon from '@mui/icons-material/Settings';
import { useDrawingArea } from '@mui/x-charts/hooks';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DatePicker from '@mui/lab/DatePicker';

// Utility to convert hex to rgba
// const hexToRgba = (hex, alpha) => {
//   const r = parseInt(hex.slice(1, 3), 16);
//   const g = parseInt(hex.slice(3, 5), 16);
//   const b = parseInt(hex.slice(5, 7), 16);
//   return `rgba(${r}, ${g}, ${b}, ${alpha})`;
// };

// Styled center label for PieChart
const StyledText = styled('text')(({ theme }) => ({
  fill: theme.palette.text.primary,
  textAnchor: 'middle',
  dominantBaseline: 'central',
  fontSize: 20,
}));

function PieCenterLabel({ children }) {
  const { width, height, left, top } = useDrawingArea();
  return (
    <StyledText x={left + width / 2} y={top + height / 2}>
      {children}
    </StyledText>
  );
}

/**
 * Reusable DonutChart Component
 * @param {Array} seriesData - Array of series for the pie chart
 * @param {String} centerLabel - Label to show at center
 * @param {Number} innerRadius
 * @param {Number} outerRadius
 */
export default function DonutChart({
  seriesData,
  centerLabel = '',
  innerRadius = 50,
  outerRadius = 120,
}) {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [startDate, setStartDate] = React.useState(null);
  const [endDate, setEndDate] = React.useState(null);

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  return (
    <Box sx={{ width: '100%', textAlign: 'center' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Titanic survival statistics</Typography>
        <IconButton onClick={toggleDrawer(true)}>
          <SettingsIcon />
        </IconButton>
      </Stack>

      <Box sx={{ display: 'flex', justifyContent: 'center', height: 400 }}>
        <PieChart
          series={seriesData.map((s) => ({
            ...s,
            innerRadius,
            outerRadius,
            highlightScope: { fade: 'global', highlight: 'item' },
            highlighted: { additionalRadius: 2 },
            cornerRadius: 3,
          }))}
          sx={{
            [`& .${pieArcLabelClasses.root}`]: {
              fontSize: '12px',
            },
          }}
          hideLegend
        >
          <PieCenterLabel>{centerLabel}</PieCenterLabel>
        </PieChart>
      </Box>

      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box sx={{ width: 300, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Select Date Range
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Stack spacing={3}>
              <DatePicker
                views={['year', 'month']}
                label="Start Month"
                minDate={new Date('1900-01-01')}
                maxDate={new Date()}
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
              <DatePicker
                views={['year', 'month']}
                label="End Month"
                minDate={new Date('1900-01-01')}
                maxDate={new Date()}
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Stack>
          </LocalizationProvider>
        </Box>
      </Drawer>
    </Box>
  );
}
