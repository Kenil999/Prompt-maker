import React, { useState } from 'react';

interface QuestionFormProps {
  questions: string[];
  onSubmit: (answers: string[]) => void;
  isLoading: boolean;
}

const QuestionForm: React.FC<QuestionFormProps> = ({ questions, onSubmit, isLoading }) => {
  const [answers, setAnswers] = useState<string[]>(new Array(questions.length).fill(''));

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answers.every(a => a.trim().length > 0)) {
      onSubmit(answers);
    }
  };

  const progress = Math.round((answers.filter(a => a.trim().length > 0).length / questions.length) * 100);

  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in">
      <div className="flex justify-between items-end mb-6">
        <h2 className="text-2xl font-bold text-white">Refine Your Vision</h2>
        <span className="text-brand-400 text-sm font-mono">{progress}% Complete</span>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-slate-800 h-1 rounded-full mb-8 overflow-hidden">
        <div 
          className="bg-brand-500 h-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {questions.map((q, idx) => (
          <div key={idx} className="bg-dark-800 p-5 rounded-xl border border-slate-700/50 shadow-sm focus-within:ring-1 focus-within:ring-brand-500/50 transition-all duration-300">
            <label className="block text-brand-100 font-medium mb-3 text-lg leading-relaxed">
              <span className="text-brand-500 mr-2 font-mono">0{idx + 1}.</span>
              {q}
            </label>
            <input
              type="text"
              value={answers[idx]}
              onChange={(e) => handleAnswerChange(idx, e.target.value)}
              placeholder="Your answer..."
              className="w-full bg-slate-900/50 text-white rounded-lg border border-slate-700 px-4 py-3 focus:outline-none focus:border-brand-500 transition-colors"
              required
            />
          </div>
        ))}

        <div className="pt-4 pb-20 md:pb-0">
          <button
            type="submit"
            disabled={isLoading || answers.some(a => !a.trim())}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 transform active:scale-[0.99] ${
              !isLoading && answers.every(a => a.trim())
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
               <span className="flex items-center justify-center animate-pulse">
                Constructing Master Prompt...
              </span>
            ) : (
              'Generate Optimized Prompt'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuestionForm;