import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Bed, 
  Plus, 
  Clock,
  AlertCircle,
  Shuffle,
  ArrowRight
} from 'lucide-react';
import { Patient, Bed as BedType, Priority, AllocationMethod } from '@/types/hospital';

interface PatientBedManagementProps {
  patients: Patient[];
  beds: BedType[];
  waitingQueue: Patient[];
  onAddPatient: (patient: Omit<Patient, 'id' | 'arrivalTime' | 'vitalSigns' | 'lastUpdate'>) => void;
  onAllocateBed: (patientId: string, bedId: string, method: AllocationMethod) => void;
  onAutoAllocateNext: () => void;
}

const priorityColors = {
  critical: 'bg-critical text-critical-foreground',
  high: 'bg-high text-high-foreground',
  medium: 'bg-medium text-medium-foreground',
  low: 'bg-low text-low-foreground',
};

const statusColors = {
  available: 'border-available text-available',
  occupied: 'border-occupied text-occupied',
  maintenance: 'border-maintenance text-maintenance',
  cleaning: 'border-cleaning text-cleaning',
};

const wardColors = {
  'ICU': 'border-critical',
  'Emergency': 'border-high',
  'General': 'border-medium',
  'Surgery': 'border-low',
  'Pediatric': 'border-accent',
};

