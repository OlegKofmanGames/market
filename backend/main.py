from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
import pandas as pd
import numpy as np
from ta.trend import SMAIndicator, EMAIndicator
from ta.momentum import RSIIndicator
from ta.volatility import BollingerBands
from ta.trend import MACD
from typing import Dict, List, Optional
import json

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.get("/search/{symbol}")
async def search_stock(symbol: str):
    """Search for a stock symbol and return basic information."""
    try:
        stock = yf.Ticker(symbol)
        info = stock.info
        return {
            "symbol": symbol,
            "name": info.get("longName", ""),
            "current_price": info.get("currentPrice", 0),
            "market_cap": info.get("marketCap", 0),
            "volume": info.get("volume", 0)
        }
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Stock not found: {str(e)}")

@app.get("/analysis/{symbol}")
async def get_stock_analysis(symbol: str, period: str = "1y"):
    """Get technical analysis data for a stock."""
    try:
        stock = yf.Ticker(symbol)
        df = stock.history(period=period)
        
        # Calculate technical indicators
        df['SMA_20'] = SMAIndicator(close=df['Close'], window=20).sma_indicator()
        df['EMA_20'] = EMAIndicator(close=df['Close'], window=20).ema_indicator()
        
        rsi = RSIIndicator(close=df['Close'])
        df['RSI'] = rsi.rsi()
        
        macd = MACD(close=df['Close'])
        df['MACD'] = macd.macd()
        df['MACD_Signal'] = macd.macd_signal()
        
        bb = BollingerBands(close=df['Close'])
        df['BB_upper'] = bb.bollinger_hband()
        df['BB_lower'] = bb.bollinger_lband()
        df['BB_middle'] = bb.bollinger_mavg()
        
        # Calculate support and resistance levels
        levels = calculate_support_resistance(df)
        
        # Prepare the response
        response = {
            "dates": df.index.strftime('%Y-%m-%d').tolist(),
            "prices": df['Close'].tolist(),
            "volumes": df['Volume'].tolist(),
            "indicators": {
                "SMA_20": df['SMA_20'].tolist(),
                "EMA_20": df['EMA_20'].tolist(),
                "RSI": df['RSI'].tolist(),
                "MACD": df['MACD'].tolist(),
                "MACD_Signal": df['MACD_Signal'].tolist(),
                "BB_upper": df['BB_upper'].tolist(),
                "BB_lower": df['BB_lower'].tolist(),
                "BB_middle": df['BB_middle'].tolist()
            },
            "levels": levels
        }
        
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing stock: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 