const ScalabilityPage = ({ data = {}, updateData }) => {
  // Keep all existing state and functions

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-auto p-6">
        {/* Keep all your existing content until the footer */}
        
        {/* Remove this entire footer section
        <div className="border-t border-gray-200 p-4 flex justify-between">
          <button className="flex items-center px-4 py-2 text-sm bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 transition-colors">
            <MessageSquare size={16} className="mr-2" />
            Ask Coach
          </button>
          <button className="flex items-center px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-sm">
            <Save size={16} className="mr-2" />
            Save & Continue
          </button>
        </div>
        */}
      </div>
    </div>
  );
};

export default ScalabilityPage;