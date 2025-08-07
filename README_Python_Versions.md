# Hospital Management System - Python Versions

This repository contains two Python implementations of the Hospital Management System with 3 modules:

## 🌐 Flask Web Application

### Files:
- `flask_hospital_app.py` - Main Flask application
- `templates/` folder with HTML templates
- `requirements.txt` - Python dependencies

### Installation & Running:
```bash
# Install dependencies
pip install -r requirements.txt

# Run the Flask app
python flask_hospital_app.py

# Open browser to: http://localhost:5000
```

### Features:
- **Analytics & AI Dashboard**: System metrics, charts, AI predictions
- **Patient & Bed Management**: Register patients, allocate beds automatically/manually
- **Discharge Management**: View allocated patients, discharge functionality

## 🖥️ Desktop Application (Tkinter)

### Files:
- `hospital_desktop_app.py` - Complete desktop application

### Installation & Running:
```bash
# No additional dependencies needed (tkinter is built into Python)
python hospital_desktop_app.py
```

### Features:
- **3 Module Tabs**: Analytics, Patient & Bed Management, Discharge
- **Patient Registration Form**: Name, age, priority, condition, estimated stay
- **Bed Allocation**: Auto and manual allocation with real-time updates
- **Waiting Queue**: Visual display of patients waiting for beds
- **Discharge Management**: View allocated patients with vital signs, discharge functionality

## 🏥 System Capabilities

Both versions include:

### 1. Analytics & AI Module
- Total patients, occupied beds, waiting queue metrics
- Bed utilization percentage
- AI predictions for patient arrivals and resource alerts
- System efficiency recommendations

### 2. Patient & Bed Management Module
- Patient registration with medical details
- Priority-based scheduling (Critical > High > Medium > Low)
- Automatic bed allocation using priority algorithms
- Manual bed assignment with dropdown selectors
- Real-time waiting queue display
- Bed overview with status tracking

### 3. Discharge Management Module
- Critical care patient highlighting
- Allocated patient overview with vital signs
- Patient discharge functionality
- Bed availability updates after discharge

## 💾 Data Models

### Patient
- ID, name, age, priority level
- Medical condition and estimated stay
- Arrival time and vital signs
- Medical history and allergies
- Emergency contact information

### Bed
- ID, number, ward assignment
- Status (available, occupied, maintenance)
- Patient assignment tracking

### Hospital Wards
- ICU, Emergency, General, Surgery
- 5 beds per ward (20 total beds)

## 🚀 Quick Start

### For Web Version:
1. Download `flask_hospital_app.py` and `templates/` folder
2. Install Flask: `pip install flask`
3. Run: `python flask_hospital_app.py`
4. Access: http://localhost:5000

### For Desktop Version:
1. Download `hospital_desktop_app.py`
2. Run: `python hospital_desktop_app.py`
3. Use the tabbed interface to navigate modules

Both versions maintain the same functionality and data models, allowing you to choose between web-based or desktop deployment based on your needs.