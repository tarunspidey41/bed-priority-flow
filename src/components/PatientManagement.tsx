import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Clock, User } from 'lucide-react';
import { Patient, Priority } from '@/types/hospital';
import { cn } from '@/lib/utils';

interface PatientManagementProps {
  patients: Patient[];
  waitingQueue: Patient[];
  onAddPatient: (patient: Omit<Patient, 'id' | 'arrivalTime'>) => void;
}

const priorityColors: Record<Priority, string> = {
  critical: 'bg-critical text-critical-foreground',
  high: 'bg-high text-high-foreground',
  medium: 'bg-medium text-medium-foreground',
  low: 'bg-low text-low-foreground',
};

export const PatientManagement = ({ patients, waitingQueue, onAddPatient }: PatientManagementProps) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    priority: '' as Priority,
    condition: '',
    estimatedStay: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.age || !formData.priority || !formData.condition) return;

    onAddPatient({
      name: formData.name,
      age: parseInt(formData.age),
      priority: formData.priority,
      condition: formData.condition,
      estimatedStay: parseInt(formData.estimatedStay) || 24,
    });

    setFormData({
      name: '',
      age: '',
      priority: '' as Priority,
      condition: '',
      estimatedStay: '',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="space-y-6">
      {/* Add Patient Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Register New Patient
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Patient Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter patient name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                placeholder="Enter age"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority Level</Label>
              <Select value={formData.priority} onValueChange={(value: Priority) => 
                setFormData(prev => ({ ...prev, priority: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition">Medical Condition</Label>
              <Input
                id="condition"
                value={formData.condition}
                onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value }))}
                placeholder="Enter condition"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedStay">Estimated Stay (hours)</Label>
              <Input
                id="estimatedStay"
                type="number"
                value={formData.estimatedStay}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedStay: e.target.value }))}
                placeholder="24"
              />
            </div>

            <div className="flex items-end">
              <Button type="submit" className="w-full">
                <UserPlus className="h-4 w-4 mr-2" />
                Register Patient
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Waiting Queue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-medium" />
            Waiting Queue ({waitingQueue.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {waitingQueue.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No patients in queue</p>
          ) : (
            <div className="space-y-3">
              {waitingQueue.map((patient, index) => (
                <div key={patient.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-sm font-mono">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{patient.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Age: {patient.age} • {patient.condition}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={priorityColors[patient.priority]}>
                      {patient.priority.toUpperCase()}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      {formatTime(patient.arrivalTime)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Patients */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-accent" />
            All Patients ({patients.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {patients.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No patients registered</p>
          ) : (
            <div className="space-y-3">
              {patients.map((patient) => (
                <div key={patient.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{patient.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Age: {patient.age} • {patient.condition}
                    </div>
                    {patient.bedId && (
                      <div className="text-sm text-available font-medium">
                        Allocated to bed
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={priorityColors[patient.priority]}>
                      {patient.priority.toUpperCase()}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      {formatTime(patient.arrivalTime)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};