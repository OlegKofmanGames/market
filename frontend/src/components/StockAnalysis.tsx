import { useState } from 'react';
import {
  Box,
  TextField,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Container,
  InputAdornment,
  IconButton,
  useTheme,
  alpha,
  Fade,
  Zoom,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import Plot from 'react-plotly.js';
import axios from 'axios';
import { Data } from 'plotly.js';
import { GridProps } from '@mui/material/Grid';

interface StockData {
  dates: string[];
  prices: number[];
  volumes: number[];
  indicators: {
    SMA_20: number[];
    EMA_20: number[];
    RSI: number[];
    MACD: number[];
    MACD_Signal: number[];
    BB_upper: number[];
    BB_lower: number[];
    BB_middle: number[];
  };
  levels: {
    support: number[];
    resistance: number[];
  };
}

const StockAnalysis = () => {
  const theme = useTheme();
  const [symbol, setSymbol] = useState('');
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchStockData = async (symbol: string) => {
    try {
      setLoading(true);
      setError('');
      setStockData(null); // Clear previous data
      console.log('Fetching data for symbol:', symbol);
      const response = await axios.get(`http://localhost:8000/analysis/${symbol}`);
      console.log('API Response:', response.data);
      
      if (response.data && response.data.dates && response.data.dates.length > 0) {
        // Ensure all required fields are present
        const data = {
          ...response.data,
          levels: {
            support: response.data.levels?.support || [],
            resistance: response.data.levels?.resistance || []
          }
        };
        console.log('Processed data:', data);
        setStockData(data);
      } else {
        console.error('Invalid data structure:', response.data);
        setError('No data available for this symbol');
      }
    } catch (err) {
      console.error('Error fetching stock data:', err);
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.detail || 'Error fetching stock data. Please try again.';
        console.error('API Error:', errorMessage);
        setError(errorMessage);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && symbol.trim()) {
      fetchStockData(symbol.trim().toUpperCase());
    }
  };

  const renderChart = () => {
    if (!stockData) return null;
    
    try {
      console.log('Rendering chart with data:', stockData);
      const traces: Data[] = [
        {
          name: 'Price',
          x: stockData.dates,
          y: stockData.prices,
          type: 'scatter',
          mode: 'lines',
          line: { 
            color: theme.palette.primary.main,
            width: 2,
            shape: 'spline',
          },
        },
        {
          name: 'SMA 20',
          x: stockData.dates,
          y: stockData.indicators.SMA_20,
          type: 'scatter',
          mode: 'lines',
          line: { 
            color: theme.palette.secondary.main,
            dash: 'dash',
            width: 1.5,
            shape: 'spline',
          },
        },
        {
          name: 'EMA 20',
          x: stockData.dates,
          y: stockData.indicators.EMA_20,
          type: 'scatter',
          mode: 'lines',
          line: { 
            color: '#4caf50',
            dash: 'dot',
            width: 1.5,
            shape: 'spline',
          },
        },
        {
          name: 'BB Upper',
          x: stockData.dates,
          y: stockData.indicators.BB_upper,
          type: 'scatter',
          mode: 'lines',
          line: { 
            color: alpha(theme.palette.common.white, 0.3),
            width: 1,
            shape: 'spline',
          },
        },
        {
          name: 'BB Lower',
          x: stockData.dates,
          y: stockData.indicators.BB_lower,
          type: 'scatter',
          mode: 'lines',
          line: { 
            color: alpha(theme.palette.common.white, 0.3),
            width: 1,
            shape: 'spline',
          },
          fill: 'tonexty',
        },
      ];

      // Add support and resistance lines
      if (stockData.levels?.support) {
        stockData.levels.support.forEach((level, i) => {
          traces.push({
            name: `Support ${i + 1}`,
            x: [stockData.dates[0], stockData.dates[stockData.dates.length - 1]],
            y: [level, level],
            type: 'scatter',
            mode: 'lines',
            line: { color: 'green', dash: 'dash' },
          });
        });
      }

      if (stockData.levels?.resistance) {
        stockData.levels.resistance.forEach((level, i) => {
          traces.push({
            name: `Resistance ${i + 1}`,
            x: [stockData.dates[0], stockData.dates[stockData.dates.length - 1]],
            y: [level, level],
            type: 'scatter',
            mode: 'lines',
            line: { color: 'red', dash: 'dash' },
          });
        });
      }

      return (
        <Zoom in={true} timeout={800}>
          <Paper 
            elevation={6}
            sx={{
              p: 4,
              borderRadius: 4,
              background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.7)})`,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              boxShadow: `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.2)}`,
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 12px 40px 0 ${alpha(theme.palette.common.black, 0.3)}`,
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
              <ShowChartIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />
              <Typography variant="h5" sx={{ fontWeight: 600, background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {symbol} Price Analysis
              </Typography>
            </Box>
            <Plot
              data={traces}
              layout={{
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)',
                font: { 
                  color: theme.palette.text.primary,
                  family: theme.typography.fontFamily,
                  size: 12,
                },
                xaxis: {
                  gridcolor: alpha(theme.palette.common.white, 0.1),
                  zerolinecolor: alpha(theme.palette.common.white, 0.2),
                  tickfont: { size: 11 },
                },
                yaxis: {
                  gridcolor: alpha(theme.palette.common.white, 0.1),
                  zerolinecolor: alpha(theme.palette.common.white, 0.2),
                  tickfont: { size: 11 },
                },
                showlegend: true,
                legend: {
                  bgcolor: 'rgba(0,0,0,0)',
                  bordercolor: alpha(theme.palette.common.white, 0.1),
                  borderwidth: 1,
                  font: { size: 11 },
                },
                margin: { t: 20, r: 20, b: 40, l: 60 },
              }}
              style={{ width: '100%', height: '600px' }}
              useResizeHandler={true}
            />
          </Paper>
        </Zoom>
      );
    } catch (err) {
      console.error('Error rendering chart:', err);
      return (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error rendering chart. Please try again.
        </Alert>
      );
    }
  };

  const renderIndicators = () => {
    if (!stockData) return null;

    return (
      <Grid container spacing={4}>
        <Grid {...({ item: true, xs: 12, md: 6 } as GridProps)}>
          <Zoom in={true} timeout={800} style={{ transitionDelay: '200ms' }}>
            <Paper 
              elevation={6}
              sx={{
                p: 4,
                borderRadius: 4,
                background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.7)})`,
                backdropFilter: 'blur(20px)',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                boxShadow: `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.2)}`,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 12px 40px 0 ${alpha(theme.palette.common.black, 0.3)}`,
                },
              }}
            >
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Relative Strength Index (RSI)
              </Typography>
              <Plot
                data={[
                  {
                    x: stockData.dates,
                    y: stockData.indicators.RSI,
                    type: 'scatter',
                    mode: 'lines',
                    line: { 
                      color: theme.palette.primary.main,
                      width: 2,
                      shape: 'spline',
                    },
                  },
                ]}
                layout={{
                  paper_bgcolor: 'rgba(0,0,0,0)',
                  plot_bgcolor: 'rgba(0,0,0,0)',
                  font: { 
                    color: theme.palette.text.primary,
                    family: theme.typography.fontFamily,
                    size: 12,
                  },
                  xaxis: { 
                    gridcolor: alpha(theme.palette.common.white, 0.1),
                    zerolinecolor: alpha(theme.palette.common.white, 0.2),
                    tickfont: { size: 11 },
                  },
                  yaxis: { 
                    gridcolor: alpha(theme.palette.common.white, 0.1),
                    zerolinecolor: alpha(theme.palette.common.white, 0.2),
                    tickfont: { size: 11 },
                  },
                  shapes: [
                    {
                      type: 'line',
                      y0: 70,
                      y1: 70,
                      x0: stockData.dates[0],
                      x1: stockData.dates[stockData.dates.length - 1],
                      line: { color: theme.palette.error.main, dash: 'dash', width: 1 },
                    },
                    {
                      type: 'line',
                      y0: 30,
                      y1: 30,
                      x0: stockData.dates[0],
                      x1: stockData.dates[stockData.dates.length - 1],
                      line: { color: theme.palette.success.main, dash: 'dash', width: 1 },
                    },
                  ],
                  margin: { t: 20, r: 20, b: 40, l: 60 },
                }}
                style={{ width: '100%', height: '300px' }}
                useResizeHandler={true}
              />
            </Paper>
          </Zoom>
        </Grid>
        <Grid {...({ item: true, xs: 12, md: 6 } as GridProps)}>
          <Zoom in={true} timeout={800} style={{ transitionDelay: '400ms' }}>
            <Paper 
              elevation={6}
              sx={{
                p: 4,
                borderRadius: 4,
                background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.7)})`,
                backdropFilter: 'blur(20px)',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                boxShadow: `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.2)}`,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 12px 40px 0 ${alpha(theme.palette.common.black, 0.3)}`,
                },
              }}
            >
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Moving Average Convergence Divergence (MACD)
              </Typography>
              <Plot
                data={[
                  {
                    x: stockData.dates,
                    y: stockData.indicators.MACD,
                    type: 'scatter',
                    mode: 'lines',
                    name: 'MACD',
                    line: { 
                      color: theme.palette.primary.main,
                      width: 2,
                      shape: 'spline',
                    },
                  },
                  {
                    x: stockData.dates,
                    y: stockData.indicators.MACD_Signal,
                    type: 'scatter',
                    mode: 'lines',
                    name: 'Signal',
                    line: { 
                      color: theme.palette.secondary.main,
                      width: 2,
                      shape: 'spline',
                    },
                  },
                ]}
                layout={{
                  paper_bgcolor: 'rgba(0,0,0,0)',
                  plot_bgcolor: 'rgba(0,0,0,0)',
                  font: { 
                    color: theme.palette.text.primary,
                    family: theme.typography.fontFamily,
                    size: 12,
                  },
                  xaxis: { 
                    gridcolor: alpha(theme.palette.common.white, 0.1),
                    zerolinecolor: alpha(theme.palette.common.white, 0.2),
                    tickfont: { size: 11 },
                  },
                  yaxis: { 
                    gridcolor: alpha(theme.palette.common.white, 0.1),
                    zerolinecolor: alpha(theme.palette.common.white, 0.2),
                    tickfont: { size: 11 },
                  },
                  margin: { t: 20, r: 20, b: 40, l: 60 },
                }}
                style={{ width: '100%', height: '300px' }}
                useResizeHandler={true}
              />
            </Paper>
          </Zoom>
        </Grid>
      </Grid>
    );
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
            <TrendingUpIcon sx={{ 
              fontSize: 48, 
              color: theme.palette.primary.main,
              filter: 'drop-shadow(0 0 8px rgba(144, 202, 249, 0.5))',
            }} />
            <Typography 
              variant="h3" 
              component="h1" 
              sx={{ 
                fontWeight: 700,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              Stock Technical Analysis
            </Typography>
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
                      onClick={() => symbol.trim() && fetchStockData(symbol.trim().toUpperCase())}
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

        {stockData && !loading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {renderChart()}
            {renderIndicators()}
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default StockAnalysis; 