import React, { Suspense } from 'react';
import { LeadStatsSkeleton } from './LeadSectionSkeletons';

const LeadStatCards = React.lazy(() => import('./LeadStatCards'));

export default function LeadStatCardsSection() {
  return (
    <Suspense fallback={<LeadStatsSkeleton />}>
      <LeadStatCards />
    </Suspense>
  );
}
