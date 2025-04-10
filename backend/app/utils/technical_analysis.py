import pandas as pd
import numpy as np
from ta.trend import SMAIndicator, EMAIndicator, MACD
from ta.momentum import RSIIndicator
from ta.volatility import BollingerBands
from typing import Dict, List, Tuple

def calculate_moving_averages(df: pd.DataFrame) -> Tuple[pd.Series, pd.Series]:
    """Calculate Simple and Exponential Moving Averages."""
    sma = SMAIndicator(close=df['Close'], window=20).sma_indicator()
    ema = EMAIndicator(close=df['Close'], window=20).ema_indicator()
    return sma, ema

def calculate_rsi(df: pd.DataFrame) -> pd.Series:
    """Calculate Relative Strength Index."""
    return RSIIndicator(close=df['Close']).rsi()

def calculate_macd(df: pd.DataFrame) -> Tuple[pd.Series, pd.Series]:
    """Calculate MACD and Signal line."""
    macd = MACD(close=df['Close'])
    return macd.macd(), macd.macd_signal()

def calculate_bollinger_bands(df: pd.DataFrame) -> Tuple[pd.Series, pd.Series, pd.Series]:
    """Calculate Bollinger Bands."""
    bb = BollingerBands(close=df['Close'])
    return bb.bollinger_hband(), bb.bollinger_lband(), bb.bollinger_mavg()

def calculate_support_resistance(df: pd.DataFrame, window: int = 20) -> Dict[str, List[float]]:
    """Calculate support and resistance levels using local minima and maxima."""
    df['min'] = df['Low'].rolling(window=window, center=True).min()
    df['max'] = df['High'].rolling(window=window, center=True).max()
    
    support_levels = df[df['Low'] == df['min']]['Low'].unique().tolist()
    resistance_levels = df[df['High'] == df['max']]['High'].unique().tolist()
    
    return {
        "support": sorted(support_levels)[-3:],  # Top 3 support levels
        "resistance": sorted(resistance_levels)[:3]  # Bottom 3 resistance levels
    } 