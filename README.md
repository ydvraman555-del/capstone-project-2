# Global Greenhouse Gas Emissions Prediction and Analysis

A full-stack machine learning capstone project that analyzes, predicts, and forecasts global greenhouse gas emissions using real-world environmental data, deployed as an interactive web application.

---

## Live Demo

Access the deployed web application here:  https://capstone-project-2-two-pi.vercel.app/

---

## Project Overview

Climate change is one of the most critical global challenges.  
This project integrates machine learning with full-stack development to analyze greenhouse gas emissions (CO2, CH4, N2O), generate predictions, and forecast future emission trends.

It combines data analysis, predictive modeling, and deployment into a complete end-to-end solution.

---

## Problem Statement

The objective is to:

- Predict greenhouse gas emission values  
- Forecast future emission trends  

based on:

- Country (Area)  
- Type of emission (CO2, CH4, N2O)  
- Year (time-based feature)  

---

## Tech Stack

### Machine Learning & Data
- Python  
- Pandas, NumPy  
- Scikit-learn  
- XGBoost  

### Visualization
- Matplotlib  
- Seaborn  
- Plotly  

### Frontend
- React.js  
- JavaScript  
- Framer Motion  

### Backend
- Node.js  
- Express.js  

### Deployment
- Frontend: Vercel  
- Backend API: Render  
- Model Serialization: Pickle  

---

## Workflow Pipeline

Data Collection → Data Cleaning → EDA → Encoding → Feature Engineering → Model Training → Evaluation → Forecasting → Backend API → Frontend Integration → Deployment

---

## Key Steps

- Performed data preprocessing and validation (no missing values)  
- Conducted detailed exploratory data analysis and trend visualization  
- Applied label encoding for categorical variables  
- Treated "Year" as a numerical feature for time-based learning  
- Trained multiple regression models  
- Compared models based on performance metrics  
- Selected best model (Random Forest)  
- Implemented time-based forecasting to predict future emissions  
- Built backend API using Node.js to serve predictions  
- Developed frontend interface using React.js  
- Integrated API with frontend for real-time predictions  
- Added animations using Framer Motion  
- Deployed frontend on Vercel and backend on Render  

---

## Models Implemented

### Baseline Models
- Linear Regression  
- Lasso Regression  
- Ridge Regression  
- ElasticNet Regression  

### Advanced Models
- K-Nearest Neighbors Regressor  
- Decision Tree Regressor  
- Random Forest Regressor  
- XGBoost Regressor  

---

## Evaluation Metrics

- R² Score  
- Mean Absolute Error (MAE)  
- Mean Squared Error (MSE)  
- Root Mean Squared Error (RMSE)  

---

## Results & Performance

| Model                     | R² Score |
|--------------------------|----------|
| Linear / Lasso / Ridge   | ~0.004   |
| KNN                      | ~0.28    |
| Decision Tree            | ~0.988   |
| Random Forest            | ~0.993 (Best) |
| XGBoost                  | ~0.91    |

---

## Forecasting Capability

- Used "Year" as a continuous variable to model emission trends  
- Predicted emission values for future years beyond available data  
- Observed a gradual declining trend in emissions over time  
- Enabled future scenario analysis through the web application  

---

## Key Insights

- CO2 emissions dominate global greenhouse gas emissions  
- Emissions show a gradual declining trend over time with fluctuations  
- Brazil and Indonesia are among the highest contributors  
- CH4 and N2O show strong correlation, while CO2 varies independently  
- Linear models fail to capture complex patterns  
- Tree-based models significantly outperform linear models  
- Random Forest achieved the best performance  

---

## Features of Web Application

- User-friendly interface for prediction  
- Real-time emission prediction  
- Future emission forecasting  
- Interactive visualizations  
- Smooth UI animations using Framer Motion  
- Seamless frontend-backend integration  

---

## Visualizations

- Year-wise emission trends  
- Top emitting countries  
- CO2 vs CH4 analysis  
- Emission distribution plots  
- Correlation heatmap  
- Interactive Plotly charts  
- Model comparison graphs  
- Forecasted trend visualization  

---

## Model Optimization Techniques

- Model comparison across multiple algorithms  
- Performance evaluation using multiple metrics  
- Selection of best-performing model  
- Efficient model deployment using pickle  

---

## Conclusion

This project demonstrates the integration of machine learning with full-stack development and time-based forecasting to solve real-world environmental problems.

It highlights:
- The importance of temporal data in prediction  
- The effectiveness of ensemble models  
- The ability to deploy ML models into production  

---

## Future Improvements

- Use advanced time-series models (ARIMA, LSTM)  
- Integrate real-time environmental APIs  
- Improve forecasting accuracy with feature engineering  
- Deploy on scalable cloud infrastructure  

---

## Key Highlights

- Full-stack machine learning project  
- Real-world environmental dataset  
- High accuracy model (Random Forest ~0.993 R²)  
- Time-based forecasting capability  
- Deployment using Vercel and Render  
- End-to-end production-ready pipeline  

---

## Acknowledgment

This capstone project enhanced my skills in machine learning, time-based prediction, backend development, frontend design, and deploying complete data science solutions.
