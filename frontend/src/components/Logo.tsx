import React from 'react';
import { Box, Typography, useTheme, TypographyVariant } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'medium', showText = true }) => {
  const theme = useTheme();
  
  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 24;
      case 'large':
        return 48;
      default:
        return 32;
    }
  };
  
  const getTextVariant = (): TypographyVariant => {
    switch (size) {
      case 'small':
        return 'h6';
      case 'large':
        return 'h4';
      default:
        return 'h5';
    }
  };
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
      }}
    >
      <TrendingUpIcon 
        sx={{ 
          fontSize: getIconSize(), 
          color: theme.palette.primary.main,
          filter: 'drop-shadow(0 0 8px rgba(144, 202, 249, 0.5))',
        }} 
      />
      {showText && (
        <Typography 
          variant={getTextVariant()} 
          component="span" 
          sx={{ 
            fontWeight: 700,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          MoneyAI
        </Typography>
      )}
    </Box>
  );
};

export default Logo; 