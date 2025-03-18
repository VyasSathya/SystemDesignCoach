export const ReviewButton = ({ sectionId, onReview, isLoading }) => {
  return (
    <button 
      className="review-button"
      onClick={() => onReview(sectionId)}
      disabled={isLoading}
    >
      {isLoading ? 'Reviewing...' : 'Review This Section'}
    </button>
  );
};