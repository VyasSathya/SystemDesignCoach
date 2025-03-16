export class LifelineValidator {
  static validateLifeline(lifeline, parent) {
    // Check vertical alignment with parent
    if (!this.isAlignedWithParent(lifeline, parent)) {
      return { valid: false, error: 'Lifeline must be vertically aligned with parent' };
    }

    // Validate connection points
    if (!this.hasValidConnections(lifeline)) {
      return { valid: false, error: 'Invalid connection points' };
    }

    return { valid: true };
  }

  static isAlignedWithParent(lifeline, parent) {
    const tolerance = 2; // 2px tolerance for alignment
    return Math.abs(lifeline.position.x - parent.position.x) <= tolerance;
  }

  static hasValidConnections(lifeline) {
    if (!lifeline.connections || !Array.isArray(lifeline.connections)) {
      return false;
    }

    // Ensure connections are properly spaced
    const minSpacing = 20; // Minimum pixels between connection points
    
    return lifeline.connections.every((conn, index, array) => {
      if (index === 0) return true;
      return conn.position - array[index - 1].position >= minSpacing;
    });
  }

  static validateLifelineExtension(lifeline, messages) {
    // Ensure lifeline extends beyond last connected message
    const lastMessageY = Math.max(...messages
      .filter(m => m.source === lifeline.id || m.target === lifeline.id)
      .map(m => m.position.y)
    );

    return lifeline.height >= lastMessageY + 50; // 50px buffer
  }
}