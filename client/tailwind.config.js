/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./pages/**/*.{js,ts,jsx,tsx}",
      "./components/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
      extend: {},
    },
    plugins: [],

    safelist: [
      // Tab colors
      'border-indigo-500', 'text-indigo-600', 'hover:text-indigo-700',
      'border-green-500', 'text-green-600', 'hover:text-green-700',
      'border-purple-500', 'text-purple-600', 'hover:text-purple-700',
      'border-blue-500', 'text-blue-600', 'hover:text-blue-700',
      'border-orange-500', 'text-orange-600', 'hover:text-orange-700',
      'border-red-500', 'text-red-600', 'hover:text-red-700',
      
      // Mobile menu
      'bg-indigo-50', 'text-indigo-700', 
      'bg-green-50', 'text-green-700',
      'bg-purple-50', 'text-purple-700',
      'bg-blue-50', 'text-blue-700',
      'bg-orange-50', 'text-orange-700',
      'bg-red-50', 'text-red-700',
      
      // Buttons
      'bg-indigo-600', 'hover:bg-indigo-700',
      'bg-green-600', 'hover:bg-green-700',
      'bg-purple-600', 'hover:bg-purple-700',
      'bg-blue-600', 'hover:bg-blue-700',
      'bg-orange-600', 'hover:bg-orange-700',
      'bg-red-600', 'hover:bg-red-700'
    ]
  }