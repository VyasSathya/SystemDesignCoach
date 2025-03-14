const skillsFramework = {
  technical: {
    requirements_engineering: {
      weight: 0.15,
      completion_criteria: {
        functional: 0.3,
        nonFunctional: 0.3,
        constraints: 0.2,
        capacity: 0.2
      },
      subskills: [
        'requirement_gathering',
        'constraint_analysis',
        'capacity_planning',
        'edge_case_identification'
      ],
      levels: {
        1: 'Basic requirements listing only',
        2: 'Functional and non-functional separation',
        3: 'Comprehensive with constraints',
        4: 'Detailed capacity planning',
        5: 'Expert-level analysis with edge cases'
      },
      evaluation_points: {
        clarity: 'Requirements are clearly stated and unambiguous',
        completeness: 'All necessary requirements are captured',
        feasibility: 'Requirements are technically feasible',
        testability: 'Requirements can be verified and tested'
      }
    },
    api_design: {
      weight: 0.15,
      completion_criteria: {
        endpoints: 0.3,
        schemas: 0.3,
        security: 0.2,
        documentation: 0.2
      },
      subskills: [
        'rest_principles',
        'authentication_authorization',
        'api_versioning',
        'error_handling'
      ],
      levels: {
        1: 'Basic CRUD endpoints',
        2: 'RESTful design with documentation',
        3: 'Security and rate limiting',
        4: 'Advanced patterns and versioning',
        5: 'Comprehensive API ecosystem design'
      },
      evaluation_points: {
        restfulness: 'Follows REST principles correctly',
        security: 'Implements proper security measures',
        documentation: 'Clear and complete API documentation',
        consistency: 'Consistent naming and response patterns'
      }
    },
    data_modeling: {
      weight: 0.2,
      completion_criteria: {
        schema: 0.4,
        relationships: 0.3,
        optimization: 0.3
      },
      subskills: [
        'schema_design',
        'relationship_modeling',
        'indexing_strategy',
        'partition_planning'
      ],
      levels: {
        1: 'Basic table structure',
        2: 'Proper relationships defined',
        3: 'Normalized with indexes',
        4: 'Optimized for access patterns',
        5: 'Advanced partitioning and scaling'
      },
      evaluation_points: {
        normalization: 'Appropriate level of normalization',
        relationships: 'Correct relationship definitions',
        performance: 'Optimized for query performance',
        scalability: 'Designed for future scaling'
      }
    },
    system_architecture: {
      weight: 0.25,
      completion_criteria: {
        components: 0.3,
        interactions: 0.3,
        scalability: 0.2,
        reliability: 0.2
      },
      subskills: [
        'component_design',
        'service_communication',
        'fault_tolerance',
        'performance_optimization'
      ],
      levels: {
        1: 'Basic component identification',
        2: 'Clear component interactions',
        3: 'Scalability considerations',
        4: 'Advanced patterns and tradeoffs',
        5: 'Comprehensive distributed system design'
      },
      evaluation_points: {
        separation: 'Clear separation of concerns',
        coupling: 'Appropriate level of coupling',
        resilience: 'System fault tolerance',
        scalability: 'Ability to scale components'
      }
    },
    scalability_design: {
    
      weight: 0.15,
      completion_criteria: {
        bottlenecks: 0.3,
        solutions: 0.3,
        tradeoffs: 0.2,
        metrics: 0.2
      },
      subskills: [
        'load_balancing',
        'caching_strategy',
        'database_scaling',
        'performance_monitoring'
      ],
      levels: {
        1: 'Basic bottleneck identification',
        2: 'Common scaling solutions',
        3: 'Detailed capacity planning',
        4: 'Advanced optimization strategies',
        5: 'Expert-level distributed scaling'
      },
      evaluation_points: {
        bottlenecks: 'Identification of system bottlenecks',
        solutions: 'Appropriate scaling solutions',
        monitoring: 'Performance monitoring strategy',
        cost: 'Cost-effectiveness of solutions'
      }
    }
  },
  soft: {
    communication: {
      weight: 0.1,
      completion_criteria: {
        clarity: 0.4,
        structure: 0.3,
        terminology: 0.3
      },
      subskills: [
        'technical_explanation',
        'diagram_communication',
        'tradeoff_discussion',
        'requirement_clarification'
      ],
      levels: {
        1: 'Basic technical vocabulary',
        2: 'Clear explanation of concepts',
        3: 'Effective tradeoff discussion',
        4: 'Excellent diagram communication',
        5: 'Expert system presentation'
      },
      evaluation_points: {
        clarity: 'Clear and concise communication',
        audience: 'Appropriate for technical audience',
        completeness: 'All key points covered',
        engagement: 'Maintains audience engagement'
      }
    },
    problem_solving: {
      weight: 0.1,
      completion_criteria: {
        approach: 0.4,
        adaptability: 0.3,
        reasoning: 0.3
      },
      subskills: [
        'problem_breakdown',
        'solution_analysis',
        'tradeoff_evaluation',
        'edge_case_handling'
      ],
      levels: {
        1: 'Basic problem breakdown',
        2: 'Structured approach',
        3: 'Effective tradeoff analysis',
        4: 'Creative solution finding',
        5: 'Expert problem optimization'
      },
      evaluation_points: {
        methodology: 'Structured problem-solving approach',
        creativity: 'Creative solution generation',
        practicality: 'Practical and implementable solutions',
        completeness: 'Comprehensive problem coverage'
      }
    }
  }
};

