import yfinance as yf
import pandas as pd
from typing import Dict, Optional, Tuple

def fetch_stock_data(symbol: str, period: str = "1y") -> Tuple[Optional[pd.DataFrame], Optional[str]]:
    """
    Fetch stock data from Yahoo Finance.
    
    Args:
        symbol: Stock symbol
        period: Time period to fetch (default: "1y")
        
    Returns:
        Tuple of (DataFrame with stock data, error message if any)
    """
    try:
        stock = yf.Ticker(symbol)
        df = stock.history(period=period)
        
        if df.empty:
            return None, f"No data found for symbol {symbol}"
            
        return df, None
        
    except Exception as e:
        return None, f"Error fetching data for {symbol}: {str(e)}"

def get_stock_info(symbol: str) -> Tuple[Optional[Dict], Optional[str]]:
    """
    Get basic stock information.
    
    Args:
        symbol: Stock symbol
        
    Returns:
        Tuple of (stock info dictionary, error message if any)
    """
    try:
        stock = yf.Ticker(symbol)
        info = stock.info
        
        return {
            "name": info.get("longName", symbol),
            "sector": info.get("sector", "N/A"),
            "industry": info.get("industry", "N/A"),
            "market_cap": info.get("marketCap", "N/A"),
            "pe_ratio": info.get("trailingPE", "N/A"),
            "dividend_yield": info.get("dividendYield", "N/A"),
            "52_week_high": info.get("fiftyTwoWeekHigh", "N/A"),
            "52_week_low": info.get("fiftyTwoWeekLow", "N/A")
        }, None
        
    except Exception as e:
        return None, f"Error fetching stock info for {symbol}: {str(e)}" 