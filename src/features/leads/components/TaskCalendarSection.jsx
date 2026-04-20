import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import { LeadCalendarSkeleton } from './LeadSectionSkeletons';

const TaskCalendar = React.lazy(() => import('../../task/components/TaskCalendar'));

export default function TaskCalendarSection() {
  const sectionRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(() => typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) {
      return undefined;
    }

    if (typeof IntersectionObserver === 'undefined') {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '120px 0px',
        threshold: 0.15,
      },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return (
    <Box ref={sectionRef}>
      {shouldLoad ? (
        <Suspense fallback={<LeadCalendarSkeleton />}>
          <TaskCalendar />
        </Suspense>
      ) : (
        <LeadCalendarSkeleton />
      )}
    </Box>
  );
}
