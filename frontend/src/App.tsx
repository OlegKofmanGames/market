import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { Container, Box } from '@mui/material';
import StockAnalysis from './components/StockAnalysis';

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
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl">
        <Box sx={{ my: 4 }}>
          <StockAnalysis />
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
