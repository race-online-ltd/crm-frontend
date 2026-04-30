// src/features/leads/components/LeadPipelineSection.jsx
import React, { Suspense } from 'react';
import { LeadPipelineSkeleton } from './LeadSectionSkeletons';

const LeadPipeline = React.lazy(() => import('./LeadPipeline'));

export default function LeadPipelineSection(props) {
  return (
    <Suspense fallback={<LeadPipelineSkeleton />}>
      <LeadPipeline {...props} />
    </Suspense>
  );
}
