import tkinter as tk
from tkinter import ttk, messagebox, simpledialog
from datetime import datetime, timedelta
import uuid
import random

class Patient:
    def __init__(self, name, age, priority, condition, estimated_stay, medical_history="", allergies=""):
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

class HospitalManagementApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Hospital Management System")
        self.root.geometry("1200x800")
        
        # Data storage
        self.patients = []
        self.beds = []
        self.waiting_queue = []
        
        # Initialize sample data
        self.initialize_data()
        
        # Create GUI
        self.create_widgets()
        
    def initialize_data(self):
        """Initialize sample beds"""
        wards = ['ICU', 'Emergency', 'General', 'Surgery']
        for ward in wards:
            for i in range(1, 6):
                self.beds.append(Bed(f"{ward[0]}{i}", ward))
                
    def create_widgets(self):
        """Create the main GUI widgets"""
        # Create notebook for tabs
        self.notebook = ttk.Notebook(self.root)
        self.notebook.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Create frames for each module
        self.analytics_frame = ttk.Frame(self.notebook)
        self.patient_bed_frame = ttk.Frame(self.notebook)
        self.discharge_frame = ttk.Frame(self.notebook)
        
        # Add tabs
        self.notebook.add(self.analytics_frame, text="Analytics & AI")
        self.notebook.add(self.patient_bed_frame, text="Patient & Bed Management")
        self.notebook.add(self.discharge_frame, text="Discharge Management")
        
        # Setup each module
        self.setup_analytics_module()
        self.setup_patient_bed_module()
        self.setup_discharge_module()
        
        # Update displays
        self.update_all_displays()
        
    def setup_analytics_module(self):
        """Setup the Analytics & AI module"""
        # Title
        title_frame = ttk.Frame(self.analytics_frame)
        title_frame.pack(fill=tk.X, padx=10, pady=10)
        
        ttk.Label(title_frame, text="Analytics & AI Dashboard", 
                 font=('Arial', 16, 'bold')).pack(anchor=tk.W)
        
        # Metrics frame
        metrics_frame = ttk.LabelFrame(self.analytics_frame, text="Key Metrics")
        metrics_frame.pack(fill=tk.X, padx=10, pady=5)
        
        # Create metric labels
        metrics_grid = ttk.Frame(metrics_frame)
        metrics_grid.pack(fill=tk.X, padx=10, pady=10)
        
        self.total_patients_label = ttk.Label(metrics_grid, text="Total Patients: 0", font=('Arial', 12))
        self.total_patients_label.grid(row=0, column=0, padx=20, pady=5, sticky=tk.W)
        
        self.occupied_beds_label = ttk.Label(metrics_grid, text="Occupied Beds: 0", font=('Arial', 12))
        self.occupied_beds_label.grid(row=0, column=1, padx=20, pady=5, sticky=tk.W)
        
        self.waiting_queue_label = ttk.Label(metrics_grid, text="Waiting Queue: 0", font=('Arial', 12))
        self.waiting_queue_label.grid(row=1, column=0, padx=20, pady=5, sticky=tk.W)
        
        self.bed_utilization_label = ttk.Label(metrics_grid, text="Bed Utilization: 0%", font=('Arial', 12))
        self.bed_utilization_label.grid(row=1, column=1, padx=20, pady=5, sticky=tk.W)
        
        # AI Predictions frame
        ai_frame = ttk.LabelFrame(self.analytics_frame, text="AI Predictions & Recommendations")
        ai_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=5)
        
        predictions_text = """
• Expected Arrivals: 3-5 patients in next hour
• Peak Time Prediction: 2:00-4:00 PM
• Resource Alert: ICU approaching capacity
• Optimization Suggestion: Priority-based allocation recommended
• Current Efficiency: 85%
        """
        
        ttk.Label(ai_frame, text=predictions_text, justify=tk.LEFT, 
                 font=('Arial', 10)).pack(anchor=tk.W, padx=10, pady=10)
        
    def setup_patient_bed_module(self):
        """Setup the Patient & Bed Management module"""
        # Title
        title_frame = ttk.Frame(self.patient_bed_frame)
        title_frame.pack(fill=tk.X, padx=10, pady=10)
        
        ttk.Label(title_frame, text="Patient & Bed Management", 
                 font=('Arial', 16, 'bold')).pack(anchor=tk.W)
        
        # Main content frame
        main_frame = ttk.Frame(self.patient_bed_frame)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=10)
        
        # Left side - Patient Registration
        left_frame = ttk.LabelFrame(main_frame, text="Register New Patient")
        left_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=(0, 5))
        
        # Patient form
        form_frame = ttk.Frame(left_frame)
        form_frame.pack(fill=tk.X, padx=10, pady=10)
        
        ttk.Label(form_frame, text="Name:").grid(row=0, column=0, sticky=tk.W, pady=2)
        self.name_entry = ttk.Entry(form_frame, width=30)
        self.name_entry.grid(row=0, column=1, pady=2, padx=5)
        
        ttk.Label(form_frame, text="Age:").grid(row=1, column=0, sticky=tk.W, pady=2)
        self.age_entry = ttk.Entry(form_frame, width=30)
        self.age_entry.grid(row=1, column=1, pady=2, padx=5)
        
        ttk.Label(form_frame, text="Priority:").grid(row=2, column=0, sticky=tk.W, pady=2)
        self.priority_combo = ttk.Combobox(form_frame, values=['critical', 'high', 'medium', 'low'], width=27)
        self.priority_combo.set('medium')
        self.priority_combo.grid(row=2, column=1, pady=2, padx=5)
        
        ttk.Label(form_frame, text="Condition:").grid(row=3, column=0, sticky=tk.W, pady=2)
        self.condition_entry = ttk.Entry(form_frame, width=30)
        self.condition_entry.grid(row=3, column=1, pady=2, padx=5)
        
        ttk.Label(form_frame, text="Est. Stay (hours):").grid(row=4, column=0, sticky=tk.W, pady=2)
        self.stay_entry = ttk.Entry(form_frame, width=30)
        self.stay_entry.insert(0, "24")
        self.stay_entry.grid(row=4, column=1, pady=2, padx=5)
        
        ttk.Button(form_frame, text="Register Patient", 
                  command=self.register_patient).grid(row=5, column=0, columnspan=2, pady=10)
        
        # Right side - Bed Allocation
        right_frame = ttk.LabelFrame(main_frame, text="Bed Allocation")
        right_frame.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True, padx=(5, 0))
        
        # Auto allocation
        auto_frame = ttk.Frame(right_frame)
        auto_frame.pack(fill=tk.X, padx=10, pady=10)
        
        ttk.Label(auto_frame, text="Automatic Allocation", font=('Arial', 12, 'bold')).pack(anchor=tk.W)
        ttk.Label(auto_frame, text="Assign next patient to best available bed").pack(anchor=tk.W)
        ttk.Button(auto_frame, text="Auto Allocate Next Patient", 
                  command=self.auto_allocate).pack(pady=5)
        
        # Manual allocation
        manual_frame = ttk.Frame(right_frame)
        manual_frame.pack(fill=tk.X, padx=10, pady=10)
        
        ttk.Label(manual_frame, text="Manual Allocation", font=('Arial', 12, 'bold')).pack(anchor=tk.W)
        
        ttk.Label(manual_frame, text="Select Patient:").pack(anchor=tk.W)
        self.patient_combo = ttk.Combobox(manual_frame, width=40)
        self.patient_combo.pack(fill=tk.X, pady=2)
        
        ttk.Label(manual_frame, text="Select Bed:").pack(anchor=tk.W)
        self.bed_combo = ttk.Combobox(manual_frame, width=40)
        self.bed_combo.pack(fill=tk.X, pady=2)
        
        ttk.Button(manual_frame, text="Allocate Bed", 
                  command=self.manual_allocate).pack(pady=5)
        
        # Waiting Queue
        queue_frame = ttk.LabelFrame(self.patient_bed_frame, text="Waiting Queue")
        queue_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Create treeview for waiting queue
        self.queue_tree = ttk.Treeview(queue_frame, columns=('Name', 'Condition', 'Priority', 'Time'), show='headings', height=6)
        self.queue_tree.heading('Name', text='Name')
        self.queue_tree.heading('Condition', text='Condition')
        self.queue_tree.heading('Priority', text='Priority')
        self.queue_tree.heading('Time', text='Arrival Time')
        
        queue_scrollbar = ttk.Scrollbar(queue_frame, orient=tk.VERTICAL, command=self.queue_tree.yview)
        self.queue_tree.configure(yscrollcommand=queue_scrollbar.set)
        
        self.queue_tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        queue_scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
    def setup_discharge_module(self):
        """Setup the Discharge Management module"""
        # Title
        title_frame = ttk.Frame(self.discharge_frame)
        title_frame.pack(fill=tk.X, padx=10, pady=10)
        
        ttk.Label(title_frame, text="Discharge Management", 
                 font=('Arial', 16, 'bold')).pack(anchor=tk.W)
        
        # Stats frame
        stats_frame = ttk.LabelFrame(self.discharge_frame, text="Discharge Statistics")
        stats_frame.pack(fill=tk.X, padx=10, pady=5)
        
        stats_grid = ttk.Frame(stats_frame)
        stats_grid.pack(fill=tk.X, padx=10, pady=10)
        
        self.critical_count_label = ttk.Label(stats_grid, text="Critical Care: 0", font=('Arial', 12))
        self.critical_count_label.grid(row=0, column=0, padx=20, pady=5, sticky=tk.W)
        
        self.high_priority_label = ttk.Label(stats_grid, text="High Priority: 0", font=('Arial', 12))
        self.high_priority_label.grid(row=0, column=1, padx=20, pady=5, sticky=tk.W)
        
        self.total_allocated_label = ttk.Label(stats_grid, text="Total Allocated: 0", font=('Arial', 12))
        self.total_allocated_label.grid(row=1, column=0, padx=20, pady=5, sticky=tk.W)
        
        # Allocated Patients
        patients_frame = ttk.LabelFrame(self.discharge_frame, text="Allocated Patients")
        patients_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=5)
        
        # Create treeview for allocated patients
        self.patients_tree = ttk.Treeview(patients_frame, 
                                        columns=('Name', 'Age', 'Condition', 'Bed', 'Priority', 'Vitals'), 
                                        show='headings', height=10)
        
        self.patients_tree.heading('Name', text='Name')
        self.patients_tree.heading('Age', text='Age')
        self.patients_tree.heading('Condition', text='Condition')
        self.patients_tree.heading('Bed', text='Bed')
        self.patients_tree.heading('Priority', text='Priority')
        self.patients_tree.heading('Vitals', text='Vitals')
        
        # Set column widths
        self.patients_tree.column('Name', width=120)
        self.patients_tree.column('Age', width=60)
        self.patients_tree.column('Condition', width=150)
        self.patients_tree.column('Bed', width=100)
        self.patients_tree.column('Priority', width=80)
        self.patients_tree.column('Vitals', width=150)
        
        patients_scrollbar = ttk.Scrollbar(patients_frame, orient=tk.VERTICAL, command=self.patients_tree.yview)
        self.patients_tree.configure(yscrollcommand=patients_scrollbar.set)
        
        self.patients_tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        patients_scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Discharge button
        discharge_btn_frame = ttk.Frame(self.discharge_frame)
        discharge_btn_frame.pack(fill=tk.X, padx=10, pady=5)
        
        ttk.Button(discharge_btn_frame, text="Discharge Selected Patient", 
                  command=self.discharge_patient).pack()
        
    def register_patient(self):
        """Register a new patient"""
        name = self.name_entry.get().strip()
        age = self.age_entry.get().strip()
        priority = self.priority_combo.get()
        condition = self.condition_entry.get().strip()
        stay = self.stay_entry.get().strip()
        
        if not all([name, age, condition, stay]):
            messagebox.showerror("Error", "Please fill in all required fields")
            return
            
        try:
            age = int(age)
            stay = int(stay)
        except ValueError:
            messagebox.showerror("Error", "Age and Stay must be numbers")
            return
            
        patient = Patient(name, age, priority, condition, stay)
        self.patients.append(patient)
        self.waiting_queue.append(patient)
        
        # Clear form
        self.name_entry.delete(0, tk.END)
        self.age_entry.delete(0, tk.END)
        self.condition_entry.delete(0, tk.END)
        self.stay_entry.delete(0, tk.END)
        self.stay_entry.insert(0, "24")
        self.priority_combo.set('medium')
        
        messagebox.showinfo("Success", f"Patient {name} registered successfully")
        self.update_all_displays()
        
    def auto_allocate(self):
        """Automatically allocate next patient in queue"""
        if not self.waiting_queue:
            messagebox.showinfo("Info", "No patients in waiting queue")
            return
            
        # Sort by priority
        priority_order = {'critical': 4, 'high': 3, 'medium': 2, 'low': 1}
        self.waiting_queue.sort(key=lambda p: priority_order[p.priority], reverse=True)
        
        patient = self.waiting_queue[0]
        available_beds = [b for b in self.beds if b.status == 'available']
        
        if not available_beds:
            messagebox.showwarning("Warning", "No available beds")
            return
            
        bed = available_beds[0]
        patient.bed_id = bed.id
        bed.patient_id = patient.id
        bed.status = 'occupied'
        self.waiting_queue.remove(patient)
        
        messagebox.showinfo("Success", f"Auto-allocated {patient.name} to {bed.ward} {bed.number}")
        self.update_all_displays()
        
    def manual_allocate(self):
        """Manually allocate selected patient to selected bed"""
        patient_selection = self.patient_combo.get()
        bed_selection = self.bed_combo.get()
        
        if not patient_selection or not bed_selection:
            messagebox.showerror("Error", "Please select both a patient and a bed")
            return
            
        # Extract patient and bed IDs
        patient_id = patient_selection.split(' - ')[0]
        bed_id = bed_selection.split(' - ')[0]
        
        patient = next((p for p in self.patients if p.id == patient_id), None)
        bed = next((b for b in self.beds if b.id == bed_id), None)
        
        if patient and bed and bed.status == 'available':
            patient.bed_id = bed.id
            bed.patient_id = patient.id
            bed.status = 'occupied'
            
            if patient in self.waiting_queue:
                self.waiting_queue.remove(patient)
                
            messagebox.showinfo("Success", f"Allocated {patient.name} to {bed.ward} {bed.number}")
            self.update_all_displays()
        else:
            messagebox.showerror("Error", "Allocation failed")
            
    def discharge_patient(self):
        """Discharge selected patient"""
        selection = self.patients_tree.selection()
        if not selection:
            messagebox.showwarning("Warning", "Please select a patient to discharge")
            return
            
        item = self.patients_tree.item(selection[0])
        patient_name = item['values'][0]
        
        # Find patient by name (in real app, would use ID)
        patient = next((p for p in self.patients if p.name == patient_name), None)
        
        if not patient:
            messagebox.showerror("Error", "Patient not found")
            return
            
        if messagebox.askyesno("Confirm", f"Are you sure you want to discharge {patient_name}?"):
            # Free up the bed
            if patient.bed_id:
                bed = next((b for b in self.beds if b.id == patient.bed_id), None)
                if bed:
                    bed.status = 'available'
                    bed.patient_id = None
                    
            # Remove patient
            self.patients.remove(patient)
            
            messagebox.showinfo("Success", f"{patient_name} discharged successfully")
            self.update_all_displays()
            
    def update_all_displays(self):
        """Update all display elements"""
        self.update_analytics()
        self.update_patient_bed_combos()
        self.update_waiting_queue()
        self.update_discharge_display()
        
    def update_analytics(self):
        """Update analytics display"""
        total_patients = len(self.patients)
        occupied_beds = len([b for b in self.beds if b.status == 'occupied'])
        waiting_count = len(self.waiting_queue)
        bed_utilization = round((occupied_beds / len(self.beds)) * 100, 1) if self.beds else 0
        
        self.total_patients_label.config(text=f"Total Patients: {total_patients}")
        self.occupied_beds_label.config(text=f"Occupied Beds: {occupied_beds}")
        self.waiting_queue_label.config(text=f"Waiting Queue: {waiting_count}")
        self.bed_utilization_label.config(text=f"Bed Utilization: {bed_utilization}%")
        
    def update_patient_bed_combos(self):
        """Update patient and bed combo boxes"""
        # Update patient combo
        patient_options = [f"{p.id} - {p.name} ({p.condition})" for p in self.waiting_queue]
        self.patient_combo['values'] = patient_options
        
        # Update bed combo
        available_beds = [b for b in self.beds if b.status == 'available']
        bed_options = [f"{b.id} - {b.ward} Bed {b.number}" for b in available_beds]
        self.bed_combo['values'] = bed_options
        
    def update_waiting_queue(self):
        """Update waiting queue display"""
        # Clear existing items
        for item in self.queue_tree.get_children():
            self.queue_tree.delete(item)
            
        # Add current queue
        for patient in self.waiting_queue:
            self.queue_tree.insert('', 'end', values=(
                patient.name,
                patient.condition,
                patient.priority.title(),
                patient.arrival_time.strftime('%H:%M')
            ))
            
    def update_discharge_display(self):
        """Update discharge management display"""
        allocated_patients = [p for p in self.patients if p.bed_id]
        
        # Update stats
        critical_count = len([p for p in allocated_patients if p.priority == 'critical'])
        high_count = len([p for p in allocated_patients if p.priority == 'high'])
        total_allocated = len(allocated_patients)
        
        self.critical_count_label.config(text=f"Critical Care: {critical_count}")
        self.high_priority_label.config(text=f"High Priority: {high_count}")
        self.total_allocated_label.config(text=f"Total Allocated: {total_allocated}")
        
        # Clear existing items
        for item in self.patients_tree.get_children():
            self.patients_tree.delete(item)
            
        # Add allocated patients
        for patient in allocated_patients:
            bed = next((b for b in self.beds if b.id == patient.bed_id), None)
            bed_info = f"{bed.ward} {bed.number}" if bed else "Unknown"
            
            vitals = f"HR:{patient.vital_signs['heart_rate']} BP:{patient.vital_signs['blood_pressure']}"
            
            self.patients_tree.insert('', 'end', values=(
                patient.name,
                patient.age,
                patient.condition,
                bed_info,
                patient.priority.title(),
                vitals
            ))

def main():
    root = tk.Tk()
    app = HospitalManagementApp(root)
    root.mainloop()

if __name__ == "__main__":
    main()