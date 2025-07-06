'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Eye, ArrowLeft, ArrowRight, FileText, AlertTriangle, CheckCircle, TrendingUp, Sparkles, X, ExternalLink, ChevronDown, ChevronRight, MapPin } from 'lucide-react';
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
  const [showAllIssues, setShowAllIssues] = useState(false);
  
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
    if (!currentPage || !currentPage.highlights || !showOverlays) return;

    const iframe = document.getElementById('website-iframe');
    if (!iframe || !iframe.contentDocument) return;

    const doc = iframe.contentDocument;
    const body = doc.body;

    // Remove existing overlays
    doc.querySelectorAll('.llm-overlay').forEach(el => el.remove());

    // Add enhanced overlay styles
    if (!doc.getElementById('overlay-styles')) {
      const style = doc.createElement('style');
      style.id = 'overlay-styles';
      style.textContent = `
        .llm-overlay {
          position: relative;
          display: inline;
          cursor: pointer;
          transition: all 0.2s ease;
          border-radius: 2px;
          padding: 1px 2px;
        }
        .llm-overlay.high {
          background: rgba(239, 68, 68, 0.25);
          border: 2px solid rgba(239, 68, 68, 0.7);
          box-shadow: 0 0 8px rgba(239, 68, 68, 0.3);
        }
        .llm-overlay.medium {
          background: rgba(245, 158, 11, 0.25);
          border: 2px solid rgba(245, 158, 11, 0.7);
          box-shadow: 0 0 8px rgba(245, 158, 11, 0.3);
        }
        .llm-overlay.low {
          background: rgba(59, 130, 246, 0.25);
          border: 2px solid rgba(59, 130, 246, 0.7);
          box-shadow: 0 0 8px rgba(59, 130, 246, 0.3);
        }
        .llm-overlay:hover {
          background: rgba(139, 92, 246, 0.4) !important;
          border-color: rgba(139, 92, 246, 0.9) !important;
          box-shadow: 0 0 12px rgba(139, 92, 246, 0.5) !important;
          transform: scale(1.02);
        }
        .llm-overlay::after {
          content: '🔍';
          position: absolute;
          top: -8px;
          right: -8px;
          background: rgba(0, 0, 0, 0.8);
          border-radius: 50%;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 8px;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .llm-overlay:hover::after {
          opacity: 1;
        }
        .llm-element-highlight {
          position: relative;
          border: 3px dashed;
          border-radius: 4px;
          padding: 4px;
          margin: 2px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .llm-element-highlight.high {
          border-color: rgba(239, 68, 68, 0.8);
          background: rgba(239, 68, 68, 0.1);
        }
        .llm-element-highlight.medium {
          border-color: rgba(245, 158, 11, 0.8);
          background: rgba(245, 158, 11, 0.1);
        }
        .llm-element-highlight.low {
          border-color: rgba(59, 130, 246, 0.8);
          background: rgba(59, 130, 246, 0.1);
        }
        .llm-element-highlight:hover {
          border-color: rgba(139, 92, 246, 0.9);
          background: rgba(139, 92, 246, 0.2);
          transform: scale(1.01);
        }
        .llm-element-highlight::before {
          content: '⚠️';
          position: absolute;
          top: -10px;
          left: -10px;
          background: rgba(0, 0, 0, 0.9);
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          z-index: 10;
        }
        .llm-focus-highlight {
          animation: pulse-focus 2s infinite;
          box-shadow: 0 0 20px rgba(139, 92, 246, 0.8) !important;
          border-color: rgba(139, 92, 246, 1) !important;
          background: rgba(139, 92, 246, 0.3) !important;
        }
        @keyframes pulse-focus {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
      `;
      doc.head.appendChild(style);
    }

    // Add overlays to elements and text content
    currentPage.highlights.forEach((highlight, index) => {
      // Try to find elements by selector first
      if (highlight.element_selector) {
        const elements = doc.querySelectorAll(highlight.element_selector);
        elements.forEach((element, elementIndex) => {
          // Add highlight class to the element
          element.classList.add('llm-element-highlight', highlight.severity);
          element.dataset.highlightIndex = index;
          element.dataset.elementIndex = elementIndex;
          
          // Add click handler
          element.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            setSelectedHighlight(highlight);
          });
        });
      }

      // Also add text-based overlays for better coverage
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

  const highlightSpecificIssue = (highlight) => {
    const iframe = document.getElementById('website-iframe');
    if (!iframe || !iframe.contentDocument) return;

    const doc = iframe.contentDocument;
    
    // Remove any existing focus highlights
    doc.querySelectorAll('.llm-focus-highlight').forEach(el => {
      el.classList.remove('llm-focus-highlight');
    });

    // Add focus highlight to the specific element
    if (highlight.element_selector) {
      const elements = doc.querySelectorAll(highlight.element_selector);
      elements.forEach(element => {
        element.classList.add('llm-focus-highlight');
        // Scroll the element into view within the iframe
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }
  };

  const handleShowAllIssues = () => {
    setShowAllIssues(!showAllIssues);
    setSelectedHighlight(null); // Close individual highlight panel
  };

  const handleIssueClick = (highlight) => {
    setSelectedHighlight(highlight);
    setShowAllIssues(false); // Close all issues panel
    // Highlight the specific issue on the website
    setTimeout(() => highlightSpecificIssue(highlight), 100);
    // Scroll to the iframe to show the highlight
    document.getElementById('website-iframe')?.scrollIntoView({ behavior: 'smooth' });
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
                    <button
                      onClick={handleShowAllIssues}
                      className="flex items-center space-x-2 hover:bg-white/5 p-2 rounded-lg transition-colors cursor-pointer"
                    >
                      <Eye className="h-5 w-5 text-purple-400" />
                      <span className="text-sm text-gray-300 hover:text-purple-300 transition-colors">
                        {currentPage.highlights?.length || 0} issues found
                      </span>
                    </button>
                    
                    {/* Severity Breakdown */}
                    {currentPage.highlights && (
                      <div className="flex items-center space-x-4">
                        {['high', 'medium', 'low'].map(severity => {
                          const count = currentPage.highlights.filter(h => h.severity === severity).length;
                          if (count === 0) return null;
                          
                          return (
                            <button
                              key={severity}
                              onClick={() => {
                                // Find the first highlight of this severity and select it
                                const firstHighlight = currentPage.highlights.find(h => h.severity === severity);
                                if (firstHighlight) {
                                  handleIssueClick(firstHighlight);
                                }
                              }}
                              className="flex items-center space-x-1 hover:bg-white/5 p-2 rounded-lg transition-colors cursor-pointer"
                            >
                              {getSeverityIcon(severity)}
                              <span className="text-xs text-gray-300 hover:text-purple-300 transition-colors">{count}</span>
                            </button>
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

          {/* Right Sidebar - All Issues or Single Issue */}
          {(showAllIssues || selectedHighlight) && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-80 flex-shrink-0"
            >
              <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6 h-[600px] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    {showAllIssues ? `All Issues (${currentPage?.highlights?.length || 0})` : 'Issue Details'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowAllIssues(false);
                      setSelectedHighlight(null);
                    }}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                  {showAllIssues ? (
                    /* All Issues List */
                    <div className="space-y-3">
                      {currentPage?.highlights?.map((highlight, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`p-4 rounded-lg border cursor-pointer transition-all hover:bg-white/5 ${
                            getSeverityColor(highlight.severity)
                          }`}
                          onClick={() => handleIssueClick(highlight)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              {getSeverityIcon(highlight.severity)}
                              <span className="font-medium text-sm capitalize">
                                {highlight.severity} Issue
                              </span>
                            </div>
                            <MapPin className="h-4 w-4 text-gray-400" />
                          </div>
                          
                          <div className="mb-2">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">
                              {highlight.category}
                            </span>
                          </div>
                          
                          <div className="text-sm text-gray-300 mb-2 line-clamp-2">
                            {highlight.reason}
                          </div>
                          
                          <div className="text-xs text-gray-400 line-clamp-1">
                            {highlight.suggestion}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    /* Single Issue Details */
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        {getSeverityIcon(selectedHighlight.severity)}
                        <span className="font-medium capitalize">{selectedHighlight.severity} Issue</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">
                          {selectedHighlight.category}
                        </span>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-300 mb-2">Problem:</h4>
                        <p className="text-sm text-gray-400">{selectedHighlight.reason}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-purple-400 mb-2">Suggestion:</h4>
                        <p className="text-sm text-gray-300">{selectedHighlight.suggestion}</p>
                      </div>
                      
                      {selectedHighlight.improvement && (
                        <div>
                          <h4 className="font-medium text-green-400 mb-2">How to Fix:</h4>
                          <p className="text-sm text-gray-300">{selectedHighlight.improvement}</p>
                        </div>
                      )}
                      
                      {selectedHighlight.code_example && (
                        <div>
                          <h4 className="font-medium text-blue-400 mb-2">Code Example:</h4>
                          <div className="bg-gray-800 rounded-lg p-3">
                            <pre className="text-xs text-gray-300 overflow-x-auto">
                              <code>{selectedHighlight.code_example}</code>
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer */}
                {!showAllIssues && (
                  <div className="pt-4 border-t border-white/10 mt-4">
                    <button
                      onClick={() => setSelectedHighlight(null)}
                      className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                    >
                      Got it
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
} 