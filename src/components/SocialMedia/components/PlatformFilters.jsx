import { Stack, Button } from '@mui/material';

export default function PlatformFilters({ active, onToggle }) {
  const platforms = ['Facebook', 'Whatsapp', 'Email'];
  return (
    <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
      {platforms.map((p) => (
        <Button
          key={p}
          variant={active === p ? "contained" : "outlined"}
          onClick={() => onToggle(p)}
          sx={{ borderRadius: 2, textTransform: 'none', px: 3, bgcolor: active === p ? '#0061ff' : '#fff' }}
        >
          {p}
        </Button>
      ))}
    </Stack>
  );
}