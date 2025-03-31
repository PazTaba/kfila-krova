import React, { createContext, useContext, useEffect, useState } from 'react';
import { Job } from '../types/Jobs';
import { useUser } from '../hooks/useUser';

interface JobsContextType {
    jobs: Job[];
    fetchJobs: () => Promise<void>;
    likeJob: (jobId: string) => void;
    saveJob: (jobId: string) => void;
    rateJob: (jobId: string, rating: number, feedback?: string) => void;
}

const JobsContext = createContext<JobsContextType>({} as JobsContextType);

export const JobsProvider = ({ children }: { children: React.ReactNode }) => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const { token } = useUser();

    const fetchJobs = async () => {
        try {
            const response = await fetch('http://172.20.10.3:3000/jobs', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            setJobs(data);
        } catch (err) {
            console.error('❌ שגיאה בשליפת משרות:', err);
        }
    };

    const likeJob = (jobId: string) => {
        setJobs(prev =>
            prev.map(job =>
                job.id === jobId
                    ? {
                        ...job,
                        likedBy: job.likedBy?.includes('me')
                            ? job.likedBy?.filter(id => id !== 'me')
                            : [...(job.likedBy || []), 'me'],
                    }
                    : job
            )
        );
        // כאן תוכל לשלוח בקשה לשרת אם תרצה
    };

    const saveJob = (jobId: string) => {
        setJobs(prev =>
            prev.map(job =>
                job.id === jobId
                    ? {
                        ...job,
                        savedBy: job.savedBy?.includes('me')
                            ? job.savedBy?.filter(id => id !== 'me')
                            : [...(job.savedBy || []), 'me'],
                    }
                    : job
            )
        );
    };

    const rateJob = (jobId: string, rating: number, feedback?: string) => {
        setJobs(prev =>
            prev.map(job =>
                job.id === jobId
                    ? {
                        ...job,
                        ratings: [
                            ...(job.ratings || []),
                            { userId: 'me', rating, feedback },
                        ],
                        averageRating:
                            (((job.averageRating || 0) * (job.ratings?.length || 0)) + rating) /
                            ((job.ratings?.length || 0) + 1),
                    }
                    : job
            )
        );
    };

    useEffect(() => {
        if (token) {
            fetchJobs();
        }
    }, [token]);

    return (
        <JobsContext.Provider value={{ jobs, fetchJobs, likeJob, saveJob, rateJob }}>
            {children}
        </JobsContext.Provider>
    );
};

export const useJobs = () => useContext(JobsContext);
