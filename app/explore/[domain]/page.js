'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Eye, ArrowLeft, ArrowRight, FileText, AlertTriangle, CheckCircle, TrendingUp, Sparkles, X, ExternalLink } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';

export default function ExplorePage() {
  const [overlayData, setOverlayData] = useState(null);
  const [currentPage, setCurrentPage] = useState(null);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedHighlight, setSelectedHighlight] = useState(null);
  const [showOverlays, setShowOverlays] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);
  
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const domain = params.domain;
  const pageId = searchParams.get('page');

  useEffect(() => {
    if (domain) {
      fetchOverlayData();
    }
  }, [domain]);

  useEffect(() => {
    if (pageId && overlayData) {
      const page = overlayData.find(p => p.pageId == pageId);
      if (page) {
        setCurrentPage(page);
      }
    } else if (overlayData && overlayData.length > 0) {
      setCurrentPage(overlayData[0]);
    }
  }, [pageId, overlayData]);

  const fetchOverlayData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/overlay?domain=${encodeURIComponent(domain)}`);
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
        return;
      }
      
      setOverlayData(data);
      setPages(data);
    } catch (error) {
      console.error('Error fetching overlay data:', error);
      setError('Failed to load overlay data');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-500/20 border-red-500/50';
      case 'medium': return 'bg-yellow-500/20 border-yellow-500/50';
      case 'low': return 'bg-blue-500/20 border-blue-500/50';
      default: return 'bg-gray-500/20 border-gray-500/50';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case 'medium': return <TrendingUp className="h-4 w-4 text-yellow-400" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-blue-400" />;
      default: return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  const injectOverlays = () => {
    if (!currentPage || !currentPage.highlights) return;

    const iframe = document.getElementById('website-iframe');
    if (!iframe || !iframe.contentDocument) return;

    const doc = iframe.contentDocument;
    const body = doc.body;

    // Remove existing overlays
    doc.querySelectorAll('.llm-overlay').forEach(el => el.remove());

    // Add overlay styles
    if (!doc.getElementById('overlay-styles')) {
      const style = doc.createElement('style');
      style.id = 'overlay-styles';
      style.textContent = `
        .llm-overlay {
          position: relative;
          display: inline;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .llm-overlay.high {
          background: rgba(239, 68, 68, 0.2);
          border-bottom: 2px solid rgba(239, 68, 68, 0.6);
        }
        .llm-overlay.medium {
          background: rgba(245, 158, 11, 0.2);
          border-bottom: 2px solid rgba(245, 158, 11, 0.6);
        }
        .llm-overlay.low {
          background: rgba(59, 130, 246, 0.2);
          border-bottom: 2px solid rgba(59, 130, 246, 0.6);
        }
        .llm-overlay:hover {
          background: rgba(139, 92, 246, 0.3) !important;
          border-bottom-color: rgba(139, 92, 246, 0.8) !important;
        }
        .llm-tooltip {
          position: absolute;
          background: #1f2937;
          border: 1px solid #374151;
          border-radius: 8px;
          padding: 12px;
          max-width: 300px;
          z-index: 10000;
          box-shadow: 0 10px 25px rgba(0,0,0,0.3);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: white;
          font-size: 14px;
        }
        .llm-tooltip::before {
          content: '';
          position: absolute;
          top: -5px;
          left: 10px;
          width: 0;
          height: 0;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-bottom: 5px solid #1f2937;
        }
      `;
      doc.head.appendChild(style);
    }

    // Add overlays to text content
    currentPage.highlights.forEach((highlight, index) => {
      const walker = doc.createTreeWalker(
        body,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );

      let node;
      let currentPos = 0;
      
      while (node = walker.nextNode()) {
        const text = node.textContent;
        const textLength = text.length;
        
        if (currentPos <= highlight.start && currentPos + textLength > highlight.start) {
          const startOffset = highlight.start - currentPos;
          const endOffset = Math.min(highlight.end - currentPos, textLength);
          
          if (startOffset < endOffset) {
            const beforeText = text.substring(0, startOffset);
            const highlightedText = text.substring(startOffset, endOffset);
            const afterText = text.substring(endOffset);
            
            const span = doc.createElement('span');
            span.className = `llm-overlay ${highlight.severity}`;
            span.textContent = highlightedText;
            span.dataset.highlightIndex = index;
            
            const fragment = doc.createDocumentFragment();
            if (beforeText) fragment.appendChild(doc.createTextNode(beforeText));
            fragment.appendChild(span);
            if (afterText) fragment.appendChild(doc.createTextNode(afterText));
            
            node.parentNode.replaceChild(fragment, node);
            
            // Add click handler
            span.addEventListener('click', (e) => {
              e.preventDefault();
              setSelectedHighlight(highlight);
            });
          }
        }
        currentPos += textLength;
      }
    });
  };

  const handleIframeLoad = () => {
    setTimeout(injectOverlays, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-lg">Loading overlay data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <header className="container mx-auto px-6 py-8">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-8 w-8 text-purple-400" />
            <span className="text-xl font-bold">LLM Rank Diagnostic</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowOverlays(!showOverlays)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                showOverlays ? 'bg-purple-600' : 'bg-gray-600'
              }`}
            >
              {showOverlays ? 'Hide' : 'Show'} Overlays
            </button>
            <button
              onClick={() => router.push(`/analyze?domain=${encodeURIComponent(domain)}`)}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Analysis</span>
            </button>
          </div>
        </nav>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Pages</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {pages.map((page, index) => (
                  <button
                    key={page.pageId}
                    onClick={() => {
                      setCurrentPage(page);
                      setIframeKey(prev => prev + 1);
                      router.push(`/explore/${encodeURIComponent(domain)}?page=${page.pageId}`);
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      currentPage?.pageId === page.pageId
                        ? 'bg-purple-600/20 border border-purple-500/50'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="font-medium truncate">{page.title || 'Untitled'}</div>
                    <div className="text-sm text-gray-400 truncate">{page.url}</div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400">
                        {page.highlights?.length || 0} issues
                      </span>
                      <ArrowRight className="h-3 w-3 text-gray-400" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content - Website Viewer */}
          <div className="flex-1">
            {currentPage ? (
              <motion.div
                key={currentPage.pageId}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl overflow-hidden"
              >
                {/* Page Header */}
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold mb-2">{currentPage.title || 'Untitled Page'}</h2>
                      <p className="text-gray-400 mb-4">{currentPage.url}</p>
                    </div>
                    <a
                      href={currentPage.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>Open Original</span>
                    </a>
                  </div>
                  
                  {/* Highlight Summary */}
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <Eye className="h-5 w-5 text-purple-400" />
                      <span className="text-sm text-gray-300">
                        {currentPage.highlights?.length || 0} issues found
                      </span>
                    </div>
                    
                    {/* Severity Breakdown */}
                    {currentPage.highlights && (
                      <div className="flex items-center space-x-4">
                        {['high', 'medium', 'low'].map(severity => {
                          const count = currentPage.highlights.filter(h => h.severity === severity).length;
                          if (count === 0) return null;
                          
                          return (
                            <div key={severity} className="flex items-center space-x-1">
                              {getSeverityIcon(severity)}
                              <span className="text-xs text-gray-300">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Website iframe */}
                <div className="relative">
                  <iframe
                    id="website-iframe"
                    key={iframeKey}
                    src={currentPage.url}
                    className="w-full h-[600px] border-0"
                    onLoad={handleIframeLoad}
                    sandbox="allow-same-origin allow-scripts allow-forms"
                  />
                  
                  {/* Overlay disabled message */}
                  {!showOverlays && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="text-center">
                        <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-300">Overlays are disabled</p>
                        <button
                          onClick={() => setShowOverlays(true)}
                          className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                        >
                          Enable Overlays
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-12 text-center">
                <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Page Selected</h3>
                <p className="text-gray-300">Select a page from the sidebar to view its analysis.</p>
              </div>
            )}
          </div>

          {/* Selected Highlight Panel */}
          {selectedHighlight && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-80 flex-shrink-0"
            >
              <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Issue Details</h3>
                  <button
                    onClick={() => setSelectedHighlight(null)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    {getSeverityIcon(selectedHighlight.severity)}
                    <span className="font-medium capitalize">{selectedHighlight.severity} Issue</span>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-300 mb-2">Problem:</h4>
                    <p className="text-sm text-gray-400">{selectedHighlight.reason}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-purple-400 mb-2">Suggestion:</h4>
                    <p className="text-sm text-gray-300">{selectedHighlight.suggestion}</p>
                  </div>
                  
                  <div className="pt-4 border-t border-white/10">
                    <button
                      onClick={() => setSelectedHighlight(null)}
                      className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                    >
                      Got it
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
} 