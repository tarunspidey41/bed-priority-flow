import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Bed, MapPin, Zap, Users, AlertCircle } from 'lucide-react';
import { Patient, Bed as BedType, AllocationMethod, AllocationResult } from '@/types/hospital';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface BedAllocationProps {
  patients: Patient[];
  beds: BedType[];
  waitingQueue: Patient[];
  onAllocateBed: (patientId: string, method: AllocationMethod, specificBedId?: string) => AllocationResult;
  onAutoAllocateNext: () => AllocationResult | null;
}

const statusColors = {
  available: 'bg-available text-available-foreground',
  occupied: 'bg-occupied text-occupied-foreground',
  maintenance: 'bg-maintenance text-maintenance-foreground',
};

const wardColors = {
  ICU: 'border-critical',
  Emergency: 'border-high',
  General: 'border-low',
};

export const BedAllocation = ({ 
  patients, 
  beds, 
  waitingQueue, 
  onAllocateBed, 
  onAutoAllocateNext 
}: BedAllocationProps) => {
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [selectedBed, setSelectedBed] = useState<string>('');
  const { toast } = useToast();

  const handleManualAllocation = () => {
    if (!selectedPatient || !selectedBed) {
      toast({
        title: "Selection Required",
        description: "Please select both a patient and a bed",
        variant: "destructive",
      });
      return;
    }

    const result = onAllocateBed(selectedPatient, 'manual', selectedBed);
    
    toast({
      title: result.success ? "Allocation Successful" : "Allocation Failed",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    });

    if (result.success) {
      setSelectedPatient('');
      setSelectedBed('');
    }
  };

  const handleAutoAllocation = () => {
    const result = onAutoAllocateNext();
    
    if (result) {
      toast({
        title: result.success ? "Auto-Allocation Successful" : "Auto-Allocation Failed",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
    } else {
      toast({
        title: "No Patients",
        description: "No patients in waiting queue",
        variant: "destructive",
      });
    }
  };

  const getPatientForBed = (bedId: string) => {
    return patients.find(p => p.bedId === bedId);
  };

  const availableBeds = beds.filter(b => b.status === 'available');
  const occupiedBeds = beds.filter(b => b.status === 'occupied');
  const maintenanceBeds = beds.filter(b => b.status === 'maintenance');

  const bedsByWard = beds.reduce((acc, bed) => {
    if (!acc[bed.ward]) acc[bed.ward] = [];
    acc[bed.ward].push(bed);
    return acc;
  }, {} as Record<string, BedType[]>);

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
              <MapPin className="h-5 w-5 text-secondary-foreground" />
            </div>
            <div>
              <div className="text-2xl font-bold">{waitingQueue.length}</div>
              <div className="text-sm text-muted-foreground">Waiting</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Allocation Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Automatic Allocation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Automatic Allocation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Priority-based CPU scheduling algorithm will automatically assign the next patient to the most suitable bed.
            </p>
            <Button 
              onClick={handleAutoAllocation} 
              className="w-full"
              disabled={waitingQueue.length === 0}
            >
              <Zap className="h-4 w-4 mr-2" />
              Auto-Allocate Next Patient
            </Button>
          </CardContent>
        </Card>

        {/* Manual Allocation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-accent" />
              Manual Allocation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Patient</label>
              <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose patient from queue" />
                </SelectTrigger>
                <SelectContent>
                  {waitingQueue.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name} - {patient.priority.toUpperCase()} ({patient.condition})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Select Bed</label>
              <Select value={selectedBed} onValueChange={setSelectedBed}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose available bed" />
                </SelectTrigger>
                <SelectContent>
                  {availableBeds.map((bed) => (
                    <SelectItem key={bed.id} value={bed.id}>
                      {bed.number} - {bed.ward}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleManualAllocation} 
              className="w-full"
              variant="outline"
              disabled={!selectedPatient || !selectedBed}
            >
              <Users className="h-4 w-4 mr-2" />
              Manually Allocate
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Bed Grid by Ward */}
      <div className="space-y-6">
        {Object.entries(bedsByWard).map(([ward, wardBeds]) => (
          <Card key={ward}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {ward} Ward ({wardBeds.length} beds)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {wardBeds.map((bed) => {
                  const patient = getPatientForBed(bed.id);
                  return (
                    <div
                      key={bed.id}
                      className={cn(
                        "p-4 border-2 rounded-lg transition-all",
                        wardColors[ward as keyof typeof wardColors],
                        bed.status === 'available' && "hover:shadow-md cursor-pointer"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-mono text-sm font-medium">{bed.number}</div>
                        <Badge className={statusColors[bed.status]}>
                          {bed.status}
                        </Badge>
                      </div>
                      
                      {patient && (
                        <div className="space-y-1">
                          <div className="font-medium text-sm">{patient.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {patient.condition}
                          </div>
                          <Badge className={`text-xs ${{
                            critical: 'bg-critical text-critical-foreground',
                            high: 'bg-high text-high-foreground',
                            medium: 'bg-medium text-medium-foreground',
                            low: 'bg-low text-low-foreground',
                          }[patient.priority]}`}>
                            {patient.priority.toUpperCase()}
                          </Badge>
                        </div>
                      )}

                      {bed.status === 'available' && (
                        <div className="text-xs text-available font-medium mt-2">
                          Ready for patient
                        </div>
                      )}

                      {bed.status === 'maintenance' && (
                        <div className="text-xs text-maintenance font-medium mt-2">
                          Under maintenance
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};