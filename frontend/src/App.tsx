import { ThemeProvider, createTheme, CssBaseline, Container, Box, AppBar, Toolbar, Button, useTheme } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import StockAnalysis from './components/StockAnalysis';
import Indicators from './components/Indicators';
import Logo from './components/Logo';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90CAF9',
    },
    secondary: {
      main: '#CE93D8',
    },
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
  },
});

const Navigation = () => {
  const theme = useTheme();
  const location = useLocation();

  return (
    <AppBar 
      position="static" 
      sx={{ 
        background: 'transparent',
        boxShadow: 'none',
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Toolbar>
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Logo size="medium" />
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            component={Link}
            to="/"
            color="inherit"
            sx={{
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: location.pathname === '/' ? '100%' : '0%',
                height: '2px',
                backgroundColor: theme.palette.primary.main,
                transition: 'width 0.3s ease-in-out',
              },
              '&:hover::after': {
                width: '100%',
              },
            }}
          >
            Home
          </Button>
          <Button
            component={Link}
            to="/indicators"
            color="inherit"
            sx={{
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: location.pathname === '/indicators' ? '100%' : '0%',
                height: '2px',
                backgroundColor: theme.palette.primary.main,
                transition: 'width 0.3s ease-in-out',
              },
              '&:hover::after': {
                width: '100%',
              },
            }}
          >
            Indicators
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

function App() {
  // Set document title and favicon
  useEffect(() => {
    document.title = 'MoneyAI - Stock Technical Analysis';
    
    // Create and append favicon link
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/svg+xml';
    link.href = '/favicon.svg';
    
    // Remove any existing favicon links
    const existingLinks = document.querySelectorAll("link[rel~='icon']");
    existingLinks.forEach(link => link.remove());
    
    document.head.appendChild(link);
    
    // Cleanup function
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ 
          minHeight: '100vh',
          background: `linear-gradient(135deg, ${theme.palette.background.default}, ${theme.palette.background.paper})`,
        }}>
          <Navigation />
          <Routes>
            <Route path="/" element={<StockAnalysis />} />
            <Route path="/indicators" element={<Indicators />} />
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
