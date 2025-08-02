import { useState, useEffect, useCallback } from 'react';
import { Patient, Bed, Staff, Priority, AllocationMethod, AllocationResult, SchedulingAlgorithm, SimulationSettings, SystemMetrics, EmergencyLevel } from '@/types/hospital';

const initialBeds: Bed[] = [
  { id: 'bed-1', number: 'ICU-001', status: 'available', ward: 'ICU', equipment: [], nursesAssigned: [] },
  { id: 'bed-2', number: 'ICU-002', status: 'available', ward: 'ICU', equipment: [], nursesAssigned: [] },
  { id: 'bed-3', number: 'ICU-003', status: 'occupied', ward: 'ICU', patientId: 'patient-demo', equipment: [], nursesAssigned: [] },
  { id: 'bed-4', number: 'GEN-001', status: 'available', ward: 'General', equipment: [], nursesAssigned: [] },
  { id: 'bed-5', number: 'GEN-002', status: 'available', ward: 'General', equipment: [], nursesAssigned: [] },
  { id: 'bed-6', number: 'GEN-003', status: 'maintenance', ward: 'General', equipment: [], nursesAssigned: [] },
  { id: 'bed-7', number: 'ER-001', status: 'available', ward: 'Emergency', equipment: [], nursesAssigned: [] },
  { id: 'bed-8', number: 'ER-002', status: 'available', ward: 'Emergency', equipment: [], nursesAssigned: [] },
  { id: 'bed-9', number: 'ICU-004', status: 'available', ward: 'ICU', equipment: [], nursesAssigned: [] },
  { id: 'bed-10', number: 'GEN-004', status: 'available', ward: 'General', equipment: [], nursesAssigned: [] },
];

const initialStaff: Staff[] = [
  { id: 'staff-1', name: 'Dr. Sarah Johnson', role: 'doctor', specialization: 'Cardiology', shift: 'day', patients: ['patient-demo'], maxPatients: 8, currentLoad: 1, experience: 10 },
  { id: 'staff-2', name: 'Nurse Mike Chen', role: 'nurse', shift: 'day', patients: [], maxPatients: 6, currentLoad: 0, experience: 5 },
  { id: 'staff-3', name: 'Dr. Emily Rodriguez', role: 'specialist', specialization: 'Emergency Medicine', shift: 'night', patients: [], maxPatients: 10, currentLoad: 0, experience: 8 },
  { id: 'staff-4', name: 'Nurse Jennifer Lee', role: 'nurse', shift: 'evening', patients: [], maxPatients: 6, currentLoad: 0, experience: 12 },
];

const priorityWeights: Record<Priority, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

const patientConditions = [
  'Cardiac Emergency', 'Respiratory Distress', 'Stroke', 'Pneumonia', 'Broken Bone',
  'Chest Pain', 'Diabetes', 'Hypertension', 'Surgery Recovery', 'Infection',
  'Asthma Attack', 'Heart Attack', 'Kidney Stones', 'Appendicitis', 'Migraine'
];

const patientNames = [
  'Emma Thompson', 'James Wilson', 'Sarah Davis', 'Michael Brown', 'Lisa Anderson',
  'Robert Garcia', 'Maria Martinez', 'David Lee', 'Jennifer Taylor', 'Christopher Moore',
  'Amanda Johnson', 'Kevin White', 'Rachel Green', 'Daniel Miller', 'Jessica Clark'
];

