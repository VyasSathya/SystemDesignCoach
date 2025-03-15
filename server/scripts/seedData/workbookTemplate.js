const workbookTemplate = {
  sections: {
    requirements: {
      functional: {
        template: true,
        content: '',
        maxPages: 5
      },
      nonFunctional: {
        template: true,
        content: '',
        maxPages: 5
      }
    },
    api: {
      endpoints: {
        template: true,
        content: '',
        maxPages: 5
      }
    },
    database: {
      schema: {
        template: true,
        content: '',
        maxPages: 5
      }
    },
    architecture: {
      highLevel: {
        template: true,
        content: '',
        maxPages: 5
      },
      detailed: {
        template: true,
        content: '',
        maxPages: 5
      }
    },
    diagrams: {
      sequence: [],
      component: [],
      deployment: []
    }
  },
  metadata: {
    version: '1.0.0',
    lastUpdated: new Date(),
    created: new Date()
  }
};

module.exports = workbookTemplate;