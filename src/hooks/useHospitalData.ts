import { useState, useCallback } from 'react';
import { Patient, Bed, Priority, AllocationMethod, AllocationResult } from '@/types/hospital';

const initialBeds: Bed[] = [
  { id: 'bed-1', number: 'ICU-001', status: 'available', ward: 'ICU' },
  { id: 'bed-2', number: 'ICU-002', status: 'available', ward: 'ICU' },
  { id: 'bed-3', number: 'ICU-003', status: 'occupied', ward: 'ICU', patientId: 'patient-demo' },
  { id: 'bed-4', number: 'GEN-001', status: 'available', ward: 'General' },
  { id: 'bed-5', number: 'GEN-002', status: 'available', ward: 'General' },
  { id: 'bed-6', number: 'GEN-003', status: 'maintenance', ward: 'General' },
  { id: 'bed-7', number: 'ER-001', status: 'available', ward: 'Emergency' },
  { id: 'bed-8', number: 'ER-002', status: 'available', ward: 'Emergency' },
];

const priorityWeights: Record<Priority, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export const useHospitalData = () => {
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
    },
  ]);
  
  const [beds, setBeds] = useState<Bed[]>(initialBeds);
  const [waitingQueue, setWaitingQueue] = useState<Patient[]>([]);

  const addPatient = useCallback((patient: Omit<Patient, 'id' | 'arrivalTime'>) => {
    const newPatient: Patient = {
      ...patient,
      id: `patient-${Date.now()}`,
      arrivalTime: new Date(),
    };
    
    setPatients(prev => [...prev, newPatient]);
    setWaitingQueue(prev => [...prev, newPatient].sort((a, b) => 
      priorityWeights[b.priority] - priorityWeights[a.priority] || 
      a.arrivalTime.getTime() - b.arrivalTime.getTime()
    ));
  }, []);

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
      // Automatic allocation - priority-based scheduling
      const availableBeds = beds.filter(b => b.status === 'available');
      if (availableBeds.length === 0) {
        return { 
          success: false, 
          patient, 
          message: 'No available beds',
          waitingPatients: waitingQueue
        };
      }

      // Prefer ICU for critical patients, Emergency for high priority
      if (patient.priority === 'critical') {
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

    // Update bed and patient
    setBeds(prev => prev.map(b => 
      b.id === availableBed!.id 
        ? { ...b, status: 'occupied' as const, patientId: patient.id }
        : b
    ));

    const updatedPatient = { ...patient, bedId: availableBed.id };
    setPatients(prev => prev.map(p => p.id === patient.id ? updatedPatient : p));
    setWaitingQueue(prev => prev.filter(p => p.id !== patient.id));

    return { 
      success: true, 
      patient: updatedPatient, 
      bed: { ...availableBed, status: 'occupied', patientId: patient.id },
      message: `Patient ${patient.name} allocated to bed ${availableBed.number}` 
    };
  }, [patients, beds, waitingQueue]);

  const dischargePatient = useCallback((patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient || !patient.bedId) {
      return { success: false, message: 'Patient not found or not allocated to a bed' };
    }

    // Free the bed
    setBeds(prev => prev.map(b => 
      b.id === patient.bedId 
        ? { ...b, status: 'available' as const, patientId: undefined, lastCleaned: new Date() }
        : b
    ));

    // Remove patient
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

  return {
    patients,
    beds,
    waitingQueue,
    addPatient,
    allocateBed,
    dischargePatient,
    autoAllocateNext,
  };
};