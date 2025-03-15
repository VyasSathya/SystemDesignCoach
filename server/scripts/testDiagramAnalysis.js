const DiagramAnalyzer = require('../services/diagram/diagramAnalyzer');
const PatternRegistry = require('../services/diagram/patterns/PatternRegistry');
const logger = require('../utils/logger');

// Sample diagram for testing
const testDiagram = {
  nodes: [
    { id: 'lb1', type: 'loadbalancer', label: 'Load Balancer 1' },
    { id: 'lb2', type: 'loadbalancer', label: 'Load Balancer 2' },
    { id: 'svc1', type: 'service', label: 'API Service 1' },
    { id: 'svc2', type: 'service', label: 'API Service 2' },
    { id: 'svc3', type: 'service', label: 'API Service 3' },
    { id: 'cache1', type: 'cache', label: 'Redis Cache' },
    { id: 'db1', type: 'database', label: 'Primary DB' },
    { id: 'db2', type: 'database', label: 'Replica DB' },
    { id: 'queue1', type: 'queue', label: 'Message Queue' },
    { id: 'gateway1', type: 'gateway', label: 'API Gateway' }
  ],
  edges: [
    { id: 'e1', source: 'gateway1', target: 'lb1' },
    { id: 'e2', source: 'gateway1', target: 'lb2' },
    { id: 'e3', source: 'lb1', target: 'svc1' },
    { id: 'e4', source: 'lb1', target: 'svc2' },
    { id: 'e5', source: 'lb2', target: 'svc2' },
    { id: 'e6', source: 'lb2', target: 'svc3' },
    { id: 'e7', source: 'svc1', target: 'cache1' },
    { id: 'e8', source: 'svc2', target: 'cache1' },
    { id: 'e9', source: 'svc1', target: 'db1' },
    { id: 'e10', source: 'db1', target: 'db2' },
    { id: 'e11', source: 'svc2', target: 'queue1' },
    { id: 'e12', source: 'svc3', target: 'queue1' }
  ]
};

async function testDiagramAnalysis() {
  try {
    logger.info('Starting diagram analysis test...');

    // Initialize our analysis tools
    const analyzer = new DiagramAnalyzer();
    const patternRegistry = new PatternRegistry();

    // Test pattern detection
    logger.info('Testing pattern detection...');
    const detectedPatterns = patternRegistry.detectPatterns(testDiagram);
    logger.info('Detected patterns:', {
      patternCount: detectedPatterns.length,
      patterns: detectedPatterns.map(p => p.name)
    });

    // Test full diagram analysis
    logger.info('Testing full diagram analysis...');
    const analysis = analyzer.analyzeDiagram(
      testDiagram.nodes,
      testDiagram.edges,
      'system'
    );

    logger.info('Analysis results:', {
      patternCount: analysis.patterns.length,
      suggestionCount: analysis.suggestions.length,
      score: analysis.score,
      criticalIssues: analysis.criticalIssues.length
    });

    // Detailed results
    console.log('\n=== Detailed Analysis Results ===\n');
    console.log('Detected Patterns:');
    detectedPatterns.forEach(pattern => {
      console.log(`\n${pattern.name}:`);
      console.log(`- Quality Score: ${pattern.implementation.score}`);
      console.log(`- Optimal: ${pattern.implementation.optimal}`);
      if (pattern.implementation.missingOptimal.length > 0) {
        console.log('- Missing Optimal Features:');
        pattern.implementation.missingOptimal.forEach(missing => {
          console.log(`  * ${missing}`);
        });
      }
    });

    console.log('\nAnalysis Suggestions:');
    analysis.suggestions.forEach(suggestion => {
      console.log(`- ${suggestion}`);
    });

    if (analysis.criticalIssues.length > 0) {
      console.log('\nCritical Issues:');
      analysis.criticalIssues.forEach(issue => {
        console.log(`- ${issue}`);
      });
    }

    return {
      success: true,
      detectedPatterns,
      analysis
    };
  } catch (error) {
    logger.error('Error during diagram analysis test:', error);
    throw error;
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testDiagramAnalysis()
    .then(() => {
      logger.info('Diagram analysis test completed successfully');
      process.exit(0);
    })
    .catch(error => {
      logger.error('Diagram analysis test failed:', error);
      process.exit(1);
    });
}

module.exports = testDiagramAnalysis;