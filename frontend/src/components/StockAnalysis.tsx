import { useState, useEffect } from 'react';
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
      const response = await axios.get(`http://localhost:8000/analysis/${symbol}`);
      setStockData(response.data);
    } catch (err) {
      setError('Error fetching stock data. Please try again.');
      console.error(err);
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

    const traces = [
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
      />
    );
  };

  const renderIndicators = () => {
    if (!stockData) return null;

    return (
      <Grid container spacing={2}>
        <Grid item xs={12} md={6} component="div">
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
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} component="div">
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
        variant="outlined"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value.toUpperCase())}
        onKeyPress={handleSearch}
        sx={{ mb: 4 }}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {stockData && (
            <>
              <Paper sx={{ p: 2, mb: 4 }}>
                {renderChart()}
              </Paper>
              {renderIndicators()}
            </>
          )}
        </>
      )}
    </Box>
  );
};

export default StockAnalysis; 