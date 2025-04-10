import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
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
import { GridProps } from '@mui/material/Grid';
import SearchIcon from '@mui/icons-material/Search';
import axios, { AxiosError } from 'axios';
import Logo from './Logo';

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

const IndicatorBox = ({ title, data }: IndicatorBoxProps) => {
  const theme = useTheme();
  
  return (
    <Fade in={true} timeout={800}>
      <Paper
        elevation={6}
        sx={{
          p: 4,
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

  const fetchIndicators = async (stockSymbol: string) => {
    if (!stockSymbol.trim()) {
      setError('Please enter a stock symbol');
      return;
    }

    setLoading(true);
    setError('');
    console.log(`Fetching indicators for symbol: ${stockSymbol}`);
    
    try {
      const response = await axios.get(`http://localhost:8000/indicators/${stockSymbol}`);
      console.log('Indicators data received:', response.data);
      setIndicators(response.data);
    } catch (err) {
      console.error('Error fetching indicators:', err);
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<ErrorResponse>;
        if (axiosError.response) {
          console.error('Error response:', axiosError.response.data);
          setError(axiosError.response.data?.detail || 'Failed to fetch indicators data. Please try again later.');
        } else if (axiosError.request) {
          console.error('Error request:', axiosError.request);
          setError('Network error. Please check your connection and try again.');
        } else {
          console.error('Error message:', axiosError.message);
          setError('An unexpected error occurred. Please try again later.');
        }
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

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
              background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.7)})`,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              boxShadow: `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.2)}`,
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                boxShadow: `0 12px 40px 0 ${alpha(theme.palette.common.black, 0.3)}`,
              },
            }}
          >
            <TextField
              fullWidth
              label="Enter Stock Symbol"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              onKeyPress={handleSearch}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => fetchIndicators(symbol.trim().toUpperCase())}
                      disabled={loading || !symbol.trim()}
                      color="primary"
                      sx={{
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'scale(1.1)',
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        },
                      }}
                    >
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                  '&.Mui-focused fieldset': {
                    borderWidth: 2,
                    borderColor: theme.palette.primary.main,
                  },
                },
                '& .MuiInputLabel-root': {
                  color: theme.palette.text.secondary,
                },
              }}
            />
          </Paper>
        </Fade>

        {error && (
          <Fade in={true} timeout={800}>
            <Alert 
              severity="error" 
              sx={{ 
                mb: 4,
                borderRadius: 2,
                '& .MuiAlert-icon': {
                  fontSize: 24,
                },
                boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.2)}`,
              }}
            >
              {error}
            </Alert>
          </Fade>
        )}

        {loading && (
          <Box 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            minHeight="400px"
          >
            <CircularProgress 
              size={80} 
              thickness={4}
              sx={{
                color: theme.palette.primary.main,
                filter: 'drop-shadow(0 0 8px rgba(144, 202, 249, 0.5))',
              }}
            />
          </Box>
        )}

        {indicators && !loading && (
          <Grid container spacing={4}>
            <Box component={Grid} item xs={12} md={4}>
              <IndicatorBox 
                title="Relative Strength Index (RSI)" 
                data={indicators.rsi} 
              />
            </Box>
            <Box component={Grid} item xs={12} md={4}>
              <IndicatorBox 
                title="Death Cross" 
                data={indicators.deathCross} 
              />
            </Box>
            <Box component={Grid} item xs={12} md={4}>
              <IndicatorBox 
                title="MACD" 
                data={indicators.macd} 
              />
            </Box>
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default Indicators; 