# Stock Technical Analysis Web App

A modern web application for technical stock analysis with interactive charts and indicators.

## Features

- Stock search by symbol
- Interactive price charts with technical indicators
- Moving averages (SMA, EMA)
- RSI (Relative Strength Index)
- MACD (Moving Average Convergence Divergence)
- Bollinger Bands
- Support and resistance levels
- Responsive design for desktop and mobile

## Tech Stack

- Frontend: React with TypeScript, Material-UI, Plotly.js
- Backend: FastAPI, Python
- Data: yfinance, pandas, ta (Technical Analysis library)

## Setup

### Backend

1. Create a virtual environment:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r ../requirements.txt
```

2. Run the backend server:
```bash
cd backend
uvicorn main:app --reload
```

### Frontend

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Run the development server:
```bash
npm run dev
```

## Usage

1. Open your browser and navigate to `http://localhost:5173`
2. Enter a stock symbol (e.g., AAPL, GOOGL, MSFT)
3. Press Enter to load the technical analysis
4. View the interactive charts and indicators

## API Endpoints

- `GET /search/{symbol}` - Get basic stock information
- `GET /analysis/{symbol}` - Get technical analysis data

## License

MIT 