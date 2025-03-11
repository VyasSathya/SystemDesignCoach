// client/components/diagram/MermaidRenderer.js
import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

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
    setSvgContent('');
    setError(null);
    setIsRendering(true);
    
    const id = `mermaid-${Date.now()}`;
    
    const cleanup = () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
    
    const renderDiagram = async () => {
      if (!code || !containerRef.current) return;
      
      try {
        cleanup();
        const { svg } = await mermaid.render(id, code);
        setSvgContent(svg);
        setError(null);
        if (onError) {
          onError(null);
        }
      } catch (err) {
        console.error('Mermaid render error:', err);
        setError(err.message || 'Failed to render diagram');
        if (renderAttempts < 2) {
          setTimeout(() => {
            setRenderAttempts(prev => prev + 1);
            renderDiagram();
          }, 100);
        } else {
          if (onError) {
            onError(err.message || 'Failed to render diagram');
          }
        }
      } finally {
        setIsRendering(false);
      }
    };
    
    renderDiagram();
    
    return cleanup;
  }, [code, onError, renderAttempts]);
  
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700 whitespace-pre-wrap">
        <div className="font-medium mb-2">Error rendering diagram:</div>
        <div className="text-sm font-mono">{error}</div>
      </div>
    );
  }
  
  if (isRendering) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (svgContent) {
    return (
      <div 
        className="mermaid flex items-center justify-center p-4 h-full overflow-auto bg-white"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    );
  }
  
  return (
    <div className="flex items-center justify-center h-full" ref={containerRef}>
      <div className="text-gray-500">Initializing diagram...</div>
    </div>
  );
};

export default MermaidRenderer;
