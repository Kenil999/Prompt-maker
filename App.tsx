import React, { useState } from 'react';
import StepIndicator from './components/StepIndicator';
import InputSection from './components/InputSection';
import QuestionForm from './components/QuestionForm';
import ResultView from './components/ResultView';
import { generateRefinementQuestions, generateFinalPrompt } from './services/geminiService';

type AppStep = 'input' | 'questions' | 'result';

export default function App() {
  const [step, setStep] = useState<AppStep>('input');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [originalIdea, setOriginalIdea] = useState('');
  const [questions, setQuestions] = useState<string[]>([]);
  const [finalPrompt, setFinalPrompt] = useState('');

  // Step 1: Analyze Idea
  const handleIdeaSubmit = async (idea: string) => {
    setLoading(true);
    setError(null);
    setOriginalIdea(idea);

    try {
      const generatedQuestions = await generateRefinementQuestions(idea);
      setQuestions(generatedQuestions);
      setStep('questions');
    } catch (err) {
      console.error(err);
      setError("AI is busy or encountered an error. Please try again in 10 seconds.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Generate Prompt
  const handleQuestionsSubmit = async (answers: string[]) => {
    setLoading(true);
    setError(null);

    const qaPairs = questions.map((q, i) => ({
      question: q,
      answer: answers[i]
    }));

    try {
      const prompt = await generateFinalPrompt(originalIdea, qaPairs);
      setFinalPrompt(prompt);
      setStep('result');
    } catch (err) {
      console.error(err);
      setError("Failed to generate the final prompt. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Reset
  const handleReset = () => {
    setStep('input');
    setOriginalIdea('');
    setQuestions([]);
    setFinalPrompt('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans selection:bg-brand-500/30 selection:text-brand-100">
      
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-900/20 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-900/20 blur-[100px]" />
      </div>

      {/* Main Content */}
      <main className="flex-grow z-10 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-4xl">
          
          <StepIndicator 
            currentStep={step === 'input' ? 1 : step === 'questions' ? 2 : 3} 
            totalSteps={3} 
          />

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-center animate-pulse">
              {error}
            </div>
          )}

          {step === 'input' && (
            <InputSection onSubmit={handleIdeaSubmit} isLoading={loading} />
          )}

          {step === 'questions' && (
            <QuestionForm 
              questions={questions} 
              onSubmit={handleQuestionsSubmit} 
              isLoading={loading} 
            />
          )}

          {step === 'result' && (
            <ResultView prompt={finalPrompt} onReset={handleReset} />
          )}
        </div>
      </main>

      <footer className="z-10 py-6 text-center text-slate-600 text-sm">
        <p>Powered by Gemini 2.5 Flash • Built for Speed & Precision</p>
      </footer>
    </div>
  );
}