import React, { useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import astronaut from '../assets/astronaut-404.png';

const RocketSVG = () => (
  <svg width="28" height="42" viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'block' }}>
    <path d="M16 2 C10 2 6 10 6 20 L6 34 L26 34 L26 20 C26 10 22 2 16 2Z" fill="#534AB7"/>
    <ellipse cx="16" cy="20" rx="5" ry="6" fill="#AFA9EC"/>
    <path d="M6 28 L0 36 L6 34Z" fill="#E24B4A"/>
    <path d="M26 28 L32 36 L26 34Z" fill="#E24B4A"/>
    <path d="M10 34 L8 44 L16 40 L24 44 L22 34Z" fill="#EF9F27"/>
    <ellipse cx="10" cy="44" rx="3" ry="5" fill="#FAC775" opacity="0.7"/>
    <ellipse cx="16" cy="46" rx="3" ry="5" fill="#FAC775" opacity="0.8"/>
    <ellipse cx="22" cy="44" rx="3" ry="5" fill="#FAC775" opacity="0.7"/>
  </svg>
);

// ─── Tune these ────────────────────────────────────────────────
const PHASE_1_DURATION = 620;   // ms — rightward burst
const PHASE_2_DURATION =500;   // ms — upward arc
const PHASE_1_RIGHT    = 210;   // px — how far right it shoots
const PHASE_2_UP       = 0.65;  // fraction of viewport height to climb
const PHASE_2_LEFT     = 60;    // px — leftward drift on the way up
// ───────────────────────────────────────────────────────────────

const NotFound = () => {
  const navigate = useNavigate();
  const btnRef   = useRef(null);
  const rocketRef = useRef(null);

  const handleGoHome = useCallback(() => {
    const btn    = btnRef.current;
    const rocket = rocketRef.current;
    if (!btn || !rocket) { navigate('/'); return; }

    const btnRect = btn.getBoundingClientRect();
    const startX  = btnRect.right  + window.scrollX - 10;
    const startY  = btnRect.top    + window.scrollY + btnRect.height / 2 - 21;

    // --- Phase 0: place rocket, pointing right (90°) ---
    Object.assign(rocket.style, {
      display:    'block',
      left:       `${startX}px`,
      top:        `${startY}px`,
      transform:  'rotate(60deg)',   // nose pointing right
      opacity:    '1',
      transition: 'none',
    });

    // --- Phase 1: shoot right ---
    requestAnimationFrame(() => requestAnimationFrame(() => {
      Object.assign(rocket.style, {
        transition: `left ${PHASE_1_DURATION}ms cubic-bezier(0.2,0,0.8,1),
                     top  ${PHASE_1_DURATION}ms ease-out`,
        left:      `${startX + PHASE_1_RIGHT}px`,
        top:       `${startY}px`,       // stay level
      });
    }));

    // --- Phase 2: pivot and climb ---
    setTimeout(() => {
      Object.assign(rocket.style, {
        transition: [
          `left      ${PHASE_2_DURATION}ms cubic-bezier(0.4,0,0.6,1)`,
          `top       ${PHASE_2_DURATION}ms cubic-bezier(0.4,0,0.2,1)`,
          `transform ${PHASE_2_DURATION * 0.4}ms ease-out`,   // quick rotate
          `opacity   ${PHASE_2_DURATION * 0.3}ms ease-in ${PHASE_2_DURATION * 0.7}ms`,
        ].join(', '),
        left:      `${startX + PHASE_1_RIGHT - PHASE_2_LEFT}px`,
        top:       `${startY - window.innerHeight * PHASE_2_UP}px`,
        transform: 'rotate(-25deg)',   // tilted slightly left of straight up
        opacity:   '0',
      });
    }, PHASE_1_DURATION);

    // --- Done: navigate ---
    setTimeout(() => {
      rocket.style.display = 'none';
      navigate('/');
    }, PHASE_1_DURATION + PHASE_2_DURATION + 80);

  }, [navigate]);

  return (
    <>
      <Box
        ref={rocketRef}
        sx={{
          position:      'fixed',
          display:       'none',
          pointerEvents: 'none',
          zIndex:        9999,
        }}
      >
        <RocketSVG />
      </Box>

      <Box sx={{
        display:       'flex',
        alignItems:    'center',
        justifyContent:'center',
        minHeight:     '100vh',
        background:    '#f5f7fa',
        px:            3,
      }}>
        <Box sx={{
          display:       'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems:    'center',
          gap:           { xs: 3, md: 8 },
          maxWidth:      820,
        }}>
          <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
            <Typography sx={{
              fontSize:      { xs: 56, md: 80 },
              fontWeight:    800,
              letterSpacing: 12,
              color:         '#1a1a2e',
              lineHeight:    1,
              mb:            0.5,
            }}>404</Typography>

            <Typography sx={{
              fontSize:      { xs: 18, md: 22 },
              fontWeight:    700,
              textTransform: 'uppercase',
              letterSpacing: 3,
              color:         '#1a1a2e',
              mb:            1.5,
            }}>Page Not Found</Typography>

            <Typography sx={{ fontSize: 14, color: '#888', mb: 3, maxWidth: 340 }}>
              Your search has ventured beyond the known universe.
            </Typography>

            <Button
              ref={btnRef}
              variant="outlined"
              startIcon={<HomeIcon />}
              onClick={handleGoHome}
              sx={{
                borderRadius: '50px',
                textTransform:'none',
                fontWeight:   600,
                px: 3, py: 1,
                borderColor:  '#1a1a2e',
                color:        '#1a1a2e',
                '&:hover': {
                  background:  '#1a1a2e',
                  color:       '#fff',
                  borderColor: '#1a1a2e',
                },
              }}
            >
              Back To Home
            </Button>
          </Box>

          <Box component="img" src={astronaut} alt="Lost in space"
            sx={{ width: { xs: 220, md: 320 }, height: 'auto' }} />
        </Box>
      </Box>
    </>
  );
};

export default NotFound;