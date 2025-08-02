export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type BedStatus = 'available' | 'occupied' | 'maintenance' | 'cleaning';
export type AllocationMethod = 'automatic' | 'manual';
export type SchedulingAlgorithm = 'priority' | 'fcfs' | 'sjf' | 'round-robin';
export type StaffRole = 'doctor' | 'nurse' | 'specialist';
export type EmergencyLevel = 'none' | 'code-blue' | 'code-red' | 'mass-casualty';

export interface Patient {
  id: string;
  name: string;
  age: number;
  priority: Priority;
  condition: string;
  arrivalTime: Date;
  estimatedStay: number;
  bedId?: string;
  vitalSigns: VitalSigns;
  medicalHistory: string[];
  allergies: string[];
  assignedStaff: string[];
  lastUpdate: Date;
  dischargePlanned?: Date;
  transferRequested?: boolean;
  emergencyContact: EmergencyContact;
}

export interface VitalSigns {
  heartRate: number;
  bloodPressure: string;
  temperature: number;
  oxygenSaturation: number;
  respiratoryRate: number;
  lastChecked: Date;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface Bed {
  id: string;
  number: string;
  status: BedStatus;
  patientId?: string;
  ward: string;
  lastCleaned?: Date;
  equipment: Equipment[];
  nursesAssigned: string[];
  nextMaintenance?: Date;
}

export interface Equipment {
  id: string;
  name: string;
  type: 'ventilator' | 'monitor' | 'iv-pump' | 'oxygen' | 'defibrillator';
  status: 'available' | 'in-use' | 'maintenance';
  lastMaintenance: Date;
}

export interface Staff {
  id: string;
  name: string;
  role: StaffRole;
  specialization?: string;
  shift: 'day' | 'night' | 'evening';
  patients: string[];
  maxPatients: number;
  currentLoad: number;
  experience: number; // years
}

export interface AllocationResult {
  success: boolean;
  patient: Patient;
  bed?: Bed;
  message: string;
  waitingPatients?: Patient[];
  algorithm?: SchedulingAlgorithm;
  waitTime?: number;
}

export interface SystemMetrics {
  totalPatients: number;
  admittedToday: number;
  dischargedToday: number;
  averageWaitTime: number;
  bedUtilization: number;
  criticalPatients: number;
  emergencyLevel: EmergencyLevel;
  staffEfficiency: number;
  equipmentUtilization: number;
}

export interface SimulationSettings {
  enabled: boolean;
  speed: number; // 1x, 2x, 5x, 10x
  autoGeneratePatients: boolean;
  patientArrivalRate: number; // patients per hour
  enableEmergencies: boolean;
  emergencyProbability: number; // 0-1
}

export interface AnalyticsData {
  timestamp: Date;
  metrics: SystemMetrics;
}

export interface SchedulingComparison {
  algorithm: SchedulingAlgorithm;
  avgWaitTime: number;
  throughput: number;
  patientSatisfaction: number;
  efficiency: number;
}