// client/components/diagram/MermaidRenderer.js
import React, { useEffect, useRef } from 'react';

const MermaidRenderer = ({ code, onError }) => {
  const mermaidRef = useRef(null);

  useEffect(() => {
    if (!window.mermaid) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.min.js';
      script.async = true;
      script.onload = renderDiagram;
      document.body.appendChild(script);
    } else {
      renderDiagram();
    }
  }, [code]);

  const renderDiagram = async () => {
    if (!mermaidRef.current || !window.mermaid) return;
    
    try {
      // Initialize mermaid if not already done
      if (!window.mermaid.initialized) {
        window.mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
          flowchart: { 
            useMaxWidth: true,
            htmlLabels: true,
            curve: 'basis'
          }
        });
      }
      
      // Clear previous content
      mermaidRef.current.innerHTML = code;
      mermaidRef.current.removeAttribute('data-processed');
      
      // Render new diagram
      await window.mermaid.run({
        nodes: [mermaidRef.current]
      });
    } catch (err) {
      console.error('Mermaid rendering error:', err);
      if (onError) {
        onError(err.message || 'Failed to render diagram');
      }
    }
  };

  return (
    <div className="mermaid-renderer w-full h-full overflow-auto">
      <div ref={mermaidRef} className="mermaid">
        {code}
      </div>
    </div>
  );
};

export default MermaidRenderer;