import React from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  useTheme,
  alpha,
  Fade,
  Divider,
  Tooltip,
  IconButton,
} from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SpeedIcon from '@mui/icons-material/Speed';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const Documentation = () => {
  const theme = useTheme();

  const indicators = [
    {
      name: 'Relative Strength Index (RSI)',
      icon: <SpeedIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      description: 'A momentum indicator that measures the magnitude of recent price changes to evaluate overbought or oversold conditions.',
      interpretation: [
        'RSI > 70: Stock may be overbought',
        'RSI < 30: Stock may be oversold',
        '50 is considered neutral'
      ],
      color: '#FF6B6B'
    },
    {
      name: 'Moving Average Convergence Divergence (MACD)',
      icon: <CompareArrowsIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      description: 'A trend-following momentum indicator that shows the relationship between two moving averages of a security\'s price.',
      interpretation: [
        'MACD crossing above signal line: Bullish signal',
        'MACD crossing below signal line: Bearish signal',
        'MACD above zero: Upward trend',
        'MACD below zero: Downward trend'
      ],
      color: '#4ECDC4'
    },
    {
      name: 'Simple Moving Average (SMA)',
      icon: <ShowChartIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      description: 'The arithmetic mean of a security\'s price over a specific period. We use 20-day SMA for short-term trend analysis.',
      interpretation: [
        'Price above SMA: Upward trend',
        'Price below SMA: Downward trend',
        'SMA crossing: Potential trend reversal'
      ],
      color: '#45B7D1'
    },
    {
      name: 'Exponential Moving Average (EMA)',
      icon: <TimelineIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      description: 'Similar to SMA but gives more weight to recent prices. We use 20-day EMA which reacts faster to price changes.',
      interpretation: [
        'Price above EMA: Upward trend',
        'Price below EMA: Downward trend',
        'EMA crossing: Potential trend reversal'
      ],
      color: '#96CEB4'
    },
    {
      name: 'Bollinger Bands',
      icon: <AccountBalanceIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      description: 'Consists of a middle band (20-day SMA) and two outer bands that are two standard deviations away from the middle.',
      interpretation: [
        'Price near upper band: Potentially overbought',
        'Price near lower band: Potentially oversold',
        'Bands squeezing: Potential volatility increase',
        'Bands expanding: High volatility'
      ],
      color: '#D4A5A5'
    }
  ];

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 6 }}>
        <Fade in={true} timeout={800}>
          <Box sx={{ mb: 6, display: 'flex', alignItems: 'center', gap: 2 }}>
            <MenuBookIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Technical Indicators Guide
            </Typography>
          </Box>
        </Fade>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {indicators.map((indicator, index) => (
            <Fade 
              key={indicator.name} 
              in={true} 
              timeout={800} 
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <Paper
                elevation={6}
                sx={{
                  p: 4,
                  borderRadius: 4,
                  background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.7)})`,
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  boxShadow: `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.2)}`,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '4px',
                    background: `linear-gradient(90deg, ${alpha(indicator.color, 0.7)}, transparent)`,
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  {indicator.icon}
                  <Typography variant="h5" color="primary" sx={{ fontWeight: 600, flex: 1 }}>
                    {indicator.name}
                  </Typography>
                  <Tooltip title="Learn more about this indicator">
                    <IconButton 
                      size="small"
                      sx={{ 
                        color: theme.palette.primary.main,
                        '&:hover': { 
                          backgroundColor: alpha(theme.palette.primary.main, 0.1) 
                        }
                      }}
                    >
                      <InfoOutlinedIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                
                <Typography variant="body1" paragraph sx={{ color: alpha(theme.palette.common.white, 0.8) }}>
                  {indicator.description}
                </Typography>
                
                <Divider sx={{ my: 2, borderColor: alpha(theme.palette.primary.main, 0.1) }} />
                
                <Typography variant="h6" gutterBottom sx={{ color: theme.palette.secondary.main, fontWeight: 600 }}>
                  Interpretation
                </Typography>
                
                <Box component="ul" sx={{ 
                  m: 0, 
                  pl: 3,
                  '& li': {
                    color: alpha(theme.palette.common.white, 0.7),
                    '&::marker': {
                      color: indicator.color
                    }
                  }
                }}>
                  {indicator.interpretation.map((point, i) => (
                    <Typography 
                      key={i} 
                      component="li" 
                      variant="body1" 
                      sx={{ 
                        mb: 1,
                        '&:hover': {
                          color: alpha(theme.palette.common.white, 0.9)
                        }
                      }}
                    >
                      {point}
                    </Typography>
                  ))}
                </Box>
              </Paper>
            </Fade>
          ))}
        </Box>
      </Box>
    </Container>
  );
};

export default Documentation; 