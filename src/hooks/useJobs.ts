// src/hooks/useJobs.ts
import { useContext } from 'react';
import { JobsContext } from '../contexts/jobs/JobsContext';

export const useJobs = () => {
  const context = useContext(JobsContext);
  if (!context) {
    throw new Error('useJobs must be used within a JobsProvider');
  }
  return context;
};
