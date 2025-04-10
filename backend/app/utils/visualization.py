import plotly.graph_objects as go
from plotly.subplots import make_subplots
import pandas as pd
from typing import Dict, List, Optional

def create_candlestick_chart(df: pd.DataFrame, title: str = "Stock Price") -> go.Figure:
    """
    Create a candlestick chart with volume bars.
    
    Args:
        df: Stock data DataFrame
        title: Chart title
        
    Returns:
        Plotly figure object
    """
    fig = make_subplots(rows=2, cols=1, shared_xaxes=True, 
                        vertical_spacing=0.03, 
                        row_heights=[0.7, 0.3])

    # Add candlestick
    fig.add_trace(go.Candlestick(x=df.index,
                                open=df['Open'],
                                high=df['High'],
                                low=df['Low'],
                                close=df['Close'],
                                name='OHLC'),
                  row=1, col=1)

    # Add volume bars
    fig.add_trace(go.Bar(x=df.index, y=df['Volume'],
                        name='Volume'),
                  row=2, col=1)

    # Update layout
    fig.update_layout(
        title=title,
        yaxis_title='Price',
        yaxis2_title='Volume',
        xaxis_rangeslider_visible=False
    )

    return fig

def add_technical_indicators(fig: go.Figure, df: pd.DataFrame, 
                           indicators: Dict[str, pd.Series]) -> go.Figure:
    """
    Add technical indicators to an existing figure.
    
    Args:
        fig: Plotly figure object
        df: Stock data DataFrame
        indicators: Dictionary of indicator names and their values
        
    Returns:
        Updated Plotly figure
    """
    for name, values in indicators.items():
        fig.add_trace(go.Scatter(x=df.index, y=values,
                                name=name,
                                line=dict(width=1)),
                     row=1, col=1)
    
    return fig

def create_indicator_chart(df: pd.DataFrame, 
                         indicator_name: str,
                         indicator_values: pd.Series,
                         title: str = "Technical Indicator") -> go.Figure:
    """
    Create a separate chart for a technical indicator.
    
    Args:
        df: Stock data DataFrame
        indicator_name: Name of the indicator
        indicator_values: Indicator values
        title: Chart title
        
    Returns:
        Plotly figure object
    """
    fig = make_subplots(rows=2, cols=1, shared_xaxes=True,
                        vertical_spacing=0.03,
                        row_heights=[0.7, 0.3])

    # Add price line
    fig.add_trace(go.Scatter(x=df.index, y=df['Close'],
                            name='Price',
                            line=dict(width=1)),
                  row=1, col=1)

    # Add indicator
    fig.add_trace(go.Scatter(x=df.index, y=indicator_values,
                            name=indicator_name,
                            line=dict(width=1)),
                  row=2, col=1)

    # Update layout
    fig.update_layout(
        title=title,
        yaxis_title='Price',
        yaxis2_title=indicator_name,
        xaxis_rangeslider_visible=False
    )

    return fig

def create_correlation_heatmap(df: pd.DataFrame, 
                             columns: Optional[List[str]] = None) -> go.Figure:
    """
    Create a correlation heatmap for selected columns.
    
    Args:
        df: DataFrame with numerical data
        columns: List of columns to include (default: all numerical columns)
        
    Returns:
        Plotly figure object
    """
    if columns is None:
        columns = df.select_dtypes(include=['float64', 'int64']).columns
    
    corr_matrix = df[columns].corr()
    
    fig = go.Figure(data=go.Heatmap(
        z=corr_matrix,
        x=columns,
        y=columns,
        colorscale='RdBu',
        zmin=-1,
        zmax=1
    ))
    
    fig.update_layout(
        title='Correlation Heatmap',
        xaxis_title='Features',
        yaxis_title='Features'
    )
    
    return fig 