export const useAdvancedHospitalData = () => {
  const [patients, setPatients] = useState<Patient[]>([
    {
      id: 'patient-demo',
      name: 'John Doe',
      age: 45,
      priority: 'high',
      condition: 'Cardiac Emergency',
      arrivalTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
      estimatedStay: 24,
      bedId: 'bed-3',
      vitalSigns: {
        heartRate: 85,
        bloodPressure: '120/80',
        temperature: 98.6,
        oxygenSaturation: 98,
        respiratoryRate: 16,
        lastChecked: new Date(),
      },
      medicalHistory: ['Hypertension', 'Diabetes'],
      allergies: ['Penicillin'],
      assignedStaff: ['staff-1'],
      lastUpdate: new Date(),
      emergencyContact: {
        name: 'Jane Doe',
        relationship: 'Spouse',
        phone: '555-0123',
      },
    },
  ]);
  
  const [beds, setBeds] = useState<Bed[]>(initialBeds);
  const [staff, setStaff] = useState<Staff[]>(initialStaff);
  const [waitingQueue, setWaitingQueue] = useState<Patient[]>([]);
  const [currentAlgorithm, setCurrentAlgorithm] = useState<SchedulingAlgorithm>('priority');
  const [emergencyLevel, setEmergencyLevel] = useState<EmergencyLevel>('none');
  const [simulationSettings, setSimulationSettings] = useState<SimulationSettings>({
    enabled: false,
    speed: 1,
    autoGeneratePatients: false,
    patientArrivalRate: 2,
    enableEmergencies: false,
    emergencyProbability: 0.05,
  });
  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalPatients: 1,
    admittedToday: 1,
    dischargedToday: 0,
    averageWaitTime: 0,
    bedUtilization: 10,
    criticalPatients: 0,
    emergencyLevel: 'none',
    staffEfficiency: 85,
    equipmentUtilization: 70,
  });

  // Real-time simulation
  useEffect(() => {
    if (!simulationSettings.enabled) return;

    const interval = setInterval(() => {
      if (simulationSettings.autoGeneratePatients) {
        generateRandomPatient();
      }
      
      if (simulationSettings.enableEmergencies && Math.random() < simulationSettings.emergencyProbability) {
        triggerEmergency();
      }

      updateMetrics();
    }, 5000 / simulationSettings.speed);

    return () => clearInterval(interval);
  }, [simulationSettings]);

  const generateRandomPatient = useCallback(() => {
    const priorities: Priority[] = ['critical', 'high', 'medium', 'low'];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    
    // Critical patients more likely during emergencies
    const adjustedPriority = emergencyLevel !== 'none' && Math.random() < 0.4 ? 'critical' : priority;
    
    const newPatient: Patient = {
      id: `patient-${Date.now()}-${Math.random()}`,
      name: patientNames[Math.floor(Math.random() * patientNames.length)],
      age: Math.floor(Math.random() * 80) + 20,
      priority: adjustedPriority,
      condition: patientConditions[Math.floor(Math.random() * patientConditions.length)],
      arrivalTime: new Date(),
      estimatedStay: Math.floor(Math.random() * 48) + 12,
      vitalSigns: {
        heartRate: Math.floor(Math.random() * 40) + 60,
        bloodPressure: `${Math.floor(Math.random() * 40) + 110}/${Math.floor(Math.random() * 20) + 70}`,
        temperature: (Math.random() * 4) + 97,
        oxygenSaturation: Math.floor(Math.random() * 10) + 90,
        respiratoryRate: Math.floor(Math.random() * 10) + 12,
        lastChecked: new Date(),
      },
      medicalHistory: [],
      allergies: [],
      assignedStaff: [],
      lastUpdate: new Date(),
      emergencyContact: {
        name: 'Emergency Contact',
        relationship: 'Family',
        phone: '555-0000',
      },
    };
    
    setPatients(prev => [...prev, newPatient]);
    setWaitingQueue(prev => sortQueueByAlgorithm([...prev, newPatient], currentAlgorithm));
  }, [emergencyLevel, currentAlgorithm]);

  const triggerEmergency = useCallback(() => {
    const emergencyTypes: EmergencyLevel[] = ['code-blue', 'code-red'];
    const emergency = emergencyTypes[Math.floor(Math.random() * emergencyTypes.length)];
    
    setEmergencyLevel(emergency);
    
    // Auto-clear emergency after 5 minutes
    setTimeout(() => {
      setEmergencyLevel('none');
    }, 300000 / simulationSettings.speed);
  }, [simulationSettings.speed]);

  const sortQueueByAlgorithm = (queue: Patient[], algorithm: SchedulingAlgorithm): Patient[] => {
    switch (algorithm) {
      case 'priority':
        return queue.sort((a, b) => 
          priorityWeights[b.priority] - priorityWeights[a.priority] || 
          a.arrivalTime.getTime() - b.arrivalTime.getTime()
        );
      
      case 'fcfs': // First Come First Serve
        return queue.sort((a, b) => a.arrivalTime.getTime() - b.arrivalTime.getTime());
      
      case 'sjf': // Shortest Job First
        return queue.sort((a, b) => a.estimatedStay - b.estimatedStay);
      
      case 'round-robin':
        // Round-robin implementation (simplified)
        return queue.sort((a, b) => {
          const aScore = priorityWeights[a.priority] + (a.estimatedStay / 24);
          const bScore = priorityWeights[b.priority] + (b.estimatedStay / 24);
          return bScore - aScore;
        });
      
      default:
        return queue;
    }
  };

  const addPatient = useCallback((patientData: {
    name: string;
    age: number;
    priority: Priority;
    condition: string;
    estimatedStay: number;
  }) => {
    const newPatient: Patient = {
      ...patientData,
      id: `patient-${Date.now()}`,
      arrivalTime: new Date(),
      vitalSigns: {
        heartRate: Math.floor(Math.random() * 40) + 60,
        bloodPressure: '120/80',
        temperature: 98.6,
        oxygenSaturation: 95 + Math.floor(Math.random() * 5),
        respiratoryRate: 12 + Math.floor(Math.random() * 8),
        lastChecked: new Date(),
      },
      medicalHistory: [],
      allergies: [],
      assignedStaff: [],
      lastUpdate: new Date(),
      emergencyContact: {
        name: 'Emergency Contact',
        relationship: 'Family',
        phone: '555-0000',
      },
    };
    
    setPatients(prev => [...prev, newPatient]);
    setWaitingQueue(prev => sortQueueByAlgorithm([...prev, newPatient], currentAlgorithm));
  }, [currentAlgorithm]);

  const allocateBed = useCallback((
    patientId: string, 
    method: AllocationMethod = 'automatic',
    specificBedId?: string
  ): AllocationResult => {
    const patient = waitingQueue.find(p => p.id === patientId) || patients.find(p => p.id === patientId);
    if (!patient) {
      return { success: false, patient: {} as Patient, message: 'Patient not found' };
    }

    let availableBed: Bed | undefined;

    if (method === 'manual' && specificBedId) {
      availableBed = beds.find(b => b.id === specificBedId && b.status === 'available');
      if (!availableBed) {
        return { success: false, patient, message: 'Selected bed is not available' };
      }
    } else {
      const availableBeds = beds.filter(b => b.status === 'available');
      if (availableBeds.length === 0) {
        return { 
          success: false, 
          patient, 
          message: 'No available beds',
          waitingPatients: waitingQueue
        };
      }

      // Enhanced bed selection logic
      if (patient.priority === 'critical' || emergencyLevel !== 'none') {
        availableBed = availableBeds.find(b => b.ward === 'ICU') || availableBeds[0];
      } else if (patient.priority === 'high') {
        availableBed = availableBeds.find(b => b.ward === 'Emergency') || 
                     availableBeds.find(b => b.ward === 'ICU') || 
                     availableBeds[0];
      } else {
        availableBed = availableBeds.find(b => b.ward === 'General') || availableBeds[0];
      }
    }

    if (!availableBed) {
      return { success: false, patient, message: 'No suitable bed found' };
    }

    // Auto-assign staff
    const availableStaff = staff.find(s => s.currentLoad < s.maxPatients);
    
    setBeds(prev => prev.map(b => 
      b.id === availableBed!.id 
        ? { ...b, status: 'occupied' as const, patientId: patient.id }
        : b
    ));

    const updatedPatient = { 
      ...patient, 
      bedId: availableBed.id,
      assignedStaff: availableStaff ? [availableStaff.id] : [],
      lastUpdate: new Date()
    };
    
    setPatients(prev => prev.map(p => p.id === patient.id ? updatedPatient : p));
    setWaitingQueue(prev => prev.filter(p => p.id !== patient.id));

    if (availableStaff) {
      setStaff(prev => prev.map(s => 
        s.id === availableStaff.id 
          ? { ...s, patients: [...s.patients, patient.id], currentLoad: s.currentLoad + 1 }
          : s
      ));
    }

    const waitTime = (new Date().getTime() - patient.arrivalTime.getTime()) / (1000 * 60); // minutes

    return { 
      success: true, 
      patient: updatedPatient, 
      bed: { ...availableBed, status: 'occupied', patientId: patient.id },
      message: `Patient ${patient.name} allocated to bed ${availableBed.number}`,
      algorithm: currentAlgorithm,
      waitTime: Math.round(waitTime)
    };
  }, [patients, beds, waitingQueue, staff, currentAlgorithm, emergencyLevel]);

  const dischargePatient = useCallback((patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient || !patient.bedId) {
      return { success: false, message: 'Patient not found or not allocated to a bed' };
    }

    setBeds(prev => prev.map(b => 
      b.id === patient.bedId 
        ? { ...b, status: 'available' as const, patientId: undefined, lastCleaned: new Date() }
        : b
    ));

    setStaff(prev => prev.map(s => 
      s.patients.includes(patientId)
        ? { ...s, patients: s.patients.filter(id => id !== patientId), currentLoad: s.currentLoad - 1 }
        : s
    ));

    setPatients(prev => prev.filter(p => p.id !== patientId));

    return { 
      success: true, 
      message: `Patient ${patient.name} discharged from bed ${beds.find(b => b.id === patient.bedId)?.number}` 
    };
  }, [patients, beds]);

  const autoAllocateNext = useCallback(() => {
    if (waitingQueue.length === 0) return null;
    
    const nextPatient = waitingQueue[0];
    return allocateBed(nextPatient.id, 'automatic');
  }, [waitingQueue, allocateBed]);

  const updateMetrics = useCallback(() => {
    const totalBeds = beds.length;
    const occupiedBeds = beds.filter(b => b.status === 'occupied').length;
    const criticalPatients = patients.filter(p => p.priority === 'critical').length;
    
    const avgWaitTime = waitingQueue.length > 0 
      ? waitingQueue.reduce((sum, p) => sum + (new Date().getTime() - p.arrivalTime.getTime()), 0) / waitingQueue.length / (1000 * 60)
      : 0;

    setMetrics({
      totalPatients: patients.length,
      admittedToday: patients.filter(p => {
        const today = new Date();
        const patientDate = new Date(p.arrivalTime);
        return patientDate.toDateString() === today.toDateString();
      }).length,
      dischargedToday: 0, // This would need more tracking
      averageWaitTime: Math.round(avgWaitTime),
      bedUtilization: Math.round((occupiedBeds / totalBeds) * 100),
      criticalPatients,
      emergencyLevel,
      staffEfficiency: Math.round(staff.reduce((sum, s) => sum + (s.currentLoad / s.maxPatients), 0) / staff.length * 100),
      equipmentUtilization: 70 + Math.floor(Math.random() * 20),
    });
  }, [patients, beds, waitingQueue, emergencyLevel, staff]);

  // Update metrics periodically
  useEffect(() => {
    updateMetrics();
    const interval = setInterval(updateMetrics, 30000);
    return () => clearInterval(interval);
  }, [updateMetrics]);

  return {
    patients,
    beds,
    staff,
    waitingQueue,
    currentAlgorithm,
    emergencyLevel,
    simulationSettings,
    metrics,
    addPatient,
    allocateBed,
    dischargePatient,
    autoAllocateNext,
    setCurrentAlgorithm,
    setSimulationSettings,
    setEmergencyLevel,
  };
};