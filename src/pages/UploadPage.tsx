import {type FormEvent, useState } from 'react';
import Navbar from '../components/Navbar';
import FileUploader from '../components/FileUploader';
import { usePuterStore } from '../lib/puter';
import { useNavigate } from '../lib/router';
import { convertPdfToImage } from '../lib/pdf2img';
import { generateUUID } from '../lib/utils';
import { prepareInstructions } from '../../constants';

const UploadPage = () => {
  const { fs, ai, kv } = usePuterStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleFileSelect = (f: File | null) => setFile(f);

  const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file }: { companyName: string; jobTitle: string; jobDescription: string; file: File }) => {
    console.log('handleAnalyze started');
    setIsProcessing(true);

    //console.log('uploading file...');
    setStatusText('Uploading the file...');
    const uploadedFile = await fs.upload([file]);
    //console.log('uploadedFile:', uploadedFile);
    if (!uploadedFile) { setIsProcessing(false); return setStatusText('Error: Failed to upload file'); }

    //console.log('converting to image...');
    setStatusText('Converting to image...');
    const imageFile = await convertPdfToImage(file);
    //console.log('imageFile:', imageFile);
    if (!imageFile.file) { setIsProcessing(false); return setStatusText('Error: Failed to convert PDF'); }

    //console.log('uploading image...');
    setStatusText('Uploading the image...');
    const uploadedImage = await fs.upload([imageFile.file]);
    //console.log('uploadedImage:', uploadedImage);
    if (!uploadedImage) { setIsProcessing(false); return setStatusText('Error: Failed to upload image'); }

    //console.log('saving to kv...');
    setStatusText('Preparing data...');
    const uuid = generateUUID();
    const data: any = { id: uuid, resumePath: uploadedFile.path, imagePath: uploadedImage.path, companyName, jobTitle, jobDescription, feedback: '' };
    await kv.set(`resume:${uuid}`, JSON.stringify(data));
    //console.log('kv saved, calling ai.feedback...');
    setStatusText('Analyzing...');
    const feedback = await ai.feedback(uploadedFile.path, prepareInstructions({ jobTitle, jobDescription }));
    //console.log('feedback result:', feedback);
    if (!feedback) { setIsProcessing(false); return setStatusText('Error: Failed to analyze resume'); }

    const feedbackText = typeof feedback.message.content === 'string'
        ? feedback.message.content
        : feedback.message.content[0].text;
    //console.log('feedbackText:', feedbackText);

    let parsedFeedback;
    try {
        const cleanedText = feedbackText.replace(/```json|```/g, '').trim();
        parsedFeedback = JSON.parse(cleanedText);
        console.log('parsedFeedback:', parsedFeedback);
    } catch(e) {
        console.log('JSON parse error:', e);
        setIsProcessing(false);
        return setStatusText('Error: Failed to parse AI feedback');
    }

    data.feedback = parsedFeedback;
    await kv.set(`resume:${uuid}`, JSON.stringify(data));

    //console.log('navigating to /resume/' + uuid);
    setStatusText('Analysis complete, redirecting...');
    navigate(`/resume/${uuid}`);
};

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const companyName = formData.get('company-name') as string;
    const jobTitle = formData.get('job-title') as string;
    const jobDescription = formData.get('job-description') as string;
    if (!file) return;
    handleAnalyze({ companyName, jobTitle, jobDescription, file });
  };

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />
      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Smart feedback for your dream job</h1>
          {isProcessing ? (
            <>
              <h2>{statusText}</h2>
              <img src="/images/resume-scan.gif" className="w-full" />
            </>
          ) : (
            <h2>Drop your resume for an ATS score and improvement tips</h2>
          )}

          {!isProcessing && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
              <div className="form-div">
                <label htmlFor="company-name">Company Name</label>
                <input
                  type="text"
                  name="company-name"
                  placeholder="Company Name"
                  id="company-name"
                />
              </div>
              <div className="form-div">
                <label htmlFor="job-title">Job Title</label>
                <input
                  type="text"
                  name="job-title"
                  placeholder="Job Title"
                  id="job-title"
                />
              </div>
              <div className="form-div">
                <label htmlFor="job-description">Job Description</label>
                <textarea
                  rows={5}
                  name="job-description"
                  placeholder="Job Description"
                  id="job-description"
                />
              </div>
              <div className="form-div">
                <label>Upload Resume</label>
                <FileUploader onFileSelect={handleFileSelect} />
              </div>
              <button className="primary-button" type="submit">
                Analyze Resume
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
};

export default UploadPage;
