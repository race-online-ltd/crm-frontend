import { useEffect, useState } from 'react';
import {
  Box,
  Divider,
  IconButton,
  Paper,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const PANEL_GAP = 16;
const DEFAULT_WIDTH = 420;
const MIN_WIDTH = 320;
const DEFAULT_HEIGHT = 680;
const MIN_HEIGHT = 320;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export default function SocialFloatingPanel({
  open,
  onClose,
  title,
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  children,
  contentSx = {},
}) {
  const [panelPosition, setPanelPosition] = useState({
    top: PANEL_GAP,
    left: PANEL_GAP,
    width,
    height,
  });

  useEffect(() => {
    if (!open) return undefined;

    const frameId = window.requestAnimationFrame(() => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const socialInbox = document.querySelector('.social-inbox');
      const socialInboxRect = socialInbox?.getBoundingClientRect();
      const nextWidth = Math.min(width, Math.max(viewportWidth - (PANEL_GAP * 2), MIN_WIDTH));
      const nextHeight = Math.min(height, Math.max(viewportHeight - (PANEL_GAP * 2), MIN_HEIGHT));
      const preferredLeft = socialInboxRect?.left ?? PANEL_GAP;
      const preferredTop = socialInboxRect?.top ?? PANEL_GAP;

      setPanelPosition({
        width: nextWidth,
        height: nextHeight,
        left: clamp(preferredLeft, PANEL_GAP, viewportWidth - nextWidth - PANEL_GAP),
        top: clamp(preferredTop, PANEL_GAP, viewportHeight - nextHeight - PANEL_GAP),
      });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [open, width, height]);

  useEffect(() => {
    if (!open) return undefined;

    function handleResize() {
      setPanelPosition((prev) => {
        const nextWidth = Math.min(prev.width, Math.max(window.innerWidth - (PANEL_GAP * 2), MIN_WIDTH));
        const nextHeight = Math.min(prev.height, Math.max(window.innerHeight - (PANEL_GAP * 2), MIN_HEIGHT));

        return {
          ...prev,
          width: nextWidth,
          height: nextHeight,
          left: clamp(prev.left, PANEL_GAP, window.innerWidth - nextWidth - PANEL_GAP),
          top: clamp(prev.top, PANEL_GAP, window.innerHeight - nextHeight - PANEL_GAP),
        };
      });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [open]);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: `${panelPosition.top}px`,
        left: `${panelPosition.left}px`,
        width: `${panelPosition.width}px`,
        height: `${panelPosition.height}px`,
        maxWidth: `calc(100vw - ${PANEL_GAP * 2}px)`,
        maxHeight: `calc(100vh - ${PANEL_GAP * 2}px)`,
        transform: open ? 'translateX(0)' : 'translateX(-24px)',
        opacity: open ? 1 : 0,
        transition: 'transform 220ms ease, opacity 220ms ease',
        zIndex: 1200,
        pointerEvents: open ? 'auto' : 'none',
      }}
    >
      <Paper
        elevation={8}
        sx={{
          height: '100%',
          borderRadius: 0,
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid #e2e8f0',
          boxShadow: '18px 0 40px rgba(15, 23, 42, 0.12)',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: 1,
            bgcolor: '#f8fafc',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontSize: '1rem',
              fontWeight: 700,
              flex: 1,
            }}
          >
            {title}
          </Typography>
          <IconButton
            size="small"
            onClick={onClose}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <Divider />
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            p: 2,
            ...contentSx,
          }}
        >
          {children}
        </Box>
      </Paper>
    </Box>
  );
}
