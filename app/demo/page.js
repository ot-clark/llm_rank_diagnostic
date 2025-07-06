'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';

export default function DemoPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const demoSteps = [
    {
      title: "Enter Website URL",
      description: "Simply paste any website URL and click 'Analyze My Website'",
      example: "https://www.descript.com",
      image: "🔗"
    },
    {
      title: "AI Analysis",
      description: "Our AI analyzes your content across 5 key dimensions for LLM visibility",
      metrics: [
        { name: "Structure & Semantics", score: 85, color: "text-green-400" },
        { name: "Relevance & Intent", score: 78, color: "text-yellow-400" },
        { name: "Token Efficiency", score: 72, color: "text-yellow-400" },
        { name: "Link Graph", score: 65, color: "text-orange-400" },
        { name: "LLM Output Likelihood", score: 81, color: "text-green-400" }
      ],
      image: "📊"
    },
    {
      title: "Visual Overlays",
      description: "See exactly where to improve with Grammarly-style highlights and suggestions",
      highlights: [
        { severity: "high", text: "Generic content needs more specific details", suggestion: "Add concrete examples and data points" },
        { severity: "medium", text: "Missing internal linking structure", suggestion: "Include relevant internal links" },
        { severity: "low", text: "Could improve content density", suggestion: "Add more comprehensive information" }
      ],
      image: "👁️"
    },
    {
      title: "Actionable Insights",
      description: "Get specific recommendations to improve your AI visibility score",
      recommendations: [
        "Improve content structure and semantic markup",
        "Enhance relevance and intent clarity", 
        "Optimize token efficiency and content density"
      ],
      image: "🎯"
    }
  ];

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case 'medium': return <TrendingUp className="h-4 w-4 text-yellow-400" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-blue-400" />;
      default: return <CheckCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const nextStep = () => {
    if (currentStep < demoSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <header className="container mx-auto px-6 py-8">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-8 w-8 text-purple-400" />
            <span className="text-xl font-bold">LLM Rank Diagnostic</span>
          </div>
          <button
            onClick={() => router.push('/')}
            className="text-gray-300 hover:text-white transition-colors"
          >
            Back to Home
          </button>
        </nav>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-400">Step {currentStep + 1} of {demoSteps.length}</span>
              <span className="text-sm text-gray-400">{Math.round(((currentStep + 1) / demoSteps.length) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <motion.div
                className="bg-purple-400 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / demoSteps.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Current Step */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-8"
          >
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">{demoSteps[currentStep].image}</div>
              <h1 className="text-3xl font-bold mb-4">{demoSteps[currentStep].title}</h1>
              <p className="text-xl text-gray-300">{demoSteps[currentStep].description}</p>
            </div>

            {/* Step-specific content */}
            {currentStep === 0 && (
              <div className="text-center">
                <div className="bg-white/10 rounded-lg p-6 max-w-md mx-auto">
                  <input
                    type="url"
                    value={demoSteps[currentStep].example}
                    readOnly
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-center"
                  />
                  <button className="mt-4 px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors">
                    Analyze My Website
                  </button>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-4">
                {demoSteps[currentStep].metrics.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <span className="font-medium">{metric.name}</span>
                    <div className="flex items-center space-x-4">
                      <div className="w-32 bg-slate-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-1000 ${metric.color.replace('text-', 'bg-')}`}
                          style={{ width: `${metric.score}%` }}
                        />
                      </div>
                      <span className={`font-bold ${metric.color}`}>{metric.score}/100</span>
                    </div>
                  </div>
                ))}
                <div className="text-center mt-6">
                  <div className="text-4xl font-bold text-purple-400">Overall Score: 76/100</div>
                  <p className="text-gray-300 mt-2">Good performance with room for improvement</p>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                {demoSteps[currentStep].highlights.map((highlight, index) => (
                  <div key={index} className="p-4 bg-white/5 rounded-lg border-l-4 border-yellow-500/50">
                    <div className="flex items-center space-x-2 mb-2">
                      {getSeverityIcon(highlight.severity)}
                      <span className="font-medium capitalize">{highlight.severity} Issue</span>
                    </div>
                    <p className="text-gray-300 mb-2">{highlight.text}</p>
                    <p className="text-purple-400 text-sm">
                      <strong>Suggestion:</strong> {highlight.suggestion}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                {demoSteps[currentStep].recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-white/5 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <p className="text-gray-300">{rec}</p>
                  </div>
                ))}
                <div className="text-center mt-8">
                  <p className="text-lg text-gray-300 mb-4">
                    Ready to analyze your own website?
                  </p>
                  <button
                    onClick={() => router.push('/')}
                    className="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
                  >
                    Get Started
                  </button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              Previous
            </button>
            
            <button
              onClick={nextStep}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors flex items-center space-x-2"
            >
              <span>{currentStep === demoSteps.length - 1 ? 'Get Started' : 'Next'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
} 