import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserMinus, Clock, MapPin, AlertTriangle } from 'lucide-react';
import { Patient, Bed } from '@/types/hospital';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface DischargeManagementProps {
  patients: Patient[];
  beds: Bed[];
  onDischargePatient: (patientId: string) => { success: boolean; message: string };
}

const priorityColors = {
  critical: 'bg-critical text-critical-foreground',
  high: 'bg-high text-high-foreground',
  medium: 'bg-medium text-medium-foreground',
  low: 'bg-low text-low-foreground',
};

export const DischargeManagement = ({ patients, beds, onDischargePatient }: DischargeManagementProps) => {
  const { toast } = useToast();

  const handleDischarge = (patientId: string) => {
    const result = onDischargePatient(patientId);
    
    toast({
      title: result.success ? "Discharge Successful" : "Discharge Failed",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    });
  };

  const getBedForPatient = (patientId: string) => {
    return beds.find(b => b.patientId === patientId);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDuration = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const allocatedPatients = patients.filter(p => p.bedId);
  const criticalPatients = allocatedPatients.filter(p => p.priority === 'critical');
  const highPriorityPatients = allocatedPatients.filter(p => p.priority === 'high');
  const regularPatients = allocatedPatients.filter(p => ['medium', 'low'].includes(p.priority));

  const isOverdue = (patient: Patient) => {
    const hoursStayed = (new Date().getTime() - patient.arrivalTime.getTime()) / (1000 * 60 * 60);
    return hoursStayed > patient.estimatedStay;
  };

  return (
    <div className="space-y-6">
      {/* Discharge Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 bg-critical/10 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-critical" />
            </div>
            <div>
              <div className="text-2xl font-bold">{criticalPatients.length}</div>
              <div className="text-sm text-muted-foreground">Critical Care</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 bg-high/10 rounded-lg">
              <UserMinus className="h-5 w-5 text-high" />
            </div>
            <div>
              <div className="text-2xl font-bold">{highPriorityPatients.length}</div>
              <div className="text-sm text-muted-foreground">High Priority</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{allocatedPatients.filter(isOverdue).length}</div>
              <div className="text-sm text-muted-foreground">Overdue</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Care Patients */}
      {criticalPatients.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-critical">
              <AlertTriangle className="h-5 w-5" />
              Critical Care Patients ({criticalPatients.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criticalPatients.map((patient) => {
                const bed = getBedForPatient(patient.id);
                const overdue = isOverdue(patient);
                
                return (
                  <div key={patient.id} className="flex items-center justify-between p-4 border border-critical/20 rounded-lg bg-critical/5">
                    <div className="flex items-center gap-4">
                      <div className="space-y-1">
                        <div className="font-medium">{patient.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Age: {patient.age} • {patient.condition}
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <MapPin className="h-3 w-3" />
                          <span>{bed?.number} ({bed?.ward})</span>
                          <Clock className="h-3 w-3 ml-2" />
                          <span>Arrived: {formatTime(patient.arrivalTime)}</span>
                          <span>({formatDuration(patient.arrivalTime)} ago)</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {overdue && (
                        <Badge variant="destructive" className="text-xs">
                          OVERDUE
                        </Badge>
                      )}
                      <Badge className={priorityColors[patient.priority]}>
                        {patient.priority.toUpperCase()}
                      </Badge>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDischarge(patient.id)}
                        className="ml-2"
                      >
                        <UserMinus className="h-4 w-4 mr-1" />
                        Discharge
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Allocated Patients */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserMinus className="h-5 w-5 text-primary" />
            All Allocated Patients ({allocatedPatients.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allocatedPatients.length === 0 ? (
            <div className="text-center py-8">
              <UserMinus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No patients currently allocated</p>
              <p className="text-sm text-muted-foreground">All beds are available for new admissions</p>
            </div>
          ) : (
            <div className="space-y-3">
              {allocatedPatients
                .sort((a, b) => {
                  // Sort by priority first, then by arrival time
                  const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
                  if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                  }
                  return a.arrivalTime.getTime() - b.arrivalTime.getTime();
                })
                .map((patient) => {
                  const bed = getBedForPatient(patient.id);
                  const overdue = isOverdue(patient);
                  
                  return (
                    <div 
                      key={patient.id} 
                      className={cn(
                        "flex items-center justify-between p-4 border rounded-lg transition-all",
                        overdue && "border-destructive/50 bg-destructive/5",
                        patient.priority === 'critical' && "border-critical/30 bg-critical/5"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className="space-y-1">
                          <div className="font-medium">{patient.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Age: {patient.age} • {patient.condition}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>{bed?.number} ({bed?.ward})</span>
                            <Clock className="h-3 w-3 ml-2" />
                            <span>Arrived: {formatTime(patient.arrivalTime)}</span>
                            <span>({formatDuration(patient.arrivalTime)} ago)</span>
                            <span>• Est. stay: {patient.estimatedStay}h</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {overdue && (
                          <Badge variant="destructive" className="text-xs">
                            OVERDUE
                          </Badge>
                        )}
                        <Badge className={priorityColors[patient.priority]}>
                          {patient.priority.toUpperCase()}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDischarge(patient.id)}
                          className="ml-2"
                        >
                          <UserMinus className="h-4 w-4 mr-1" />
                          Discharge
                        </Button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};