server/tests/
├── integration/
│   ├── ai.test.js        # AI service integration tests
│   ├── workbook.test.js  # Workbook feature tests
│   └── database.test.js  # Database integration tests
├── unit/
│   ├── services/
│   │   ├── aiService.test.js
│   │   └── workbookService.test.js
│   └── models/
│       └── modelValidations.test.js
├── e2e/
│   └── api.test.js       # Full API endpoint tests
├── utils/
│   ├── testHelpers.js    # Shared test utilities
│   └── mockData.js       # Test data fixtures
├── jest.setup.js         # Jest configuration
└── setupTestDb.js        # Database setup for tests