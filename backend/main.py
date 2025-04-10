"""
MoneyAI Stock Analysis API

This module provides a FastAPI application that serves as the backend for the MoneyAI stock analysis platform.
It offers endpoints for fetching stock data, calculating technical indicators, and performing technical analysis.

The API uses Yahoo Finance (yfinance) for stock data and various technical analysis libraries
for calculating indicators and performing analysis.

Endpoints:
    /search/{symbol}: Search for a stock symbol and get basic information
    /analysis/{symbol}: Get technical analysis data for a stock
    /indicators/{symbol}: Get technical indicators for a stock

Author: Your Name
Version: 1.0.0
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
import pandas as pd
import numpy as np
from ta.trend import SMAIndicator, EMAIndicator, MACD
from ta.momentum import RSIIndicator
from ta.volatility import BollingerBands
from typing import Dict, Optional, Any
import logging
import traceback
import requests
import time
import random
from datetime import datetime
from app.utils.indicators import get_indicators

# Set up logging with more detailed format
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="MoneyAI Stock Analysis API",
    description="API for stock technical analysis and indicators",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiting settings
RATE_LIMIT_DELAY = 0.5  # seconds between requests
last_request_time = 0

def apply_rate_limit():
    """
    Implement rate limiting to avoid hitting Yahoo Finance API limits.
    
    This function ensures that requests to the Yahoo Finance API are spaced out
    to avoid rate limiting issues. It adds a small random delay between requests.
    
    Returns:
        None
    """
    global last_request_time
    current_time = time.time()
    elapsed = current_time - last_request_time
    
    if elapsed < RATE_LIMIT_DELAY:
        sleep_time = RATE_LIMIT_DELAY - elapsed + random.uniform(0.1, 0.2)
        logger.debug(f"Rate limiting: sleeping for {sleep_time:.2f} seconds")
        time.sleep(sleep_time)
    
    last_request_time = time.time()

def is_valid_stock_symbol(symbol: str) -> bool:
    """
    Validate if a stock symbol exists and is tradeable.
    
    This function checks if a given stock symbol is valid and can be traded
    by attempting to fetch a small amount of data for the symbol.
    
    Args:
        symbol (str): The stock symbol to validate
        
    Returns:
        bool: True if the symbol is valid, False otherwise
        
    Raises:
        requests.exceptions.HTTPError: If there's an HTTP error during validation
    """
    try:
        # Apply rate limiting
        apply_rate_limit()
        
        # Create Ticker object
        stock = yf.Ticker(symbol)
        logger.debug(f"Created Ticker object for {symbol}")
        
        # Try to get a small amount of data to validate the symbol
        logger.info(f"Validating symbol {symbol}")
        df = stock.history(period="1d")
        
        # Log the dataframe info
        logger.debug(f"DataFrame shape: {df.shape}")
        logger.debug(f"DataFrame columns: {df.columns.tolist()}")
        if not df.empty:
            logger.debug(f"First row: {df.iloc[0].to_dict()}")
            logger.debug(f"Last row: {df.iloc[-1].to_dict()}")
        
        # Check if we have any data
        if df.empty:
            logger.warning(f"Empty dataframe received for {symbol}")
            return False
            
        # Check if we have valid price data by looking at the last row
        try:
            last_close = df['Close'].iloc[-1]
            logger.debug(f"Last close price: {last_close}")
            if pd.isna(last_close):
                logger.warning(f"No valid price data for {symbol}")
                return False
        except Exception as e:
            logger.error(f"Error accessing Close price: {str(e)}")
            return False
            
        logger.info(f"Valid data found for {symbol}: last close price = {last_close}")
        return True
    except requests.exceptions.HTTPError as e:
        if e.response and e.response.status_code == 429:
            logger.error(f"Rate limit exceeded for symbol {symbol}")
            time.sleep(2)  # Add extra delay on rate limit
            return False
        logger.error(f"HTTP error validating stock symbol {symbol}: {str(e)}")
        return False
    except Exception as e:
        logger.error(f"Error validating stock symbol {symbol}: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        return False

@app.get("/search/{symbol}")
async def search_stock(symbol: str):
    """
    Search for a stock symbol and return basic information.
    
    This endpoint searches for a stock symbol and returns basic information
    about the stock, including its name, current price, market cap, and volume.
    
    Args:
        symbol (str): The stock symbol to search for
        
    Returns:
        dict: A dictionary containing basic stock information
        
    Raises:
        HTTPException: If the symbol is not found or there's an error
    """
    try:
        logger.info(f"Searching for stock: {symbol}")
        
        # Apply rate limiting
        apply_rate_limit()
        
        # Create Ticker object and get info
        stock = yf.Ticker(symbol)
        logger.debug(f"Created Ticker object for {symbol}")
        
        try:
            fast_info = stock.fast_info
            logger.debug(f"Got fast info: {fast_info}")
            
            if not fast_info or not fast_info.last_price:
                logger.error(f"No valid info found for {symbol}")
                raise HTTPException(status_code=404, detail=f"Stock symbol '{symbol}' not found or invalid")
            
            # Get the company info
            try:
                info = stock.info
                name = info.get('longName', info.get('shortName', symbol))
                sector = info.get('sector', 'N/A')
                industry = info.get('industry', 'N/A')
                pe_ratio = info.get('trailingPE', None)
                dividend_yield = info.get('dividendYield', None)
                fifty_two_week_high = info.get('fiftyTwoWeekHigh', None)
                fifty_two_week_low = info.get('fiftyTwoWeekLow', None)
            except Exception as e:
                logger.warning(f"Could not get company info for {symbol}: {str(e)}")
                name = symbol
                sector = 'N/A'
                industry = 'N/A'
                pe_ratio = None
                dividend_yield = None
                fifty_two_week_high = None
                fifty_two_week_low = None
            
            result = {
                "symbol": symbol,
                "name": name,
                "current_price": float(fast_info.last_price),
                "market_cap": getattr(fast_info, 'market_cap', 0),
                "volume": getattr(fast_info, 'last_volume', 0),
                "pe_ratio": pe_ratio,
                "dividend_yield": dividend_yield,
                "sector": sector,
                "industry": industry,
                "fifty_two_week_high": fifty_two_week_high,
                "fifty_two_week_low": fifty_two_week_low
            }
            logger.info(f"Stock search completed: {result}")
            return result
            
        except AttributeError as e:
            logger.error(f"Attribute error for {symbol}: {str(e)}")
            raise HTTPException(status_code=404, detail=f"Stock symbol '{symbol}' not found or invalid")
            
    except HTTPException:
        raise
    except requests.exceptions.HTTPError as e:
        if e.response and e.response.status_code == 429:
            logger.error(f"Rate limit exceeded for symbol {symbol}")
            raise HTTPException(status_code=429, detail="Rate limit exceeded. Please try again later.")
        logger.error(f"HTTP error searching stock {symbol}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error searching stock: {str(e)}")
    except Exception as e:
        logger.error(f"Error searching stock {symbol}: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error searching stock: {str(e)}")

@app.get("/analysis/{symbol}")
async def get_stock_analysis(
    symbol: str,
    start_date: Optional[str] = Query(None, description="Start date in YYYY-MM-DD format"),
    end_date: Optional[str] = Query(None, description="End date in YYYY-MM-DD format"),
    period: Optional[str] = Query("1y", description="Time period (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)")
):
    """
    Get technical analysis data for a stock.
    
    This endpoint fetches historical data for a stock and calculates various
    technical indicators, including moving averages, RSI, MACD, and Bollinger Bands.
    It also detects support and resistance levels.
    
    Args:
        symbol (str): The stock symbol to analyze
        start_date (str, optional): Start date in YYYY-MM-DD format
        end_date (str, optional): End date in YYYY-MM-DD format
        period (str, optional): Time period for the analysis
        
    Returns:
        dict: A dictionary containing the technical analysis data
        
    Raises:
        HTTPException: If there's an error fetching or processing the data
    """
    try:
        logger.info(f"Starting analysis for {symbol} with period {period}, start_date: {start_date}, end_date: {end_date}")
        
        # Apply rate limiting
        apply_rate_limit()
        
        # Validate the stock symbol first
        if not is_valid_stock_symbol(symbol):
            raise HTTPException(status_code=404, detail=f"Stock symbol '{symbol}' not found or invalid")
        
        # Fetch stock data
        logger.info(f"Fetching data for {symbol}")
        stock = yf.Ticker(symbol)
        
        # Use a more reliable approach to fetch data
        try:
            if start_date and end_date:
                # Convert string dates to datetime
                start = pd.to_datetime(start_date)
                end = pd.to_datetime(end_date)
                
                # Validate dates
                if start > end:
                    raise HTTPException(status_code=400, detail="Start date must be before end date")
                if end > datetime.now():
                    raise HTTPException(status_code=400, detail="End date cannot be in the future")
                
                df = stock.history(start=start, end=end)
            else:
                df = stock.history(period=period)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=f"Invalid date format: {str(e)}")
        except Exception as e:
            logger.error(f"Error fetching history: {str(e)}")
            # Try alternative approach
            if start_date and end_date:
                df = yf.download(symbol, start=start_date, end=end_date, progress=False)
            else:
                df = yf.download(symbol, period=period, progress=False)
        
        if df.empty:
            logger.error(f"No data found for {symbol}")
            raise HTTPException(status_code=404, detail=f"No historical data found for symbol '{symbol}'. The stock may be delisted or not available.")
        
        logger.info(f"Data fetched successfully. Shape: {df.shape}")
        
        # Calculate technical indicators
        logger.info("Calculating technical indicators")
        try:
            df['SMA_20'] = SMAIndicator(close=df['Close'], window=20).sma_indicator()
            df['EMA_20'] = EMAIndicator(close=df['Close'], window=20).ema_indicator()
            logger.debug("SMA and EMA calculated")
        except Exception as e:
            logger.error(f"Error calculating SMA/EMA: {str(e)}")
            raise
        
        try:
            rsi = RSIIndicator(close=df['Close'])
            df['RSI'] = rsi.rsi()
            logger.debug("RSI calculated")
        except Exception as e:
            logger.error(f"Error calculating RSI: {str(e)}")
            raise
        
        try:
            macd = MACD(close=df['Close'])
            df['MACD'] = macd.macd()
            df['MACD_Signal'] = macd.macd_signal()
            logger.debug("MACD calculated")
        except Exception as e:
            logger.error(f"Error calculating MACD: {str(e)}")
            raise
        
        try:
            bb = BollingerBands(close=df['Close'])
            df['BB_upper'] = bb.bollinger_hband()
            df['BB_lower'] = bb.bollinger_lband()
            df['BB_middle'] = bb.bollinger_mavg()
            logger.debug("Bollinger Bands calculated")
        except Exception as e:
            logger.error(f"Error calculating Bollinger Bands: {str(e)}")
            raise
        
        # Prepare the response
        logger.info("Preparing response")
        response = {
            "dates": df.index.strftime('%Y-%m-%d').tolist(),
            "prices": df['Close'].tolist(),
            "volumes": df['Volume'].tolist(),
            "indicators": {
                "SMA_20": df['SMA_20'].fillna(0).tolist(),
                "EMA_20": df['EMA_20'].fillna(0).tolist(),
                "RSI": df['RSI'].fillna(0).tolist(),
                "MACD": df['MACD'].fillna(0).tolist(),
                "MACD_Signal": df['MACD_Signal'].fillna(0).tolist(),
                "BB_upper": df['BB_upper'].fillna(0).tolist(),
                "BB_lower": df['BB_lower'].fillna(0).tolist(),
                "BB_middle": df['BB_middle'].fillna(0).tolist()
            }
        }
        
        logger.info(f"Successfully processed data for {symbol}")
        return response
    except HTTPException:
        raise
    except requests.exceptions.HTTPError as e:
        if e.response and e.response.status_code == 429:
            logger.error(f"Rate limit exceeded for symbol {symbol}")
            raise HTTPException(status_code=429, detail="Rate limit exceeded. Please try again later.")
        logger.error(f"HTTP error analyzing stock {symbol}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error analyzing stock: {str(e)}")
    except Exception as e:
        logger.error(f"Error analyzing stock {symbol}: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error analyzing stock: {str(e)}")

@app.get("/indicators/{symbol}")
async def get_stock_indicators(
    symbol: str,
    start_date: Optional[str] = Query(None, description="Start date in YYYY-MM-DD format"),
    end_date: Optional[str] = Query(None, description="End date in YYYY-MM-DD format"),
    period: Optional[str] = Query("1y", description="Time period (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)")
) -> Dict[str, Any]:
    """
    Get technical indicators for a stock symbol.
    
    This endpoint calculates various technical indicators for a stock,
    including RSI, MACD, and Death Cross signals. It provides both
    the indicator values and their interpretations.
    
    Args:
        symbol (str): The stock symbol to analyze
        start_date (str, optional): Start date in YYYY-MM-DD format
        end_date (str, optional): End date in YYYY-MM-DD format
        period (str, optional): Time period for the analysis
        
    Returns:
        Dict[str, Any]: A dictionary containing the technical indicators
        
    Raises:
        HTTPException: If there's an error calculating the indicators
    """
    try:
        # Validate the stock symbol first
        if not is_valid_stock_symbol(symbol):
            raise HTTPException(status_code=404, detail=f"Stock symbol '{symbol}' not found or invalid")
        
        # Get indicators data with time filter
        try:
            if start_date and end_date:
                # Convert string dates to datetime
                start = pd.to_datetime(start_date)
                end = pd.to_datetime(end_date)
                
                # Validate dates
                if start > end:
                    raise HTTPException(status_code=400, detail="Start date must be before end date")
                if end > datetime.now():
                    raise HTTPException(status_code=400, detail="End date cannot be in the future")
                    
                indicators_data = get_indicators(symbol, start_date=start, end_date=end)
            else:
                indicators_data = get_indicators(symbol, period=period)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=f"Invalid date format: {str(e)}")
        
        return indicators_data
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logging.error(f"Error getting indicators for {symbol}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 