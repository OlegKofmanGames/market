import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Container,
  IconButton,
  useTheme,
  alpha,
  Fade,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import axios from 'axios';

// Types
interface FundamentalData {
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  volume: number;
  pe_ratio: number;
  dividend_yield: number;
  sector: string;
  industry: string;
  fifty_two_week_high: number;
  fifty_two_week_low: number;
}

// Constants
const API_BASE_URL = 'http://localhost:8000';

// Component
const StockAnalysis = () => {
  const theme = useTheme();
  const [symbol, setSymbol] = useState('');
  const [fundamentalData, setFundamentalData] = useState<FundamentalData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Empty useEffect - no default data loading
  useEffect(() => {}, []);

  // Fetch fundamental data from API
  const fetchFundamentalData = async (stockSymbol: string) => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_BASE_URL}/search/${stockSymbol}`);
      if (response.data) {
        setFundamentalData(response.data);
      }
    } catch (err) {
      console.error('[StockAnalysis] Error fetching fundamental data:', err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || 'Error fetching stock data');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle search input
  const handleSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && symbol.trim()) {
      fetchFundamentalData(symbol.trim().toUpperCase());
    }
  };

  // Render fundamental data
  const renderFundamentalData = () => {
    if (!fundamentalData) return null;

    const formatNumber = (num: number | null | undefined, decimals: number = 2) => {
      if (num === null || num === undefined) return 'N/A';
      return num.toFixed(decimals);
    };

    const formatMarketCap = (marketCap: number) => {
      if (marketCap >= 1e12) {
        return `$${(marketCap / 1e12).toFixed(2)}T`;
      } else if (marketCap >= 1e9) {
        return `$${(marketCap / 1e9).toFixed(2)}B`;
      } else if (marketCap >= 1e6) {
        return `$${(marketCap / 1e6).toFixed(2)}M`;
      } else {
        return `$${marketCap.toFixed(2)}`;
      }
    };

    const formatVolume = (volume: number) => {
      if (volume >= 1e9) {
        return `${(volume / 1e9).toFixed(2)}B`;
      } else if (volume >= 1e6) {
        return `${(volume / 1e6).toFixed(2)}M`;
      } else if (volume >= 1e3) {
        return `${(volume / 1e3).toFixed(2)}K`;
      } else {
        return volume.toString();
      }
    };

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Paper
          elevation={6}
          sx={{
            p: 4,
            borderRadius: 4,
            background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.7)})`,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            boxShadow: `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.2)}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
            <ShowChartIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {fundamentalData.name} ({fundamentalData.symbol})
            </Typography>
          </Box>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
            <Box>
              <Typography variant="h6" color="primary" gutterBottom>
                Price
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                ${formatNumber(fundamentalData.current_price)}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="h6" color="primary" gutterBottom>
                Cap
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {formatMarketCap(fundamentalData.market_cap)}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="h6" color="primary" gutterBottom>
                P/E
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {formatNumber(fundamentalData.pe_ratio)}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="h6" color="primary" gutterBottom>
                Yield
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {fundamentalData.dividend_yield ? `${fundamentalData.dividend_yield.toFixed(2)}%` : 'N/A'}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="h6" color="primary" gutterBottom>
                52W Range
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                ${formatNumber(fundamentalData.fifty_two_week_low)} - ${formatNumber(fundamentalData.fifty_two_week_high)}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="h6" color="primary" gutterBottom>
                Vol
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {formatVolume(fundamentalData.volume)}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" color="primary" gutterBottom>
              Sector
            </Typography>
            <Typography variant="body1">
              {fundamentalData.sector} - {fundamentalData.industry}
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  };

  // Render empty state
  const renderEmptyState = () => {
    return (
      <Box 
        sx={{ 
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
          gap: 3
        }}
      >
        <Box
          component="img"
          src="/wallstreetbets.svg"
          alt="Wallstreetbets character"
          sx={{
            width: 200,
            height: 200,
            opacity: 0.8,
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
            animation: 'float 3s ease-in-out infinite',
            '@keyframes float': {
              '0%, 100%': {
                transform: 'translateY(0)',
              },
              '50%': {
                transform: 'translateY(-10px)',
              },
            },
          }}
        />
        <Typography variant="h6" color="text.secondary" sx={{ opacity: 0.7 }}>
          Enter a stock symbol to see fundamental data
        </Typography>
      </Box>
    );
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 6 }}>
        <Fade in={true} timeout={800} style={{ transitionDelay: '200ms' }}>
          <Paper 
            elevation={6}
            sx={{
              p: 2,
              mb: 6,
              borderRadius: 3,
              background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.7)})`,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              boxShadow: `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.2)}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ShowChartIcon sx={{ color: theme.palette.primary.main, ml: 1 }} />
              <TextField
                size="small"
                placeholder="Enter symbol"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                onKeyPress={handleSearch}
                disabled={loading}
                sx={{
                  width: '140px',
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: alpha(theme.palette.background.paper, 0.5),
                    '& input': {
                      fontWeight: 500,
                      letterSpacing: 1,
                    }
                  }
                }}
              />
              <IconButton
                onClick={() => symbol.trim() && fetchFundamentalData(symbol.trim().toUpperCase())}
                disabled={loading || !symbol.trim()}
                color="primary"
                sx={{
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.2),
                  }
                }}
              >
                <SearchIcon />
              </IconButton>
            </Box>
          </Paper>
        </Fade>

        {error && (
          <Fade in={true} timeout={800}>
            <Alert severity="error" sx={{ mb: 4 }}>
              {error}
            </Alert>
          </Fade>
        )}

        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress size={80} thickness={4} />
          </Box>
        )}

        {!loading && !error && !fundamentalData && renderEmptyState()}

        {fundamentalData && !loading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {renderFundamentalData()}
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default StockAnalysis; 