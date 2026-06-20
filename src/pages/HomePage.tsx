import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import ResumeCard from '../components/ResumeCard';
import { usePuterStore } from '../lib/puter';
import { useNavigate } from '../lib/router';

const HomePage = () => {
  const { auth, isLoading, kv } = usePuterStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) navigate('/auth?next=/');
  }, [isLoading, auth.isAuthenticated]);

  useEffect(() => {
    if (!auth.isAuthenticated) return;

    const loadResumes = async () => {
      setLoadingResumes(true);
      const list = (await kv.list('resume:*', true)) as KVItem[];
      const parsed = list?.map((r) => JSON.parse(r.value) as Resume) || [];
      setResumes(parsed);
      setLoadingResumes(false);
    };

    loadResumes();
  }, [auth.isAuthenticated]);

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />
      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Track Your Applications & Resume Ratings</h1>
          {!loadingResumes && resumes.length === 0 ? (
            <h2>No resumes found. Upload your first resume to get feedback.</h2>
          ) : (
            <h2>Review your submissions and check AI-powered feedback.</h2>
          )}
        </div>

        {loadingResumes && (
          <div className="flex flex-col items-center justify-center">
            <img src="/images/resume-scan-2.gif" className="w-[200px]" />
          </div>
        )}

        {!loadingResumes && resumes.length > 0 && (
          <div className="resumes-section">
            {resumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume} />
            ))}
          </div>
        )}

        {!loadingResumes && resumes.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-10 gap-4">
            <button
              onClick={() => navigate('/upload')}
              className="primary-button w-fit text-xl font-semibold"
            >
              Upload Resume
            </button>
          </div>
        )}
      </section>
    </main>
  );
};

export default HomePage;