// Enhanced utility functions
module.exports = {
  skillsFramework,
  
  calculateSkillLevel: (skill, metrics) => {
    const criteria = skillsFramework[skill.category][skill.name].completion_criteria;
    const weightedScore = Object.entries(criteria).reduce((total, [key, weight]) => {
      return total + (metrics[key] || 0) * weight;
    }, 0);
    
    // Return both raw score and level
    return {
      score: weightedScore,
      level: Math.min(5, Math.ceil(weightedScore * 5))
    };
  },

  getSkillFeedback: (skill, metrics) => {
    const skillInfo = skillsFramework[skill.category][skill.name];
    const { score, level } = module.exports.calculateSkillLevel(skill, metrics);
    
    return {
      currentLevel: skillInfo.levels[level],
      nextLevel: level < 5 ? skillInfo.levels[level + 1] : null,
      gap: 1 - (score % 1),
      strengths: Object.entries(metrics)
        .filter(([_, value]) => value >= 0.8)
        .map(([key]) => skillInfo.evaluation_points[key]),
      improvements: Object.entries(metrics)
        .filter(([_, value]) => value < 0.6)
        .map(([key]) => skillInfo.evaluation_points[key])
    };
  },

  evaluateSkillProgress: (skill, previousMetrics, currentMetrics) => {
    const previous = module.exports.calculateSkillLevel(skill, previousMetrics);
    const current = module.exports.calculateSkillLevel(skill, currentMetrics);
    
    return {
      improvement: current.score - previous.score,
      levelChange: current.level - previous.level,
      significantAreas: Object.keys(currentMetrics).filter(key => 
        (currentMetrics[key] - (previousMetrics[key] || 0)) > 0.2
      )
    };
  },

  getSkillRequirements: (skill, targetLevel) => {
    const skillInfo = skillsFramework[skill.category][skill.name];
    return {
      required: skillInfo.subskills.slice(0, targetLevel * 2),
      recommended: skillInfo.subskills.slice(targetLevel * 2),
      evaluationCriteria: Object.entries(skillInfo.evaluation_points)
        .reduce((acc, [key, value]) => {
          acc[key] = {
            description: value,
            minimumScore: targetLevel / 5
          };
          return acc;
        }, {})
    };
  }
};
