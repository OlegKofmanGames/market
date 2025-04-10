import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Container,
  useTheme,
  alpha,
  Fade,
  TextField,
  InputAdornment,
  IconButton,
  Theme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios, { AxiosError } from 'axios';
import Logo from './Logo';

// Types
interface IndicatorData {
  rsi: {
    value: number;
    signal: 'good' | 'warning' | 'bad';
    explanation: string;
  };
  deathCross: {
    value: boolean;
    signal: 'good' | 'warning' | 'bad';
    explanation: string;
  };
  macd: {
    value: number;
    signal: 'good' | 'warning' | 'bad';
    explanation: string;
  };
}

interface IndicatorBoxProps {
  title: string;
  data: {
    value: number | boolean;
    signal: 'good' | 'warning' | 'bad';
    explanation: string;
  };
}

interface ErrorResponse {
  detail: string;
}

// Constants
const API_BASE_URL = 'http://localhost:8000';

// Helper functions
const getSignalColor = (signal: 'good' | 'warning' | 'bad', theme: Theme) => {
  switch (signal) {
    case 'good':
      return alpha(theme.palette.success.main, 0.1);
    case 'warning':
      return alpha(theme.palette.warning.main, 0.1);
    case 'bad':
      return alpha(theme.palette.error.main, 0.1);
  }
};

const getBorderColor = (signal: 'good' | 'warning' | 'bad', theme: Theme) => {
  switch (signal) {
    case 'good':
      return theme.palette.success.main;
    case 'warning':
      return theme.palette.warning.main;
    case 'bad':
      return theme.palette.error.main;
  }
};

// Components
const IndicatorBox = ({ title, data }: IndicatorBoxProps) => {
  const theme = useTheme();
  
  return (
    <Fade in={true} timeout={800}>
      <Paper
        elevation={6}
        sx={{
          p: 4,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 4,
          background: getSignalColor(data.signal, theme),
          border: `2px solid ${getBorderColor(data.signal, theme)}`,
          boxShadow: `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.2)}`,
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 12px 40px 0 ${alpha(theme.palette.common.black, 0.3)}`,
          },
        }}
      >
        <Typography
          variant="h5"
          component="h2"
          sx={{
            mb: 2,
            fontWeight: 700,
            color: getBorderColor(data.signal, theme),
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="h4"
          sx={{
            mb: 2,
            fontWeight: 700,
            color: theme.palette.text.primary,
          }}
        >
          {typeof data.value === 'boolean' 
            ? (data.value ? 'Yes' : 'No')
            : data.value.toFixed(2)}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: theme.palette.text.secondary,
            lineHeight: 1.6,
            flexGrow: 1,
          }}
        >
          {data.explanation}
        </Typography>
      </Paper>
    </Fade>
  );
};

const Indicators = () => {
  const theme = useTheme();
  const [symbol, setSymbol] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [indicators, setIndicators] = useState<IndicatorData | null>(null);

  // Fetch indicators data from API
  const fetchIndicators = async (stockSymbol: string) => {
    if (!stockSymbol.trim()) {
      setError('Please enter a stock symbol');
      return;
    }

    setLoading(true);
    setError('');
    console.log(`[Indicators] Fetching indicators for symbol: ${stockSymbol}`);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/indicators/${stockSymbol}`);
      console.log('[Indicators] Indicators data received:', response.data);
      setIndicators(response.data);
    } catch (err) {
      console.error('[Indicators] Error fetching indicators:', err);
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<ErrorResponse>;
        if (axiosError.response) {
          console.error('[Indicators] Error response:', axiosError.response.data);
          setError(axiosError.response.data?.detail || 'Failed to fetch indicators data. Please try again later.');
        } else if (axiosError.request) {
          console.error('[Indicators] Error request:', axiosError.request);
          setError('Network error. Please check your connection and try again.');
        } else {
          console.error('[Indicators] Error message:', axiosError.message);
          setError('An unexpected error occurred. Please try again later.');
        }
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle search input
  const handleSearch = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      fetchIndicators(symbol.trim().toUpperCase());
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 6 }}>
        <Fade in={true} timeout={800}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 6,
            gap: 2,
          }}>
            <Logo size="large" />
          </Box>
        </Fade>

        <Fade in={true} timeout={800} style={{ transitionDelay: '200ms' }}>
          <Paper 
            elevation={6}
            sx={{
              p: 4,
              mb: 6,
              borderRadius: 4,
              background: alpha(theme.palette.background.paper, 0.6),
              backdropFilter: 'blur(10px)',
            }}
          >
            <TextField
              fullWidth
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              onKeyPress={handleSearch}
              placeholder="Enter stock symbol (e.g., AAPL)"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      onClick={() => fetchIndicators(symbol.trim().toUpperCase())}
                      edge="end"
                    >
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                },
              }}
            />
          </Paper>
        </Fade>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {indicators && (
          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(3, 1fr)'
              },
              gap: 4,
              mt: 0
            }}
          >
            <Box>
              <IndicatorBox
                title="RSI (Relative Strength Index)"
                data={indicators.rsi}
              />
            </Box>
            <Box>
              <IndicatorBox
                title="Death Cross"
                data={indicators.deathCross}
              />
            </Box>
            <Box>
              <IndicatorBox
                title="MACD (Moving Average Convergence Divergence)"
                data={indicators.macd}
              />
            </Box>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Indicators; 