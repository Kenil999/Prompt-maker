import React, { useState } from 'react';

interface ResultViewProps {
  prompt: string;
  onReset: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({ prompt, onReset }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-4">
          <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Prompt Engineered.</h2>
        <p className="text-slate-400">Ready to deploy to your favorite LLM.</p>
      </div>

      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
        <div className="relative bg-dark-900 rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50 border-b border-slate-700">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
            </div>
            <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">Final Output</span>
          </div>
          <div className="p-6 md:p-8 overflow-x-auto">
            <pre className="font-mono text-sm md:text-base text-brand-50 whitespace-pre-wrap leading-relaxed">
              {prompt}
            </pre>
          </div>
          <div className="bg-slate-800/50 p-4 border-t border-slate-700 flex flex-col sm:flex-row gap-3 justify-end">
            <button
              onClick={onReset}
              className="px-6 py-2.5 rounded-lg text-slate-300 font-medium hover:text-white hover:bg-slate-700 transition-colors"
            >
              Start New
            </button>
            <button
              onClick={handleCopy}
              className={`px-6 py-2.5 rounded-lg font-bold flex items-center justify-center space-x-2 transition-all duration-200 ${
                copied 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' 
                  : 'bg-white text-slate-900 hover:bg-slate-200'
              }`}
            >
              {copied ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  <span>Copy Prompt</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultView;