from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
import pandas as pd
import numpy as np
from ta.trend import SMAIndicator, EMAIndicator, MACD
from ta.momentum import RSIIndicator
from ta.volatility import BollingerBands
from typing import Dict, List, Optional, Any
import logging
import traceback
import requests
import time
import random
from app.utils.data_processor import clean_stock_data, prepare_data_for_analysis, detect_outliers, resample_data
from app.utils.indicators import get_indicators

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI()

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

def rate_limit():
    """Implement rate limiting to avoid hitting Yahoo Finance API limits."""
    global last_request_time
    current_time = time.time()
    elapsed = current_time - last_request_time
    
    if elapsed < RATE_LIMIT_DELAY:
        sleep_time = RATE_LIMIT_DELAY - elapsed + random.uniform(0.1, 0.2)
        logger.info(f"Rate limiting: sleeping for {sleep_time:.2f} seconds")
        time.sleep(sleep_time)
    
    last_request_time = time.time()

def validate_stock_symbol(symbol: str) -> bool:
    """Validate if a stock symbol exists."""
    try:
        # Apply rate limiting
        rate_limit()
        
        # Create Ticker object
        stock = yf.Ticker(symbol)
        logger.info(f"Created Ticker object for {symbol}")
        
        # Try to get a small amount of data to validate the symbol
        logger.info(f"Validating symbol {symbol}")
        df = stock.history(period="1d")
        
        # Log the dataframe info
        logger.info(f"DataFrame shape: {df.shape}")
        logger.info(f"DataFrame columns: {df.columns.tolist()}")
        if not df.empty:
            logger.info(f"First row: {df.iloc[0].to_dict()}")
            logger.info(f"Last row: {df.iloc[-1].to_dict()}")
        
        # Check if we have any data
        if df.empty:
            logger.warning(f"Empty dataframe received for {symbol}")
            return False
            
        # Check if we have valid price data by looking at the last row
        try:
            last_close = df['Close'].iloc[-1]
            logger.info(f"Last close price: {last_close}")
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
    """Search for a stock symbol and return basic information."""
    try:
        logger.info(f"Searching for stock: {symbol}")
        
        # Apply rate limiting
        rate_limit()
        
        # Create Ticker object and get info
        stock = yf.Ticker(symbol)
        logger.info(f"Created Ticker object for {symbol}")
        
        try:
            fast_info = stock.fast_info
            logger.info(f"Got fast info: {fast_info}")
            
            if not fast_info or not fast_info.last_price:
                logger.error(f"No valid info found for {symbol}")
                raise HTTPException(status_code=404, detail=f"Stock symbol '{symbol}' not found or invalid")
            
            # Get the company name
            try:
                info = stock.info
                name = info.get('longName', info.get('shortName', symbol))
            except Exception as e:
                logger.warning(f"Could not get company name for {symbol}: {str(e)}")
                name = symbol
            
            result = {
                "symbol": symbol,
                "name": name,
                "current_price": float(fast_info.last_price),
                "market_cap": getattr(fast_info, 'market_cap', 0),
                "volume": getattr(fast_info, 'last_volume', 0)
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
async def get_stock_analysis(symbol: str, period: str = "1y"):
    """Get technical analysis data for a stock."""
    try:
        logger.info(f"Starting analysis for {symbol} with period {period}")
        
        # Apply rate limiting
        rate_limit()
        
        # Validate the stock symbol first
        if not validate_stock_symbol(symbol):
            raise HTTPException(status_code=404, detail=f"Stock symbol '{symbol}' not found or invalid")
        
        # Fetch stock data
        logger.info(f"Fetching data for {symbol}")
        stock = yf.Ticker(symbol)
        
        # Use a more reliable approach to fetch data
        try:
            df = stock.history(period=period)
        except Exception as e:
            logger.error(f"Error fetching history: {str(e)}")
            # Try alternative approach
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
            logger.info("SMA and EMA calculated")
        except Exception as e:
            logger.error(f"Error calculating SMA/EMA: {str(e)}")
            raise
        
        try:
            rsi = RSIIndicator(close=df['Close'])
            df['RSI'] = rsi.rsi()
            logger.info("RSI calculated")
        except Exception as e:
            logger.error(f"Error calculating RSI: {str(e)}")
            raise
        
        try:
            macd = MACD(close=df['Close'])
            df['MACD'] = macd.macd()
            df['MACD_Signal'] = macd.macd_signal()
            logger.info("MACD calculated")
        except Exception as e:
            logger.error(f"Error calculating MACD: {str(e)}")
            raise
        
        try:
            bb = BollingerBands(close=df['Close'])
            df['BB_upper'] = bb.bollinger_hband()
            df['BB_lower'] = bb.bollinger_lband()
            df['BB_middle'] = bb.bollinger_mavg()
            logger.info("Bollinger Bands calculated")
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
async def get_stock_indicators(symbol: str) -> Dict[str, Any]:
    """
    Get technical indicators for a stock symbol.
    """
    try:
        # Validate the stock symbol first
        if not validate_stock_symbol(symbol):
            raise HTTPException(status_code=404, detail=f"Stock symbol '{symbol}' not found or invalid")
        
        # Get indicators data
        indicators_data = get_indicators(symbol)
        
        return indicators_data
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logging.error(f"Error getting indicators for {symbol}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 