export const PatientBedManagement = ({
  patients,
  beds,
  waitingQueue,
  onAddPatient,
  onAllocateBed,
  onAutoAllocateNext,
}: PatientBedManagementProps) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    priority: 'medium' as Priority,
    condition: '',
    estimatedStay: '24',
    medicalHistory: '',
    allergies: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: ''
  });
  
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [selectedBed, setSelectedBed] = useState<string>('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.age || !formData.condition) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    onAddPatient({
      name: formData.name,
      age: parseInt(formData.age),
      priority: formData.priority,
      condition: formData.condition,
      estimatedStay: parseInt(formData.estimatedStay),
      medicalHistory: formData.medicalHistory ? formData.medicalHistory.split(',').map(item => item.trim()) : [],
      allergies: formData.allergies ? formData.allergies.split(',').map(item => item.trim()) : [],
      assignedStaff: [],
      emergencyContact: {
        name: formData.emergencyContactName,
        phone: formData.emergencyContactPhone,
        relationship: formData.emergencyContactRelationship
      }
    });

    setFormData({
      name: '',
      age: '',
      priority: 'medium',
      condition: '',
      estimatedStay: '24',
      medicalHistory: '',
      allergies: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelationship: ''
    });

    toast({
      title: "Success",
      description: "Patient registered successfully",
    });
  };

  const handleManualAllocation = () => {
    if (!selectedPatient || !selectedBed) {
      toast({
        title: "Error",
        description: "Please select both a patient and a bed",
        variant: "destructive",
      });
      return;
    }

    onAllocateBed(selectedPatient, selectedBed, 'manual');
    setSelectedPatient('');
    setSelectedBed('');
    
    toast({
      title: "Success",
      description: "Bed allocated successfully",
    });
  };

  const handleAutoAllocation = () => {
    if (waitingQueue.length === 0) {
      toast({
        title: "Info",
        description: "No patients in waiting queue",
      });
      return;
    }
    
    onAutoAllocateNext();
    toast({
      title: "Success",
      description: "Automatic allocation completed",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const availableBeds = beds.filter(bed => bed.status === 'available');
  const occupiedBeds = beds.filter(bed => bed.status === 'occupied');
  const maintenanceBeds = beds.filter(bed => bed.status === 'maintenance');
  const waitingPatients = waitingQueue.length;

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 bg-available/10 rounded-lg">
              <Bed className="h-5 w-5 text-available" />
            </div>
            <div>
              <div className="text-2xl font-bold">{availableBeds.length}</div>
              <div className="text-sm text-muted-foreground">Available</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 bg-occupied/10 rounded-lg">
              <Users className="h-5 w-5 text-occupied" />
            </div>
            <div>
              <div className="text-2xl font-bold">{occupiedBeds.length}</div>
              <div className="text-sm text-muted-foreground">Occupied</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 bg-maintenance/10 rounded-lg">
              <AlertCircle className="h-5 w-5 text-maintenance" />
            </div>
            <div>
              <div className="text-2xl font-bold">{maintenanceBeds.length}</div>
              <div className="text-sm text-muted-foreground">Maintenance</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 bg-secondary rounded-lg">
              <Clock className="h-5 w-5 text-secondary-foreground" />
            </div>
            <div>
              <div className="text-2xl font-bold">{waitingPatients}</div>
              <div className="text-sm text-muted-foreground">Waiting</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Registration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Register New Patient
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Patient name"
                  />
                </div>
                <div>
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="Age"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value: Priority) => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="estimatedStay">Estimated Stay (hours)</Label>
                  <Input
                    id="estimatedStay"
                    type="number"
                    value={formData.estimatedStay}
                    onChange={(e) => setFormData({ ...formData, estimatedStay: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="condition">Condition *</Label>
                <Input
                  id="condition"
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  placeholder="Medical condition"
                />
              </div>

              <Button type="submit" className="w-full">
                Register Patient
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Bed Allocation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bed className="h-5 w-5" />
              Bed Allocation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Auto Allocation */}
            <div className="p-4 bg-primary/5 rounded-lg">
              <h3 className="font-medium mb-2">Automatic Allocation</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Automatically assign the next patient in queue to the best available bed
              </p>
              <Button onClick={handleAutoAllocation} className="w-full" disabled={waitingQueue.length === 0}>
                <Shuffle className="h-4 w-4 mr-2" />
                Auto Allocate Next Patient
              </Button>
            </div>

            {/* Manual Allocation */}
            <div className="space-y-3">
              <h3 className="font-medium">Manual Allocation</h3>
              <div>
                <Label htmlFor="patient">Select Patient</Label>
                <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {waitingQueue.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name} - {patient.condition} ({patient.priority})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="bed">Select Bed</Label>
                <Select value={selectedBed} onValueChange={setSelectedBed}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose bed" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableBeds.map((bed) => (
                      <SelectItem key={bed.id} value={bed.id}>
                        {bed.ward} - Bed {bed.number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleManualAllocation} 
                className="w-full"
                disabled={!selectedPatient || !selectedBed}
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Allocate Bed
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Waiting Queue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Waiting Queue ({waitingQueue.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {waitingQueue.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No patients in waiting queue</p>
          ) : (
            <div className="space-y-3">
              {waitingQueue.map((patient, index) => (
                <div key={patient.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-mono bg-muted px-2 py-1 rounded">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{patient.name}</div>
                      <div className="text-sm text-muted-foreground">{patient.condition}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={priorityColors[patient.priority]}>
                      {patient.priority}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {formatTime(patient.arrivalTime)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bed Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bed className="h-5 w-5" />
            Bed Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {beds.map((bed) => {
              const patient = patients.find(p => p.id === bed.patientId);
              return (
                <div key={bed.id} className={`p-4 border-2 rounded-lg ${wardColors[bed.ward as keyof typeof wardColors]} ${statusColors[bed.status]}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{bed.ward} - {bed.number}</span>
                    <Badge variant={bed.status === 'available' ? 'default' : 'secondary'}>
                      {bed.status}
                    </Badge>
                  </div>
                  
                  {bed.status === 'occupied' && patient ? (
                    <div className="space-y-1">
                      <div className="font-medium">{patient.name}</div>
                      <div className="text-sm text-muted-foreground">{patient.condition}</div>
                      <Badge className={`${priorityColors[patient.priority]} text-xs`}>
                        {patient.priority}
                      </Badge>
                    </div>
                  ) : bed.status === 'available' ? (
                    <div className="text-sm text-available">Ready for patient</div>
                  ) : (
                    <div className="text-sm text-muted-foreground">Under {bed.status}</div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};