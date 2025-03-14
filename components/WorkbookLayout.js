const WorkbookLayout = ({ sessionId }) => {
  const [state, setState] = useState({
    workbook: initialWorkbookState,
    progress: workbookProgress,
    activeSection: null,
    diagrams: {
      sequence: new Map(),
      system: new Map()
    }
  });

  const handleSectionUpdate = async (section, content) => {
    // Update completion and trigger coach feedback
    const sectionProgress = calculateSectionProgress(section, content);
    const coachFeedback = await getCoachFeedback(section, content);
    
    setState(prev => ({
      ...prev,
      workbook: {
        ...prev.workbook,
        sections: {
          ...prev.workbook.sections,
          [section]: {
            content,
            status: sectionProgress.status,
            feedback: coachFeedback
          }
        }
      },
      progress: updateProgress(prev.progress, section, sectionProgress)
    }));
  };

  const handleDiagramUpdate = async (type, diagram) => {
    const mermaidCode = generateMermaidCode(type, diagram);
    const coachSuggestions = await getCoachDiagramFeedback(type, diagram);
    
    setState(prev => ({
      ...prev,
      diagrams: {
        ...prev.diagrams,
        [type]: {
          ...diagram,
          mermaid: mermaidCode,
          suggestions: coachSuggestions
        }
      }
    }));
  };

  // ... rest of the component
};