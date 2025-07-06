'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Zap, BarChart3, Eye, ArrowRight, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!url) {
      setError('Please enter a website URL');
      return;
    }

    // Clear any previous errors
    setError('');
    setIsAnalyzing(true);
    
    try {
      // Clean up the URL input
      let cleanUrl = url.trim();
      
      // Add protocol if missing
      if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        cleanUrl = 'https://' + cleanUrl;
      }

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: cleanUrl }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      // Navigate to results page
      router.push(`/analyze?domain=${encodeURIComponent(data.domain)}`);
    } catch (error) {
      console.error('Analysis error:', error);
      setError(error.message || 'Failed to analyze website. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUrlChange = (e) => {
    setUrl(e.target.value);
    // Clear error when user starts typing
    if (error) {
      setError('');
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
          <div className="flex items-center space-x-6">
            <a href="#how-it-works" className="hover:text-purple-400 transition-colors">How It Works</a>
            <a href="#faq" className="hover:text-purple-400 transition-colors">FAQ</a>
            <a href="#contact" className="hover:text-purple-400 transition-colors">Contact</a>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI Visibility Engine
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed">
              Optimize your website content for LLM ranking and AI visibility. 
              Get comprehensive analysis with page-by-page suggestions.
            </p>
          </motion.div>

          {/* URL Input Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            <form onSubmit={handleAnalyze} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={url}
                  onChange={handleUrlChange}
                  placeholder="Enter your website URL (e.g., example.com or https://example.com)"
                  className={`w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-colors ${
                    error ? 'border-red-400' : 'border-white/20'
                  }`}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isAnalyzing}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5" />
                    <span>Analyze My Website</span>
                  </>
                )}
              </button>
            </form>
            
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* URL Examples */}
            <div className="mt-6 text-sm text-gray-400">
              <p>Try these examples:</p>
              <div className="flex flex-wrap justify-center gap-4 mt-2">
                <button
                  onClick={() => setUrl('descript.com')}
                  className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                >
                  descript.com
                </button>
                <button
                  onClick={() => setUrl('https://www.descript.com')}
                  className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                >
                  https://www.descript.com
                </button>
                <button
                  onClick={() => setUrl('example.com')}
                  className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                >
                  example.com
                </button>
              </div>
            </div>
          </motion.div>

          {/* Demo Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="mt-16 relative"
          >
            <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6 max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-sm text-gray-400">Demo: AI Visibility Analysis</span>
              </div>
              
              <div className="bg-slate-800 rounded-lg p-4 text-left">
                <div className="space-y-3">
                  <div className="h-4 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded animate-pulse"></div>
                  <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                  <div className="h-4 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded animate-pulse"></div>
                  <div className="h-4 bg-slate-700 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center p-6 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl"
          >
            <BarChart3 className="h-12 w-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-3">Comprehensive Scoring</h3>
            <p className="text-gray-300">
              Get detailed AI visibility scores across 5 key dimensions with actionable insights.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center p-6 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl"
          >
            <Eye className="h-12 w-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-3">Visual Overlays</h3>
            <p className="text-gray-300">
              See exactly where to improve with Grammarly-style highlights and suggestions.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center p-6 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl"
          >
            <Zap className="h-12 w-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-3">LLM Optimization</h3>
            <p className="text-gray-300">
              Optimize your content specifically for AI ranking and LLM inclusion.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12 border-t border-white/10">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Sparkles className="h-6 w-6 text-purple-400" />
            <span className="font-semibold">LLM Rank Diagnostic</span>
          </div>
          <div className="flex space-x-6 text-sm text-gray-400">
            <a href="#privacy" className="hover:text-white transition-colors">Privacy</a>
            <a href="#terms" className="hover:text-white transition-colors">Terms</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
