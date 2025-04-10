# MoneyAI - Stock Technical Analysis Platform

MoneyAI is a modern web application that provides real-time stock technical analysis and indicators. It combines powerful backend analysis with a beautiful, responsive frontend interface.

## Features

- Real-time stock data analysis
- Technical indicators (RSI, MACD, Death Cross)
- Interactive charts with multiple timeframes
- Support and resistance level detection
- Modern, responsive UI with dark mode
- Glass-morphism design elements

## Tech Stack

### Frontend
- React with TypeScript
- Material-UI for components
- Plotly.js for interactive charts
- Axios for API communication

### Backend
- FastAPI (Python)
- yfinance for stock data
- Technical Analysis (ta) library
- Pandas for data processing

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- npm or yarn

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

## API Documentation

The backend provides the following endpoints:

### Stock Analysis
- `GET /analysis/{symbol}` - Get technical analysis data for a stock
  - Query parameters:
    - `period`: Time period (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)
    - `start_date`: Optional start date (YYYY-MM-DD)
    - `end_date`: Optional end date (YYYY-MM-DD)

### Technical Indicators
- `GET /indicators/{symbol}` - Get technical indicators for a stock
  - Query parameters:
    - `period`: Time period
    - `start_date`: Optional start date
    - `end_date`: Optional end date

### Stock Search
- `GET /search/{symbol}` - Search for a stock symbol and get basic information

## Project Structure

```
moneyai/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── StockAnalysis.tsx
│   │   │   ├── Indicators.tsx
│   │   │   ├── Logo.tsx
│   │   │   └── Footer.tsx
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── app/
│       └── utils/
│           └── indicators.py
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Yahoo Finance for providing stock data
- Technical Analysis library for indicators
- Material-UI for the component library
- Plotly.js for charting capabilities

## Contact

For any questions or suggestions, please open an issue in the GitHub repository.

---

© 2024 MoneyAI. All rights reserved. 