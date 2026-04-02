import { Stack, Paper, Box, Typography } from '@mui/material';

export default function BrandSection({ brands, selectedId, onSelect }) {
  return (
    <Stack direction="row" spacing={2} sx={{ mb: 3, overflowX: 'auto', pb: 1 }}>
      {brands.map((brand) => (
        <Paper
          key={brand.id}
          elevation={0}
          onClick={() => onSelect(brand.id)}
          sx={{
            p: 2, minWidth: 140, cursor: 'pointer', textAlign: 'center', borderRadius: 2,
            border: '2px solid',
            borderColor: selectedId === brand.id ? 'primary.main' : 'divider',
            backgroundColor: selectedId === brand.id ? 'aliceblue' : '#fff',
          }}
        >
          <Box component="img" src={brand.logo} sx={{ height: 35, mb: 1 }} />
          <Typography variant="caption" fontWeight={600}>{brand.name}</Typography>
        </Paper>
      ))}
    </Stack>
  );
}