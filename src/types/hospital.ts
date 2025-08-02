export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type BedStatus = 'available' | 'occupied' | 'maintenance';
export type AllocationMethod = 'automatic' | 'manual';

export interface Patient {
  id: string;
  name: string;
  age: number;
  priority: Priority;
  condition: string;
  arrivalTime: Date;
  estimatedStay: number; // in hours
  bedId?: string;
}

export interface Bed {
  id: string;
  number: string;
  status: BedStatus;
  patientId?: string;
  ward: string;
  lastCleaned?: Date;
}

export interface AllocationResult {
  success: boolean;
  patient: Patient;
  bed?: Bed;
  message: string;
  waitingPatients?: Patient[];
}