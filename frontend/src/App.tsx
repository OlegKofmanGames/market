import { ThemeProvider, createTheme, CssBaseline, Box, AppBar, Toolbar, Button, useTheme } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { alpha } from '@mui/material/styles';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import StockAnalysis from './components/StockAnalysis';
import Indicators from './components/Indicators';
import Documentation from './components/Documentation';
import Logo from './components/Logo';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90CAF9',
      light: '#B3E5FC',
      dark: '#64B5F6',
    },
    secondary: {
      main: '#CE93D8',
      light: '#E1BEE7',
      dark: '#BA68C8',
    },
    background: {
      default: '#0A1929',
      paper: '#132F4C',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.025em',
    },
    h2: {
      fontWeight: 600,
      letterSpacing: '-0.025em',
    },
    h3: {
      fontWeight: 600,
      letterSpacing: '-0.025em',
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
});

const Navigation = () => {
  const theme = useTheme();
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Analysis', icon: <ShowChartIcon /> },
    { path: '/indicators', label: 'Indicators', icon: <SignalCellularAltIcon /> },
    { path: '/docs', label: 'Documentation', icon: <MenuBookIcon /> }
  ];

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        backdropFilter: 'blur(8px)',
        backgroundColor: alpha(theme.palette.background.paper, 0.8),
      }}
    >
      <Toolbar sx={{ py: 1 }}>
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Logo size="medium" />
        </Box>
        <Box 
          sx={{ 
            display: 'flex', 
            gap: 1,
            backgroundColor: alpha(theme.palette.background.paper, 0.4),
            padding: '4px',
            borderRadius: '12px',
          }}
        >
          {menuItems.map((item) => (
            <Button
              key={item.path}
              component={Link}
              to={item.path}
              color="inherit"
              startIcon={item.icon}
              sx={{
                px: 3,
                backgroundColor: location.pathname === item.path ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                '&:hover': {
                  backgroundColor: location.pathname === item.path 
                    ? alpha(theme.palette.primary.main, 0.2) 
                    : alpha(theme.palette.common.white, 0.05),
                },
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

function App() {
  useEffect(() => {
    document.title = 'MoneyAI - Stock Technical Analysis';
    
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/svg+xml';
    link.href = '/favicon.svg';
    
    const existingLinks = document.querySelectorAll("link[rel~='icon']");
    existingLinks.forEach(link => link.remove());
    
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box 
          sx={{ 
            minHeight: '100vh',
            background: `radial-gradient(circle at top left, 
              ${alpha(theme.palette.primary.main, 0.12)}, 
              transparent 25%),
              radial-gradient(circle at bottom right, 
              ${alpha(theme.palette.secondary.main, 0.12)}, 
              transparent 25%),
              ${theme.palette.background.default}`,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Navigation />
          <Box 
            component="main" 
            sx={{ 
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: `linear-gradient(90deg, 
                  transparent, 
                  ${alpha(theme.palette.primary.main, 0.12)}, 
                  transparent)`,
              },
            }}
          >
            <Routes>
              <Route path="/" element={<StockAnalysis />} />
              <Route path="/indicators" element={<Indicators />} />
              <Route path="/docs" element={<Documentation />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;

