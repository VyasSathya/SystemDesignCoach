 const Session = require('../../models/Session');
const logger = require('../../utils/logger');

class ProgressTrackingService {
  async trackSectionProgress(sessionId, sectionId, review) {
    try {
      const session = await Session.findById(sessionId);
      
      // Calculate improvement from previous review
      const previousReviews = session.reviews?.[sectionId] || [];
      const previousScore = previousReviews[previousReviews.length - 1]?.score || 0;
      const improvement = review.score - previousScore;

      // Update progress metrics
      await Session.findByIdAndUpdate(sessionId, {
        $push: {
          [`reviews.${sectionId}`]: {
            timestamp: new Date(),
            score: review.score,
            improvement
          }
        },
        $set: {
          [`progress.sections.${sectionId}`]: review.score
        }
      });

      return {
        currentScore: review.score,
        improvement,
        trend: this._calculateTrend(previousReviews, review.score)
      };
    } catch (error) {
      logger.error('Progress tracking error:', error);
      throw error;
    }
  }

  _calculateTrend(previousReviews, currentScore) {
    // Implementation of trend analysis
    return {
      direction: 'improving',
      rate: 'steady'
    };
  }
}

module.exports = new ProgressTrackingService();