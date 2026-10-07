# Corn_Pest_Infestation

Corn Crop Pest Infestation Prediction system using Machine Learning and a full-stack web application.

## Overview

This project provides an end-to-end Machine Learning pipeline and web interface to analyze environmental, crop, and soil conditions to predict the likelihood and type of corn crop pest infestation, assess risk levels, and recommend targeted control measures.

## Architecture

- **Backend**: Python Flask REST API
  - Machine learning classification pipeline (`scikit-learn`, `joblib`, `pandas`, `numpy`)
  - SQLite database for logs and prediction history
  - Dataset exploratory data analysis and feature importance endpoints
- **Frontend**: React + Vite SPA
  - Modern dashboard with interactive charts (`recharts`, `lucide-react`)
  - Real-time pest infestation predictor with instant risk analysis
  - Historical predictions log and dataset inspection
- **Dataset**: Comprehensive corn crop agro-climatic dataset with growth stages, weather parameters, and pest infestation records.

## Getting Started

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python app.py
```
Backend runs on `http://localhost:5000`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:3000`.
