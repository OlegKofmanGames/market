import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple

def clean_stock_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Clean and preprocess stock data.
    
    Args:
        df: Raw stock data DataFrame
        
    Returns:
        Cleaned DataFrame
    """
    # Remove any rows with missing values
    df = df.dropna()
    
    # Ensure index is datetime
    df.index = pd.to_datetime(df.index)
    
    # Sort by date
    df = df.sort_index()
    
    return df

def prepare_data_for_analysis(df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, float]]:
    """
    Prepare data for technical analysis by calculating returns and basic statistics.
    
    Args:
        df: Cleaned stock data DataFrame
        
    Returns:
        Tuple of (processed DataFrame, basic statistics dictionary)
    """
    # Calculate daily returns
    df['Returns'] = df['Close'].pct_change()
    
    # Calculate basic statistics
    stats = {
        'mean_return': df['Returns'].mean(),
        'std_dev': df['Returns'].std(),
        'min_price': df['Low'].min(),
        'max_price': df['High'].max(),
        'current_price': df['Close'].iloc[-1],
        'volume_avg': df['Volume'].mean()
    }
    
    return df, stats

def detect_outliers(df: pd.DataFrame, column: str, threshold: float = 3.0) -> List[pd.Timestamp]:
    """
    Detect outliers in a specific column using z-score method.
    
    Args:
        df: Stock data DataFrame
        column: Column to check for outliers
        threshold: Z-score threshold for outlier detection
        
    Returns:
        List of timestamps where outliers were detected
    """
    z_scores = np.abs((df[column] - df[column].mean()) / df[column].std())
    outlier_dates = df[z_scores > threshold].index.tolist()
    return outlier_dates

def resample_data(df: pd.DataFrame, freq: str = 'W') -> pd.DataFrame:
    """
    Resample data to a different frequency (e.g., daily to weekly).
    
    Args:
        df: Stock data DataFrame
        freq: Frequency to resample to ('D' for daily, 'W' for weekly, 'M' for monthly)
        
    Returns:
        Resampled DataFrame
    """
    resampled = df.resample(freq).agg({
        'Open': 'first',
        'High': 'max',
        'Low': 'min',
        'Close': 'last',
        'Volume': 'sum',
        'Returns': 'sum'
    })
    return resampled 