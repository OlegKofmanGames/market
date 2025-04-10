import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { Container, Box } from '@mui/material';
import { useEffect } from 'react';
import StockAnalysis from './components/StockAnalysis';
import Footer from './components/Footer';
import Logo from './components/Logo';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  // Set document title and favicon
  useEffect(() => {
    document.title = 'MoneyAI - Stock Technical Analysis';
    
    // Create link element for favicon
    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = '/favicon.svg';
    link.type = 'image/svg+xml';
    
    // Remove any existing favicon links
    const existingLinks = document.querySelectorAll("link[rel='icon']");
    existingLinks.forEach(el => el.remove());
    
    // Add the new favicon link
    document.head.appendChild(link);
    
    // Cleanup function
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        <Box 
          component="header" 
          sx={{ 
            py: 2, 
            px: 2,
            backgroundColor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Container maxWidth="xl">
            <Logo size="large" />
          </Container>
        </Box>
        
        <Box component="main" sx={{ flexGrow: 1 }}>
          <Container maxWidth="xl">
            <Box sx={{ my: 4 }}>
              <StockAnalysis />
            </Box>
          </Container>
        </Box>
        
        <Footer />
      </Box>
    </ThemeProvider>
  );
}

export default App;
