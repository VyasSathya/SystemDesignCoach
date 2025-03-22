import { createTheme, responsiveFontSizes } from '@mui/material/styles';

let theme = createTheme({
  palette: {
    primary: {
      main: '#3b82f6', // Matches Tailwind blue-500
    },
    secondary: {
      main: '#6b7280', // Matches Tailwind gray-500
    },
    error: {
      main: '#ef4444', // Matches Tailwind red-500
    },
    background: {
      default: '#f9fafb', // Matches Tailwind gray-50
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: "#6b7280 #f3f4f6",
          "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
            backgroundColor: "#f3f4f6",
          },
          "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
            borderRadius: 8,
            backgroundColor: "#6b7280",
            minHeight: 24,
            border: "3px solid #f3f4f6",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Prevents uppercase transform
        },
      },
    },
  },
});

theme = responsiveFontSizes(theme);

export default theme;
