/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // Custom Color Palette for Government Farmer App
      colors: {
        // Primary Green Shades (Agriculture Theme)
        'gov-green': {
          50: '#E8F5E9',   // Lightest green
          100: '#C8E6C9',  // Light green
          200: '#A5D6A7',  // Soft green
          300: '#81C784',  // Mild green
          400: '#66BB6A',  // Medium green
          500: '#4CAF50',  // Primary green
          600: '#43A047',  // Dark green
          700: '#388E3C',  // Darker green
          800: '#2E7D32',  // Deep green
          900: '#1B5E20'   // Darkest green
        },
        
        // Accent Colors
        'gov-orange': {
          500: '#FF9800',  // Warm orange for highlights
          600: '#F57C00'   // Slightly darker orange
        },
        
        // Neutral Colors
        'gov-neutral': {
          50: '#FAFAFA',   // Almost white background
          100: '#F5F5F5',  // Light gray background
          200: '#EEEEEE',  // Lighter gray
          300: '#E0E0E0',  // Light gray
          400: '#BDBDBD',  // Medium gray
          500: '#9E9E9E',  // Gray
          600: '#757575',  // Dark gray
          700: '#616161',  // Darker gray
          800: '#424242',  // Very dark gray
          900: '#212121'   // Almost black
        },
        
        // Soil and Earth Tones
        'gov-earth': {
          300: '#A1887F',  // Soft terracotta
          500: '#795548',  // Rich brown
          700: '#5D4037'   // Dark brown
        }
      },
      
      // Custom Typography
      fontFamily: {
        'gov-sans': ['Inter', 'system-ui', 'sans-serif'],
        'gov-serif': ['Merriweather', 'Georgia', 'serif']
      },
      
      
      // Transition Configurations
      transitionProperty: {
        'gov-smooth': 'all 0.3s ease-in-out'
      }
    }
  },
  plugins: [
    // Optional: Add any additional Tailwind plugins here
    // For example, forms or typography plugin
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography')
  ]
}