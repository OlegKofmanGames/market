import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple, Optional
import yfinance as yf
from datetime import datetime, timedelta

def calculate_rsi(data: pd.DataFrame, period: int = 14) -> Tuple[float, str, str]:
    """Calculate RSI and return value, signal, and explanation."""
    delta = data['Close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    
    rs = gain / loss
    rsi = 100 - (100 / (1 + rs))
    current_rsi = rsi.iloc[-1]
    
    if current_rsi > 70:
        return current_rsi, 'bad', 'RSI is overbought (>70), suggesting a potential sell signal.'
    elif current_rsi < 30:
        return current_rsi, 'good', 'RSI is oversold (<30), suggesting a potential buy signal.'
    else:
        return current_rsi, 'warning', 'RSI is in neutral territory (30-70).'

def detect_death_cross(data: pd.DataFrame) -> Tuple[bool, str, str]:
    """Detect death cross pattern (50-day MA crosses below 200-day MA)."""
    ma50 = data['Close'].rolling(window=50).mean()
    ma200 = data['Close'].rolling(window=200).mean()
    
    # Check if 50-day MA is below 200-day MA
    current_death_cross = ma50.iloc[-1] < ma200.iloc[-1]
    
    if current_death_cross:
        return True, 'bad', 'Death Cross detected (50-day MA below 200-day MA), indicating a bearish trend.'
    else:
        return False, 'good', 'No Death Cross detected (50-day MA above 200-day MA), indicating a bullish trend.'

def calculate_macd(data: pd.DataFrame) -> Tuple[float, str, str]:
    """Calculate MACD and return value, signal, and explanation."""
    exp1 = data['Close'].ewm(span=12, adjust=False).mean()
    exp2 = data['Close'].ewm(span=26, adjust=False).mean()
    macd = exp1 - exp2
    signal = macd.ewm(span=9, adjust=False).mean()
    current_macd = macd.iloc[-1] - signal.iloc[-1]
    
    if current_macd > 0:
        return current_macd, 'good', 'MACD is above signal line, indicating bullish momentum.'
    elif current_macd < 0:
        return current_macd, 'bad', 'MACD is below signal line, indicating bearish momentum.'
    else:
        return current_macd, 'warning', 'MACD is at signal line, indicating neutral momentum.'

def get_indicators(
    symbol: str,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    period: str = "1y"
) -> Dict[str, Any]:
    """Get all technical indicators for a given stock symbol."""
    try:
        # Get stock data
        stock = yf.Ticker(symbol)
        
        # Fetch data based on provided parameters
        if start_date and end_date:
            data = stock.history(start=start_date, end=end_date)
        else:
            data = stock.history(period=period)
        
        if data.empty:
            raise ValueError(f"No data found for symbol {symbol}")
        
        # Calculate indicators
        rsi_value, rsi_signal, rsi_explanation = calculate_rsi(data)
        death_cross_value, death_cross_signal, death_cross_explanation = detect_death_cross(data)
        macd_value, macd_signal, macd_explanation = calculate_macd(data)
        
        return {
            'rsi': {
                'value': rsi_value,
                'signal': rsi_signal,
                'explanation': rsi_explanation
            },
            'deathCross': {
                'value': death_cross_value,
                'signal': death_cross_signal,
                'explanation': death_cross_explanation
            },
            'macd': {
                'value': macd_value,
                'signal': macd_signal,
                'explanation': macd_explanation
            }
        }
    except Exception as e:
        raise ValueError(f"Error calculating indicators: {str(e)}") 