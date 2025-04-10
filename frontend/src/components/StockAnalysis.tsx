import { useState } from 'react';
import {
  Box,
  TextField,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Container,
  InputAdornment,
  IconButton,
  useTheme,
  alpha,
  Fade,
  Zoom,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import Plot from 'react-plotly.js';
import axios from 'axios';
import { Data } from 'plotly.js';
import Logo from './Logo';
import type { Config, ModeBarDefaultButtons } from 'plotly.js';

// Types
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

interface TimePeriod {
  value: string;
  label: string;
}

// Constants
const TIME_PERIODS: TimePeriod[] = [
  { value: '1d', label: '1 Day' },
  { value: '5d', label: '5 Days' },
  { value: '1mo', label: '1 Month' },
  { value: '3mo', label: '3 Months' },
  { value: '6mo', label: '6 Months' },
  { value: '1y', label: '1 Year' },
  { value: '2y', label: '2 Years' },
  { value: '5y', label: '5 Years' },
  { value: '10y', label: '10 Years' },
  { value: 'ytd', label: 'Year to Date' },
  { value: 'max', label: 'Maximum' },
];

const API_BASE_URL = 'http://localhost:8000';

// Component
const StockAnalysis = () => {
  const theme = useTheme();
  const [symbol, setSymbol] = useState('');
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timePeriod, setTimePeriod] = useState('1y');

  // Fetch stock data from API
  const fetchStockData = async (stockSymbol: string) => {
    try {
      setLoading(true);
      setError('');
      setStockData(null); // Clear previous data
      console.log(`[StockAnalysis] Fetching data for symbol: ${stockSymbol} with period: ${timePeriod}`);
      
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      const response = await axios.get(`${API_BASE_URL}/analysis/${stockSymbol}?period=${timePeriod}&_=${timestamp}`);
      console.log('[StockAnalysis] API Response:', response.data);
      
      if (response.data && Array.isArray(response.data.dates) && response.data.dates.length > 0) {
        // Format dates based on time period
        const formattedData = {
          ...response.data,
          dates: response.data.dates.map((date: string) => {
            const d = new Date(date);
            // For 1-day period, show time; otherwise show date
            if (timePeriod === '1d') {
              return d.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
              });
            }
            return d.toISOString().split('T')[0];
          }),
          levels: {
            support: response.data.levels?.support || [],
            resistance: response.data.levels?.resistance || []
          }
        };
        console.log('[StockAnalysis] Processed data:', formattedData);
        setStockData(formattedData);
      } else {
        console.error('[StockAnalysis] Invalid data structure:', response.data);
        setError('No data available for this symbol');
      }
    } catch (err) {
      console.error('[StockAnalysis] Error fetching stock data:', err);
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.detail || 'Error fetching stock data. Please try again.';
        console.error('[StockAnalysis] API Error:', errorMessage);
        setError(errorMessage);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle search input
  const handleSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && symbol.trim()) {
      fetchStockData(symbol.trim().toUpperCase());
    }
  };

  // Handle time period change
  const handleTimePeriodChange = (event: SelectChangeEvent<string>) => {
    const newPeriod = event.target.value;
    console.log('[StockAnalysis] Changing time period to:', newPeriod);
    setTimePeriod(newPeriod);
    if (symbol.trim()) {
      fetchStockData(symbol.trim().toUpperCase());
    }
  };

  // Render main price chart
  const renderPriceChart = () => {
    if (!stockData) return null;
    
    try {
      console.log('[StockAnalysis] Rendering price chart with data:', stockData);
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
            shape: timePeriod === '1d' ? 'linear' : 'spline',
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
            shape: timePeriod === '1d' ? 'linear' : 'spline',
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
            shape: timePeriod === '1d' ? 'linear' : 'spline',
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
                {symbol} Price Analysis {timePeriod === '1d' ? '(Intraday)' : ''}
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
                  tickangle: timePeriod === '1d' ? 45 : 0,
                  nticks: timePeriod === '1d' ? 8 : undefined,
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
      console.error('[StockAnalysis] Error rendering price chart:', err);
      return (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error rendering price chart. Please try again.
        </Alert>
      );
    }
  };

  // Render technical indicators
  const renderTechnicalIndicators = () => {
    if (!stockData) return null;

    const commonPlotLayout = {
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
        tickangle: timePeriod === '1d' ? 45 : 0,
        nticks: timePeriod === '1d' ? 8 : undefined,
        rangeslider: { visible: true },
        showspikes: true,
        spikemode: 'across+marker' as const,
        spikesnap: 'cursor' as const,
        showline: true,
        showgrid: true,
        spikecolor: theme.palette.primary.main,
        spikethickness: 1,
      },
      yaxis: { 
        gridcolor: alpha(theme.palette.common.white, 0.1),
        zerolinecolor: alpha(theme.palette.common.white, 0.2),
        tickfont: { size: 11 },
        showspikes: true,
        spikemode: 'across+marker' as const,
        spikesnap: 'cursor' as const,
        showline: true,
        showgrid: true,
        spikecolor: theme.palette.primary.main,
        spikethickness: 1,
      },
      margin: { t: 30, r: 20, b: 40, l: 60 },
      hovermode: 'x unified' as const,
      hoverlabel: {
        bgcolor: alpha(theme.palette.background.paper, 0.9),
        bordercolor: theme.palette.primary.main,
        font: { size: 12, color: theme.palette.text.primary },
      },
      showlegend: true,
      legend: {
        x: 0,
        y: 1.1,
        orientation: 'h' as const,
        bgcolor: 'rgba(0,0,0,0)',
        font: { size: 11 },
      },
    } as const;

    const IMAGE_FORMAT = 'png' as const;

    const toImageOptions = {
      format: IMAGE_FORMAT,
      filename: `${symbol}_${timePeriod}`,
    } as const;

    const commonConfig: Partial<Config> = {
      displayModeBar: true,
      displaylogo: false,
      scrollZoom: true,
      modeBarButtonsToAdd: ['zoom2d', 'pan2d', 'zoomIn2d', 'zoomOut2d', 'resetScale2d'] as ModeBarDefaultButtons[],
      modeBarButtonsToRemove: ['lasso2d', 'select2d', 'autoScale2d'] as ModeBarDefaultButtons[],
      toImageButtonOptions: toImageOptions,
    } as const;

    return (
      <Box display="flex" flexWrap="wrap" sx={{ mx: -2 }}>
        <Box flex={{ xs: '0 0 100%', md: '0 0 50%' }} sx={{ p: 2 }}>
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
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Relative Strength Index (RSI)
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  {timePeriod === '1d' ? 'Intraday' : 'Daily'} RSI
                </Typography>
              </Box>
              <Plot
                data={[
                  {
                    x: stockData.dates,
                    y: stockData.indicators.RSI,
                    type: 'scatter',
                    mode: 'lines',
                    name: 'RSI',
                    line: { 
                      color: theme.palette.primary.main,
                      width: 2,
                      shape: timePeriod === '1d' ? 'linear' : 'spline',
                    },
                    hovertemplate: 'RSI: %{y:.2f}<extra></extra>',
                  },
                ]}
                layout={{
                  ...commonPlotLayout,
                  shapes: [
                    {
                      type: 'rect',
                      x0: stockData.dates[0],
                      x1: stockData.dates[stockData.dates.length - 1],
                      y0: 70,
                      y1: 100,
                      fillcolor: alpha(theme.palette.error.main, 0.1),
                      line: { width: 0 },
                      layer: 'below',
                    },
                    {
                      type: 'rect',
                      x0: stockData.dates[0],
                      x1: stockData.dates[stockData.dates.length - 1],
                      y0: 0,
                      y1: 30,
                      fillcolor: alpha(theme.palette.success.main, 0.1),
                      line: { width: 0 },
                      layer: 'below',
                    },
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
                  annotations: [
                    {
                      x: stockData.dates[0],
                      y: 70,
                      xref: 'x',
                      yref: 'y',
                      text: 'Overbought',
                      showarrow: false,
                      font: { size: 10, color: theme.palette.error.main },
                      xanchor: 'left',
                      yanchor: 'bottom',
                    },
                    {
                      x: stockData.dates[0],
                      y: 30,
                      xref: 'x',
                      yref: 'y',
                      text: 'Oversold',
                      showarrow: false,
                      font: { size: 10, color: theme.palette.success.main },
                      xanchor: 'left',
                      yanchor: 'top',
                    },
                  ],
                  yaxis: {
                    ...commonPlotLayout.yaxis,
                    range: [0, 100],
                    tickformat: '.0f',
                  },
                }}
                style={{ width: '100%', height: '300px' }}
                useResizeHandler={true}
                config={commonConfig}
              />
            </Paper>
          </Zoom>
        </Box>
        <Box flex={{ xs: '0 0 100%', md: '0 0 50%' }} sx={{ p: 2 }}>
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
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  MACD
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  {timePeriod === '1d' ? 'Intraday' : 'Daily'} MACD (12,26,9)
                </Typography>
              </Box>
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
                      shape: timePeriod === '1d' ? 'linear' : 'spline',
                    },
                    hovertemplate: 'MACD: %{y:.4f}<extra></extra>',
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
                      shape: timePeriod === '1d' ? 'linear' : 'spline',
                    },
                    hovertemplate: 'Signal: %{y:.4f}<extra></extra>',
                  },
                  {
                    x: stockData.dates,
                    y: stockData.indicators.MACD.map((macd, i) => macd - stockData.indicators.MACD_Signal[i]),
                    type: 'bar',
                    name: 'Histogram',
                    marker: {
                      color: stockData.indicators.MACD.map((macd, i) => 
                        macd >= stockData.indicators.MACD_Signal[i] 
                          ? alpha(theme.palette.success.main, 0.6)
                          : alpha(theme.palette.error.main, 0.6)
                      ),
                    },
                    hovertemplate: 'Histogram: %{y:.4f}<extra></extra>',
                  },
                ]}
                layout={{
                  ...commonPlotLayout,
                  barmode: 'relative',
                  bargap: 0,
                  yaxis: {
                    ...commonPlotLayout.yaxis,
                    tickformat: '.4f',
                  },
                }}
                style={{ width: '100%', height: '300px' }}
                useResizeHandler={true}
                config={commonConfig}
              />
            </Paper>
          </Zoom>
        </Box>
      </Box>
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
            <Box display="flex" flexWrap="wrap" sx={{ mx: -1 }}>
              <Box flex={{ xs: '0 0 100%', md: '0 0 66.666%' }} sx={{ p: 1 }}>
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
              </Box>
              <Box flex={{ xs: '0 0 100%', md: '0 0 33.333%' }} sx={{ p: 1 }}>
                <FormControl fullWidth>
                  <InputLabel>Time Period</InputLabel>
                  <Select
                    value={timePeriod}
                    onChange={handleTimePeriodChange}
                    label="Time Period"
                    disabled={loading}
                    sx={{
                      borderRadius: 2,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha(theme.palette.primary.main, 0.2),
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.main,
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderWidth: 2,
                        borderColor: theme.palette.primary.main,
                      },
                    }}
                  >
                    {TIME_PERIODS.map((period) => (
                      <MenuItem key={period.value} value={period.value}>
                        {period.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>
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
            {renderPriceChart()}
            {renderTechnicalIndicators()}
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default StockAnalysis; 