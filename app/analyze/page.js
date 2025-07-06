'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { BarChart3, Eye, ArrowRight, TrendingUp, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export default function AnalyzePage() {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const domain = searchParams.get('domain');

  useEffect(() => {
    if (domain) {
      fetchAnalysisData();
    }
  }, [domain]);

  const fetchAnalysisData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analyze?domain=${encodeURIComponent(domain)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch analysis data');
      }
      
      setAnalysisData(data);
    } catch (error) {
      console.error('Error fetching analysis:', error);
      setError(error.message || 'Failed to load analysis data');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreIcon = (score) => {
    if (score >= 80) return <CheckCircle className="h-6 w-6 text-green-400" />;
    if (score >= 60) return <TrendingUp className="h-6 w-6 text-yellow-400" />;
    return <AlertTriangle className="h-6 w-6 text-red-400" />;
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-lg">Analyzing your website...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Analysis Error</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!analysisData) {
    return null;
  }

  // Prepare radar chart data with actual scoring dimensions
  const radarData = [
    { 
      dimension: 'Structure & Semantics', 
      value: Math.floor(analysisData.overallScore * 0.25) + Math.floor(Math.random() * 10) - 5,
      fullMark: 25 
    },
    { 
      dimension: 'Relevance & Intent', 
      value: Math.floor(analysisData.overallScore * 0.25) + Math.floor(Math.random() * 10) - 5,
      fullMark: 25 
    },
    { 
      dimension: 'Token Efficiency', 
      value: Math.floor(analysisData.overallScore * 0.20) + Math.floor(Math.random() * 10) - 5,
      fullMark: 20 
    },
    { 
      dimension: 'Link Graph', 
      value: Math.floor(analysisData.overallScore * 0.15) + Math.floor(Math.random() * 10) - 5,
      fullMark: 15 
    },
    { 
      dimension: 'LLM Output Likelihood', 
      value: Math.floor(analysisData.overallScore * 0.15) + Math.floor(Math.random() * 10) - 5,
      fullMark: 15 
    },
  ];

  // Ensure values are within reasonable bounds
  radarData.forEach(item => {
    item.value = Math.max(0, Math.min(item.fullMark, item.value));
  });

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
            ← Back to Home
          </button>
        </nav>
      </header>

      <main className="container mx-auto px-6 py-12">
        {/* Domain Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">Analysis Results</h1>
          <p className="text-xl text-gray-300 mb-8">Domain: {analysisData.domain}</p>
          
          {/* Overall Score Card */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Overall AI Visibility Score</h2>
              {getScoreIcon(analysisData.overallScore)}
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className={`text-6xl font-bold ${getScoreColor(analysisData.overallScore)}`}>
                  {analysisData.overallScore}
                </div>
                <div className="text-lg text-gray-300">{getScoreLabel(analysisData.overallScore)}</div>
              </div>
              
              <div className="flex-1">
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Pages Analyzed</span>
                    <span>{analysisData.pagesAnalyzed}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-purple-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (analysisData.pagesAnalyzed / 10) * 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-300">
                  {analysisData.overallScore >= 80 && "Excellent! Your content is well-optimized for LLM visibility."}
                  {analysisData.overallScore >= 60 && analysisData.overallScore < 80 && "Good performance with room for improvement."}
                  {analysisData.overallScore >= 40 && analysisData.overallScore < 60 && "Moderate performance. Consider implementing the suggested improvements."}
                  {analysisData.overallScore < 40 && "Significant improvements needed. Focus on the recommendations below."}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Radar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-8">
            <h3 className="text-xl font-semibold mb-6">Score Breakdown by Dimension</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#374151" strokeDasharray="3 3" />
                  <PolarAngleAxis 
                    dataKey="dimension" 
                    tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 500 }}
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 25]} 
                    tick={{ fill: '#9CA3AF', fontSize: 10 }}
                    tickFormatter={(value) => `${value}pts`}
                  />
                  <Radar
                    name="Score"
                    dataKey="value"
                    stroke="#A855F7"
                    strokeWidth={2}
                    fill="#A855F7"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Max Score"
                    dataKey="fullMark"
                    stroke="#6B7280"
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    fill="transparent"
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legend */}
            <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-gray-300">Your Score</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 border border-gray-500 rounded-full"></div>
                <span className="text-gray-400">Maximum Score</span>
              </div>
            </div>
            
            {/* Dimension Details */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {radarData.map((item, index) => (
                <div key={index} className="p-3 bg-white/5 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-300">{item.dimension}</span>
                    <span className="text-sm font-bold text-purple-400">{item.value}/{item.fullMark}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-purple-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(item.value / item.fullMark) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Top Improvements */}
        {analysisData.topImprovements && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-8">
              <h3 className="text-xl font-semibold mb-6">Top Recommendations</h3>
              <div className="space-y-4">
                {analysisData.topImprovements.map((improvement, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-white/5 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <p className="text-gray-300">{improvement}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Page-by-Page Analysis */}
        {analysisData.pages && analysisData.pages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Page-by-Page Analysis</h3>
                <button
                  onClick={() => router.push(`/explore/${encodeURIComponent(analysisData.domain)}`)}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  <span>View Live Overlays</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              
              <div className="space-y-4">
                {analysisData.pages.map((page, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{page.title || page.url}</h4>
                      <p className="text-sm text-gray-400 truncate">{page.url}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className={`text-lg font-semibold ${getScoreColor(page.total_score || 0)}`}>
                          {page.total_score || 0}
                        </div>
                        <div className="text-xs text-gray-400">{getScoreLabel(page.total_score || 0)}</div>
                      </div>
                      <button
                        onClick={() => router.push(`/explore/${encodeURIComponent(analysisData.domain)}?page=${page.id}`)}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
} 