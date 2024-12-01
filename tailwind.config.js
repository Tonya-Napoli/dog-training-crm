module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        pacifico: ['Pacifico', 'cursive'],
      },
      colors: {
        primary: {
          DEFAULT: '#47cbde', // Primary action color
        },
        heading: {
          DEFAULT: '#3d3d3d', // Heading text color 
        },
        accent: {
          cyan: '#47cbde',    // Accent cyan
          teal: '#a4f7e2',    // Accent teal
        },
        background: {
          DEFAULT: '#fbfbe1', // Background color f6f2ec
        },
        link: {
          DEFAULT: '#45affd', // Link color
          hover: '#4747cbde', // Link hover color
        },
        red: {
          DEFAULT: '#ff3131', // Red color
        },
        brown: {
          DEFAULT: '#302826', // Brown color
        },
      },
    },
  },
  plugins: [],
};


