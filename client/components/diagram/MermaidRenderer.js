// client/components/diagram/MermaidRenderer.js
import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

// Initialize mermaid with default configuration
mermaid.initialize({
  startOnLoad: true,
  theme: 'neutral',
  securityLevel: 'loose',
  flowchart: {
    useMaxWidth: false,
    htmlLabels: true,
    curve: 'linear'
  },
  fontFamily: 'ui-sans-serif, system-ui, sans-serif',
});

const MermaidRenderer = ({ code, onError }) => {
  const containerRef = useRef(null);
  const [svgContent, setSvgContent] = useState('');
  const [isRendering, setIsRendering] = useState(true);
  const [error, setError] = useState(null);
  const [renderAttempts, setRenderAttempts] = useState(0);
  
  useEffect(() => {
    // Reset state when code changes
    setSvgContent('');
    setError(null);
    setIsRendering(true);
    
    // Generate a unique ID for this render
    const id = `mermaid-${Date.now()}`;
    
    // Cleanup function
    const cleanup = () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
    
    // Setup render function
    const renderDiagram = async () => {
      if (!code || !containerRef.current) return;
      
      try {
        // Remove any existing SVG
        cleanup();
        
        // Generate SVG
        const { svg } = await mermaid.render(id, code);
        
        // Set SVG content
        setSvgContent(svg);
        setError(null);
        
        // Clear any previous error
        if (onError) {
          onError(null);
        }
      } catch (err) {
        console.error('Mermaid render error:', err);
        setError(err.message || 'Failed to render diagram');
        
        // Check if we should retry (sometimes Mermaid needs a second attempt)
        if (renderAttempts < 2) {
          setTimeout(() => {
            setRenderAttempts(prev => prev + 1);
            renderDiagram();
          }, 100);
        } else {
          // Report error to parent if callback provided
          if (onError) {
            onError(err.message || 'Failed to render diagram');
          }
        }
      } finally {
        setIsRendering(false);
      }
    };
    
    // Render the diagram
    renderDiagram();
    
    return cleanup;
  }, [code, onError, renderAttempts]);
  
  // If there's an error, display it
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700 whitespace-pre-wrap">
        <div className="font-medium mb-2">Error rendering diagram:</div>
        <div className="text-sm font-mono">{error}</div>
      </div>
    );
  }
  
  // If we're still rendering, show loading state
  if (isRendering) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // If we have SVG content, display it
  if (svgContent) {
    return (
      <div 
        className="mermaid flex items-center justify-center p-4 h-full overflow-auto bg-white"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    );
  }
  
  // Fallback for cases where we're not rendering but don't have content or error yet
  return (
    <div className="flex items-center justify-center h-full" ref={containerRef}>
      <div className="text-gray-500">Initializing diagram...</div>
    </div>
  );
};

export default MermaidRenderer;