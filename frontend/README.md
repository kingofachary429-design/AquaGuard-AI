AquaGuard AI

Intelligent River Pollution Monitoring and Prediction System

AquaGuard AI is an AI-powered web application designed to monitor, report, analyze, and predict river pollution risks. The platform enables citizens to report pollution incidents and helps authorities monitor river health, review critical reports, analyze pollution trends, and take data-driven action.

Project Overview

River pollution is a serious environmental issue caused by industrial waste, sewage discharge, plastic waste, agricultural runoff, and other human activities. Traditional monitoring methods are often slow and depend heavily on manual inspections.

AquaGuard AI provides a centralized digital platform that combines citizen reporting, real-time dashboards, interactive maps, pollution analytics, and AI-based risk prediction to support faster and more effective river conservation.

Key Features

Secure user signup and login

Role-based access for Citizen, Authority, and Admin users

Citizen pollution incident reporting

Interactive river pollution map

AI-based pollution risk prediction

Prediction history and analytics

River health score monitoring

Water quality summary

Pollution source analysis

River health comparison

River pollution ranking

Real-time High and Critical alerts

Notification read and unread tracking

Authority action center

Critical reports management

Admin report management

Responsive navigation dashboard

Mobile-friendly interface

Firebase real-time database integration

User Roles

Citizen

Citizens can register, log in, report river pollution incidents, view river health information, use the AI pollution predictor, access reports, analytics, maps, and notifications.

Authority

Authorities can access all Citizen features, review critical incidents, update investigation status, record actions, and monitor High and Critical risk reports.

Admin

Admins can access all Authority features and manage pollution reports and administrative operations.

Technology Stack

Frontend

React

Vite

JavaScript

Tailwind CSS

React Router

Backend and Database

Firebase Authentication

Cloud Firestore

Firebase real-time listeners

Development and Deployment

Git

GitHub

Visual Studio Code

Vercel

Main Modules

Authentication System

Dashboard Overview

Citizen Pollution Reporting

AI Pollution Predictor

Prediction Analytics

Prediction History

River Pollution Map

Recent Reports

Notification Center

River Health Monitoring

Pollution Source Breakdown

AI Recommendations

Authority Action Center

Critical Reports Panel

Admin Report Management

Project Structure

AquaGuard-AI/
├── public/
├── src/
│   ├── components/
│   ├── hooks/
│   ├── pages/
│   ├── App.jsx
│   ├── firebase.js
│   ├── index.css
│   └── main.jsx
├── .env
├── .gitignore
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md

Installation

1. Clone the repository

git clone YOUR_GITHUB_REPOSITORY_URL

2. Open the project folder

cd AquaGuard-AI

3. Install dependencies

npm install

4. Create the environment file

Create a .env file in the project root:

VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

Do not upload the .env file to GitHub.

5. Start the development server

npm run dev

Production Build

npm run build

To preview the build locally:

npm run preview

Deployment on Vercel

Push the latest project changes to GitHub.

Log in to Vercel using GitHub.

Import the AquaGuard AI repository.

Select Vite as the framework.

Set the build command to npm run build.

Set the output directory to dist.

Add all Firebase environment variables.

Click Deploy.

Firestore Collections

users
pollutionReports
predictions
predictionHistory
pollutionPredictions
aiPredictions
pollutionAnalytics
notifications
rivers
waterQuality
riverHealth

Security

Firebase Authentication protects user accounts.

Protected routes prevent unauthorized dashboard access.

Firestore security rules control database access.

Role-based permissions protect Authority and Admin features.

Firebase configuration should be stored in environment variables.

Future Enhancements

IoT sensor integration

Live water-quality monitoring

Advanced machine learning models

SMS and email emergency alerts

Government dashboard integration

Satellite and weather-data integration

Pollution hotspot forecasting

Mobile application support

Multi-language support

Automated environmental reports

Project Objective

The objective of AquaGuard AI is to improve river pollution monitoring through artificial intelligence, citizen participation, real-time visualization, and role-based environmental management.

The system helps citizens and authorities identify pollution risks early, respond to critical incidents quickly, and make better decisions for river conservation.

Developed By

Kottapalli Dhananjaya Rao Achary

Academic Purpose

This project was developed for educational, research, innovation, and environmental awareness purposes.

License

This project is intended for academic and demonstration purposes. Permission from the developer is required before commercial use.