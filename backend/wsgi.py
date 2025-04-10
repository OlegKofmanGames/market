from main import app

# This is for WSGI - Gunicorn
app = app

if __name__ == "__main__":
    app.run() 