// server/services/utils/diagramUtils.js

/**
 * Determine which type of diagram to generate based on the current stage
 * @param {Number} currentStage - Current design stage
 * @returns {String} - Diagram type (architecture, er, sequence)
 */
function getDiagramTypeForStage(currentStage) {
    const stageToType = {
      0: null, // Requirements - no diagram
      1: null, // Scale estimation - no diagram
      2: 'api', // API design - API diagram
      3: 'er', // Data model - ER diagram
      4: 'architecture', // System architecture
      5: 'architecture' // Optimization - enhanced architecture
    };
    
    return stageToType[currentStage] || 'architecture';
  }
  
  /**
   * Generate an SVG diagram based on extracted entities
   * @param {Object} entities - Extracted components and relationships
   * @param {String} diagramType - Type of diagram to generate
   * @param {String} title - Diagram title
   * @returns {String} - SVG markup
   */
  function generateSvgDiagram(entities, diagramType, title) {
    if (diagramType === 'er') {
      return generateErDiagram(entities, title);
    } else if (diagramType === 'api') {
      return generateApiDiagram(entities, title);
    } else {
      return generateArchitectureDiagram(entities, title);
    }
  }
  
  /**
   * Generate an architecture diagram as SVG
   * @param {Object} entities - Extracted components and relationships
   * @param {String} title - Diagram title
   * @returns {String} - SVG markup
   */
  function generateArchitectureDiagram(entities, title) {
    const svgWidth = 800;
    const svgHeight = 600;
    
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" width="100%" height="100%">
      <!-- Background -->
      <rect width="${svgWidth}" height="${svgHeight}" fill="#f8f9fa" rx="10" ry="10"/>
      
      <!-- Title -->
      <text x="${svgWidth/2}" y="40" font-family="Arial" font-size="24" font-weight="bold" text-anchor="middle" fill="#333">${title}</text>
      <text x="${svgWidth/2}" y="65" font-family="Arial" font-size="14" text-anchor="middle" fill="#666">System Architecture</text>
      
      <!-- Layers -->
      <rect x="50" y="100" width="${svgWidth-100}" height="80" fill="#e3f2fd" stroke="#2196f3" stroke-width="2" rx="5" ry="5" opacity="0.5"/>
      <text x="${svgWidth/2}" y="125" font-family="Arial" font-size="16" font-weight="bold" text-anchor="middle" fill="#0d47a1">Client Layer</text>
      
      <rect x="50" y="200" width="${svgWidth-100}" height="80" fill="#e8f5e9" stroke="#4caf50" stroke-width="2" rx="5" ry="5" opacity="0.5"/>
      <text x="${svgWidth/2}" y="225" font-family="Arial" font-size="16" font-weight="bold" text-anchor="middle" fill="#1b5e20">API Layer</text>
      
      <rect x="50" y="300" width="${svgWidth-100}" height="80" fill="#fff3e0" stroke="#ff9800" stroke-width="2" rx="5" ry="5" opacity="0.5"/>
      <text x="${svgWidth/2}" y="325" font-family="Arial" font-size="16" font-weight="bold" text-anchor="middle" fill="#e65100">Service Layer</text>
      
      <rect x="50" y="400" width="${svgWidth-100}" height="80" fill="#e0f7fa" stroke="#00bcd4" stroke-width="2" rx="5" ry="5" opacity="0.5"/>
      <text x="${svgWidth/2}" y="425" font-family="Arial" font-size="16" font-weight="bold" text-anchor="middle" fill="#006064">Data Layer</text>
    `;
    
    // Add clients to client layer
    const clients = entities.clients.length > 0 ? entities.clients : [{ name: 'Client Application', type: 'client' }];
    const clientWidth = Math.min(120, (svgWidth - 150) / clients.length);
    clients.forEach((client, index) => {
      const x = 100 + index * (clientWidth + 30);
      svg += `
        <rect x="${x}" y="115" width="${clientWidth}" height="50" fill="#bbdefb" stroke="#1976d2" stroke-width="2" rx="5" ry="5"/>
        <text x="${x + clientWidth/2}" y="145" font-family="Arial" font-size="14" text-anchor="middle" fill="#0d47a1">${client.name}</text>
      `;
    });
    
    // Add load balancer if present
    if (entities.components.some(c => c.type.includes('load balancer'))) {
      svg += `
        <path d="M370,215 L440,215 L470,245 L440,275 L370,275 L340,245 Z" fill="#c8e6c9" stroke="#388e3c" stroke-width="2"/>
        <text x="405" y="250" font-family="Arial" font-size="14" text-anchor="middle" fill="#1b5e20">Load Balancer</text>
      `;
    }
    
    // Add services to service layer
    const services = entities.services.length > 0 ? entities.services : [{ name: 'API Service', type: 'service' }];
    const serviceWidth = Math.min(120, (svgWidth - 150) / services.length);
    services.forEach((service, index) => {
      const x = 100 + index * (serviceWidth + 30);
      svg += `
        <rect x="${x}" y="315" width="${serviceWidth}" height="50" fill="#ffe0b2" stroke="#f57c00" stroke-width="2" rx="5" ry="5"/>
        <text x="${x + serviceWidth/2}" y="345" font-family="Arial" font-size="14" text-anchor="middle" fill="#e65100">${service.name}</text>
      `;
    });
    
    // Add databases to data layer
    const databases = entities.databases.length > 0 ? entities.databases : [{ name: 'Database', type: 'database' }];
    databases.forEach((db, index) => {
      const x = 150 + index * 200;
      svg += `
        <path d="M${x-60},430 L${x+60},430 L${x+60},450 C${x+60},470 ${x},485 ${x-60},485 L${x-60},430 Z" fill="#b2ebf2" stroke="#0097a7" stroke-width="2"/>
        <ellipse cx="${x}" cy="430" rx="60" ry="15" fill="#b2ebf2" stroke="#0097a7" stroke-width="2"/>
        <text x="${x}" y="460" font-family="Arial" font-size="14" font-weight="bold" text-anchor="middle" fill="#006064">${db.name}</text>
      `;
    });
    
    // Add cache if present
    if (entities.components.some(c => c.type.includes('cache'))) {
      svg += `
        <rect x="600" y="430" width="120" height="50" fill="#b2ebf2" stroke="#0097a7" stroke-width="2" rx="5" ry="5"/>
        <text x="660" y="460" font-family="Arial" font-size="14" font-weight="bold" text-anchor="middle" fill="#006064">Cache</text>
      `;
    }
    
    // Add connections between layers
    svg += `
      <!-- Client to API connections -->
      <line x1="160" y1="165" x2="160" y2="215" stroke="#757575" stroke-width="2" stroke-dasharray="5,5"/>
      <line x1="400" y1="165" x2="400" y2="215" stroke="#757575" stroke-width="2" stroke-dasharray="5,5"/>
      
      <!-- API to Service connections -->
      <line x1="160" y1="275" x2="160" y2="315" stroke="#757575" stroke-width="2"/>
      <line x1="400" y1="275" x2="400" y2="315" stroke="#757575" stroke-width="2"/>
      
      <!-- Service to Database connections -->
      <line x1="160" y1="365" x2="160" y2="430" stroke="#757575" stroke-width="2"/>
      <line x1="400" y1="365" x2="400" y2="430" stroke="#757575" stroke-width="2"/>
    `;
    
    svg += `</svg>`;
    return svg;
  }
  
  /**
   * Generate an ER diagram as SVG for data model
   * @param {Object} entities - Extracted entities and attributes
   * @param {String} title - Diagram title
   * @returns {String} - SVG markup
   */
  function generateErDiagram(entities, title) {
    const svgWidth = 800;
    const svgHeight = 600;
    
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" width="100%" height="100%">
      <!-- Background -->
      <rect width="${svgWidth}" height="${svgHeight}" fill="#f8f9fa" rx="10" ry="10"/>
      
      <!-- Title -->
      <text x="${svgWidth/2}" y="40" font-family="Arial" font-size="24" font-weight="bold" text-anchor="middle" fill="#333">${title}</text>
      <text x="${svgWidth/2}" y="65" font-family="Arial" font-size="14" text-anchor="middle" fill="#666">Entity Relationship Diagram</text>
    `;
    
    // Use databases or create default entities if none exist
    const dbEntities = entities.databases.length > 0 ? 
      entities.databases : 
      [
        { name: 'User', type: 'entity', attributes: ['id', 'name', 'email'] },
        { name: 'Profile', type: 'entity', attributes: ['id', 'user_id', 'bio'] }
      ];
    
    // Add entities to the diagram
    dbEntities.forEach((entity, index) => {
      const x = 150 + (index % 3) * 250;
      const y = 150 + Math.floor(index / 3) * 200;
      
      // Add attributes if they exist or create defaults
      const attributes = entity.attributes || ['id', 'created_at', 'updated_at'];
      
      // Entity header
      svg += `
        <rect x="${x-100}" y="${y}" width="200" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="2" rx="5" ry="5"/>
        <text x="${x}" y="${y+25}" font-family="Arial" font-size="16" font-weight="bold" text-anchor="middle" fill="#0d47a1">${entity.name}</text>
        
        <!-- Entity attributes -->
        <rect x="${x-100}" y="${y+40}" width="200" height="${attributes.length * 25}" fill="#f5f5f5" stroke="#1976d2" stroke-width="2" rx="0" ry="0"/>
      `;
      
      // Add each attribute
      attributes.forEach((attr, attrIndex) => {
        svg += `
          <text x="${x-90}" y="${y+65+attrIndex*25}" font-family="Arial" font-size="14" text-anchor="start" fill="#333">${attr}</text>
        `;
      });
      
      // Add relationships if there are multiple entities
      if (index > 0 && index < dbEntities.length) {
        const prevX = 150 + ((index-1) % 3) * 250;
        const prevY = 150 + Math.floor((index-1) / 3) * 200;
        
        // Only connect horizontally adjacent entities
        if (Math.floor(index / 3) === Math.floor((index-1) / 3)) {
          svg += `
            <line x1="${prevX+100}" y1="${prevY+60}" x2="${x-100}" y2="${y+60}" stroke="#757575" stroke-width="2" marker-end="url(#arrowhead)"/>
          `;
        }
      }
    });
    
    // Add arrow marker
    svg += `
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#757575" />
        </marker>
      </defs>
    `;
    
    svg += `</svg>`;
    return svg;
  }
  
  /**
   * Generate an API diagram as SVG
   * @param {Object} entities - Extracted entities
   * @param {String} title - Diagram title
   * @returns {String} - SVG markup
   */
  function generateApiDiagram(entities, title) {
    const svgWidth = 800;
    const svgHeight = 600;
    
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" width="100%" height="100%">
      <!-- Background -->
      <rect width="${svgWidth}" height="${svgHeight}" fill="#f8f9fa" rx="10" ry="10"/>
      
      <!-- Title -->
      <text x="${svgWidth/2}" y="40" font-family="Arial" font-size="24" font-weight="bold" text-anchor="middle" fill="#333">${title}</text>
      <text x="${svgWidth/2}" y="65" font-family="Arial" font-size="14" text-anchor="middle" fill="#666">API Design</text>
      
      <!-- API Endpoints Box -->
      <rect x="50" y="100" width="${svgWidth-100}" height="${svgHeight-150}" fill="#ffffff" stroke="#2196f3" stroke-width="2" rx="5" ry="5"/>
      <text x="${svgWidth/2}" y="130" font-family="Arial" font-size="18" font-weight="bold" text-anchor="middle" fill="#0d47a1">API Endpoints</text>
    `;
    
    // Create default API endpoints based on the problem domain
    const endpoints = [
      { method: 'GET', path: '/api/resource', description: 'Get all resources' },
      { method: 'GET', path: '/api/resource/{id}', description: 'Get resource by ID' },
      { method: 'POST', path: '/api/resource', description: 'Create new resource' },
      { method: 'PUT', path: '/api/resource/{id}', description: 'Update resource' },
      { method: 'DELETE', path: '/api/resource/{id}', description: 'Delete resource' }
    ];
    
    // Draw each endpoint
    endpoints.forEach((endpoint, index) => {
      const y = 180 + index * 70;
      
      // Method box color based on HTTP method
      const methodColor = endpoint.method === 'GET' ? '#4caf50' :
                          endpoint.method === 'POST' ? '#2196f3' :
                          endpoint.method === 'PUT' ? '#ff9800' :
                          endpoint.method === 'DELETE' ? '#f44336' : '#9c27b0';
      
      svg += `
        <rect x="100" y="${y}" width="100" height="40" fill="${methodColor}" stroke="none" rx="5" ry="5"/>
        <text x="150" y="${y+25}" font-family="Arial" font-size="16" font-weight="bold" text-anchor="middle" fill="white">${endpoint.method}</text>
        
        <!-- Path -->
        <rect x="200" y="${y}" width="300" height="40" fill="#f5f5f5" stroke="none" rx="0" ry="0"/>
        <text x="210" y="${y+25}" font-family="monospace" font-size="14" text-anchor="start" fill="#333">${endpoint.path}</text>
        
        <!-- Description -->
        <text x="520" y="${y+25}" font-family="Arial" font-size="14" text-anchor="start" fill="#555">${endpoint.description}</text>
      `;
    });
    
    svg += `</svg>`;
    return svg;
  }
  
  module.exports = {
    getDiagramTypeForStage,
    generateSvgDiagram,
    generateArchitectureDiagram,
    generateErDiagram,
    generateApiDiagram
  };