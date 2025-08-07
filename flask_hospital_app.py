from flask import Flask, render_template, request, jsonify, redirect, url_for
from datetime import datetime, timedelta
import json
import uuid
import random

app = Flask(__name__)

# Data Models
class Patient:
    def __init__(self, name, age, priority, condition, estimated_stay, medical_history="", allergies="", emergency_contact=None):
        self.id = str(uuid.uuid4())
        self.name = name
        self.age = age
        self.priority = priority
        self.condition = condition
        self.arrival_time = datetime.now()
        self.estimated_stay = estimated_stay
        self.bed_id = None
        self.medical_history = medical_history.split(',') if medical_history else []
        self.allergies = allergies.split(',') if allergies else []
        self.emergency_contact = emergency_contact or {}
        self.vital_signs = self.generate_vital_signs()
        
    def generate_vital_signs(self):
        return {
            'heart_rate': random.randint(60, 120),
            'blood_pressure': f"{random.randint(110, 140)}/{random.randint(70, 90)}",
            'temperature': round(random.uniform(97.0, 102.0), 1),
            'oxygen_saturation': random.randint(95, 100),
            'respiratory_rate': random.randint(12, 25)
        }

class Bed:
    def __init__(self, number, ward, status='available'):
        self.id = str(uuid.uuid4())
        self.number = number
        self.ward = ward
        self.status = status
        self.patient_id = None

# Global Data Storage
patients = []
beds = []
waiting_queue = []
metrics = {
    'total_patients': 0,
    'admitted_today': 0,
    'discharged_today': 0,
    'average_wait_time': 0,
    'bed_utilization': 0,
    'critical_patients': 0,
    'emergency_level': 'none'
}

# Initialize sample data
def initialize_data():
    global beds
    wards = ['ICU', 'Emergency', 'General', 'Surgery']
    for ward in wards:
        for i in range(1, 6):
            beds.append(Bed(f"{ward[0]}{i}", ward))

initialize_data()

@app.route('/')
def index():
    update_metrics()
    return render_template('index.html', 
                         patients=patients, 
                         beds=beds, 
                         waiting_queue=waiting_queue, 
                         metrics=metrics)

@app.route('/analytics')
def analytics():
    update_metrics()
    return render_template('analytics.html', metrics=metrics, patients=patients, beds=beds)

@app.route('/patient_bed_management')
def patient_bed_management():
    available_beds = [b for b in beds if b.status == 'available']
    return render_template('patient_bed_management.html', 
                         patients=patients, 
                         beds=beds, 
                         waiting_queue=waiting_queue,
                         available_beds=available_beds)

@app.route('/discharge_management')
def discharge_management():
    allocated_patients = [p for p in patients if p.bed_id]
    return render_template('discharge_management.html', 
                         patients=allocated_patients, 
                         beds=beds)

@app.route('/add_patient', methods=['POST'])
def add_patient():
    data = request.form
    patient = Patient(
        name=data['name'],
        age=int(data['age']),
        priority=data['priority'],
        condition=data['condition'],
        estimated_stay=int(data['estimated_stay']),
        medical_history=data.get('medical_history', ''),
        allergies=data.get('allergies', ''),
        emergency_contact={
            'name': data.get('emergency_name', ''),
            'phone': data.get('emergency_phone', ''),
            'relationship': data.get('emergency_relationship', '')
        }
    )
    
    patients.append(patient)
    waiting_queue.append(patient)
    update_metrics()
    
    return redirect(url_for('patient_bed_management'))

@app.route('/allocate_bed', methods=['POST'])
def allocate_bed():
    data = request.form
    patient_id = data['patient_id']
    bed_id = data['bed_id']
    
    patient = next((p for p in patients if p.id == patient_id), None)
    bed = next((b for b in beds if b.id == bed_id), None)
    
    if patient and bed and bed.status == 'available':
        patient.bed_id = bed_id
        bed.patient_id = patient_id
        bed.status = 'occupied'
        
        if patient in waiting_queue:
            waiting_queue.remove(patient)
        
        update_metrics()
        return jsonify({'success': True, 'message': 'Bed allocated successfully'})
    
    return jsonify({'success': False, 'message': 'Allocation failed'})

@app.route('/auto_allocate', methods=['POST'])
def auto_allocate():
    if not waiting_queue:
        return jsonify({'success': False, 'message': 'No patients in queue'})
    
    # Sort by priority (critical > high > medium > low)
    priority_order = {'critical': 4, 'high': 3, 'medium': 2, 'low': 1}
    waiting_queue.sort(key=lambda p: priority_order[p.priority], reverse=True)
    
    patient = waiting_queue[0]
    available_beds = [b for b in beds if b.status == 'available']
    
    if available_beds:
        bed = available_beds[0]
        patient.bed_id = bed.id
        bed.patient_id = patient.id
        bed.status = 'occupied'
        waiting_queue.remove(patient)
        
        update_metrics()
        return jsonify({'success': True, 'message': f'Auto-allocated {patient.name} to {bed.ward} {bed.number}'})
    
    return jsonify({'success': False, 'message': 'No available beds'})

@app.route('/discharge_patient', methods=['POST'])
def discharge_patient():
    data = request.json
    patient_id = data['patient_id']
    
    patient = next((p for p in patients if p.id == patient_id), None)
    if patient and patient.bed_id:
        bed = next((b for b in beds if b.id == patient.bed_id), None)
        if bed:
            bed.status = 'available'
            bed.patient_id = None
        
        patient.bed_id = None
        patients.remove(patient)
        
        update_metrics()
        return jsonify({'success': True, 'message': f'{patient.name} discharged successfully'})
    
    return jsonify({'success': False, 'message': 'Discharge failed'})

def update_metrics():
    global metrics
    allocated_patients = [p for p in patients if p.bed_id]
    occupied_beds = [b for b in beds if b.status == 'occupied']
    
    metrics.update({
        'total_patients': len(patients),
        'admitted_today': len(allocated_patients),
        'discharged_today': 0,  # Would track actual discharges
        'average_wait_time': calculate_average_wait_time(),
        'bed_utilization': round((len(occupied_beds) / len(beds)) * 100, 1),
        'critical_patients': len([p for p in patients if p.priority == 'critical']),
        'emergency_level': 'none'
    })

def calculate_average_wait_time():
    if not waiting_queue:
        return 0
    
    now = datetime.now()
    total_wait = sum((now - p.arrival_time).total_seconds() for p in waiting_queue)
    return round(total_wait / len(waiting_queue) / 60, 1)  # minutes

if __name__ == '__main__':
    app.run(debug=True)