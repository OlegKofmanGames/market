import { useState } from 'react';
import {
  Box,
  TextField,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
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
          line: { color: '#90caf9' },
        },
        {
          name: 'SMA 20',
          x: stockData.dates,
          y: stockData.indicators.SMA_20,
          type: 'scatter',
          mode: 'lines',
          line: { color: '#f48fb1', dash: 'dash' },
        },
        {
          name: 'EMA 20',
          x: stockData.dates,
          y: stockData.indicators.EMA_20,
          type: 'scatter',
          mode: 'lines',
          line: { color: '#4caf50', dash: 'dot' },
        },
        {
          name: 'BB Upper',
          x: stockData.dates,
          y: stockData.indicators.BB_upper,
          type: 'scatter',
          mode: 'lines',
          line: { color: 'rgba(255,255,255,0.3)' },
        },
        {
          name: 'BB Lower',
          x: stockData.dates,
          y: stockData.indicators.BB_lower,
          type: 'scatter',
          mode: 'lines',
          line: { color: 'rgba(255,255,255,0.3)' },
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
        <Plot
          data={traces}
          layout={{
            title: `${symbol} Technical Analysis`,
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { color: '#fff' },
            xaxis: {
              gridcolor: 'rgba(255,255,255,0.1)',
            },
            yaxis: {
              gridcolor: 'rgba(255,255,255,0.1)',
            },
            showlegend: true,
            legend: {
              bgcolor: 'rgba(0,0,0,0)',
            },
          }}
          style={{ width: '100%', height: '600px' }}
          useResizeHandler={true}
        />
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
      <Grid container spacing={2}>
        <Grid {...({ item: true, xs: 12, md: 6 } as GridProps)}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">RSI</Typography>
            <Plot
              data={[
                {
                  x: stockData.dates,
                  y: stockData.indicators.RSI,
                  type: 'scatter',
                  mode: 'lines',
                  line: { color: '#90caf9' },
                },
              ]}
              layout={{
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)',
                font: { color: '#fff' },
                xaxis: { gridcolor: 'rgba(255,255,255,0.1)' },
                yaxis: { gridcolor: 'rgba(255,255,255,0.1)' },
                shapes: [
                  {
                    type: 'line',
                    y0: 70,
                    y1: 70,
                    x0: stockData.dates[0],
                    x1: stockData.dates[stockData.dates.length - 1],
                    line: { color: 'red', dash: 'dash' },
                  },
                  {
                    type: 'line',
                    y0: 30,
                    y1: 30,
                    x0: stockData.dates[0],
                    x1: stockData.dates[stockData.dates.length - 1],
                    line: { color: 'green', dash: 'dash' },
                  },
                ],
              }}
              style={{ width: '100%', height: '300px' }}
              useResizeHandler={true}
            />
          </Paper>
        </Grid>
        <Grid {...({ item: true, xs: 12, md: 6 } as GridProps)}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">MACD</Typography>
            <Plot
              data={[
                {
                  x: stockData.dates,
                  y: stockData.indicators.MACD,
                  type: 'scatter',
                  mode: 'lines',
                  name: 'MACD',
                  line: { color: '#90caf9' },
                },
                {
                  x: stockData.dates,
                  y: stockData.indicators.MACD_Signal,
                  type: 'scatter',
                  mode: 'lines',
                  name: 'Signal',
                  line: { color: '#f48fb1' },
                },
              ]}
              layout={{
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)',
                font: { color: '#fff' },
                xaxis: { gridcolor: 'rgba(255,255,255,0.1)' },
                yaxis: { gridcolor: 'rgba(255,255,255,0.1)' },
              }}
              style={{ width: '100%', height: '300px' }}
              useResizeHandler={true}
            />
          </Paper>
        </Grid>
      </Grid>
    );
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Stock Technical Analysis
      </Typography>
      <TextField
        fullWidth
        label="Enter Stock Symbol"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value.toUpperCase())}
        onKeyPress={handleSearch}
        disabled={loading}
        sx={{ mb: 4 }}
      />
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {loading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}
      {stockData && !loading && (
        <>
          {renderChart()}
          <Box mt={4}>{renderIndicators()}</Box>
        </>
      )}
    </Box>
  );
};

export default StockAnalysis; 