# MoneyAI - Stock Technical Analysis Platform

![MoneyAI Logo](frontend/public/favicon.svg)

MoneyAI is a modern web application that provides real-time technical analysis for stocks. It combines powerful data processing with an intuitive user interface to help investors make informed decisions.

## Features

- **Real-time Stock Analysis**: Get instant technical analysis for any stock symbol
- **Advanced Technical Indicators**:
  - Moving Averages (SMA, EMA)
  - Relative Strength Index (RSI)
  - Moving Average Convergence Divergence (MACD)
  - Bollinger Bands
- **Support and Resistance Levels**: Automatically detected key price levels
- **Interactive Charts**: Beautiful, responsive charts with zoom and pan capabilities
- **Modern UI**: Clean, professional interface with dark mode support
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

### Frontend
- React with TypeScript
- Material-UI for components
- Plotly.js for interactive charts
- Axios for API communication

### Backend
- Python with FastAPI
- yfinance for stock data
- pandas for data processing
- ta-lib for technical indicators

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Python (v3.8 or higher)
- pip (Python package manager)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/moneyai.git
cd moneyai
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd backend
pip install -r requirements.txt
```

### Running the Application

1. Start the backend server:
```bash
cd backend
uvicorn main:app --reload
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Usage

1. Enter a stock symbol (e.g., AAPL, GOOGL, MSFT) in the search bar
2. Press Enter or click the search button
3. View the technical analysis results:
   - Price chart with moving averages
   - RSI indicator
   - MACD indicator
   - Support and resistance levels

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Data provided by Yahoo Finance
- Technical indicators powered by TA-Lib
- Icons from Material Icons

## Contact

For any questions or suggestions, please open an issue in the GitHub repository.

---

© 2024 MoneyAI. All rights reserved. 