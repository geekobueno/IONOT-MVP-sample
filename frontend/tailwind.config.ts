module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}', 
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6', // Blue color
        secondary: '#10B981', // Green color
        background: '#F3F4F6', // Light background color
        text: '#1F2937', // Text color
      },
    },
  },
  plugins: [],
}
