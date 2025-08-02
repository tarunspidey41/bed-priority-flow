import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Users, 
  Bed, 
  UserMinus, 
  Clock,
  AlertCircle,
  TrendingUp,
  Hospital,
  Brain,
  BarChart3
} from 'lucide-react';
import { PatientManagement } from '@/components/PatientManagement';
import { BedAllocation } from '@/components/BedAllocation';
import { DischargeManagement } from '@/components/DischargeManagement';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { useAdvancedHospitalData } from '@/hooks/useAdvancedHospitalData';

const Index = () => {
  const {
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
  } = useAdvancedHospitalData();

  const availableBeds = beds.filter(b => b.status === 'available').length;
  const occupiedBeds = beds.filter(b => b.status === 'occupied').length;
  const totalBeds = beds.length;
  const occupancyRate = Math.round((occupiedBeds / totalBeds) * 100);

  const criticalPatients = patients.filter(p => p.priority === 'critical').length;
  const highPriorityPatients = patients.filter(p => p.priority === 'high').length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Hospital className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Hospital Bed Management System</h1>
              <p className="text-muted-foreground">Priority-Based CPU Scheduling Simulation for Patient Allocation</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Dashboard Overview */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            System Overview
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="flex items-center gap-3 p-6">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Bed className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-3xl font-bold">{availableBeds}</div>
                  <div className="text-sm text-muted-foreground">Available Beds</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-3 p-6">
                <div className="p-3 bg-occupied/10 rounded-lg">
                  <Users className="h-6 w-6 text-occupied" />
                </div>
                <div>
                  <div className="text-3xl font-bold">{occupiedBeds}</div>
                  <div className="text-sm text-muted-foreground">Occupied Beds</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-3 p-6">
                <div className="p-3 bg-secondary rounded-lg">
                  <Clock className="h-6 w-6 text-secondary-foreground" />
                </div>
                <div>
                  <div className="text-3xl font-bold">{waitingQueue.length}</div>
                  <div className="text-sm text-muted-foreground">Waiting Queue</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-3 p-6">
                <div className="p-3 bg-accent/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <div className="text-3xl font-bold">{occupancyRate}%</div>
                  <div className="text-sm text-muted-foreground">Occupancy Rate</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Priority Alerts */}
        {(criticalPatients > 0 || highPriorityPatients > 0 || waitingQueue.length > 3) && (
          <div className="mb-6">
            <Card className="border-medium bg-medium/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-medium" />
                  <span className="font-medium">System Alerts</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {criticalPatients > 0 && (
                    <Badge className="bg-critical text-critical-foreground">
                      {criticalPatients} Critical Patient{criticalPatients > 1 ? 's' : ''}
                    </Badge>
                  )}
                  {highPriorityPatients > 0 && (
                    <Badge className="bg-high text-high-foreground">
                      {highPriorityPatients} High Priority Patient{highPriorityPatients > 1 ? 's' : ''}
                    </Badge>
                  )}
                  {waitingQueue.length > 3 && (
                    <Badge className="bg-medium text-medium-foreground">
                      {waitingQueue.length} Patients Waiting
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Modules */}
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics & AI
            </TabsTrigger>
            <TabsTrigger value="patients" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Patient Management
            </TabsTrigger>
            <TabsTrigger value="allocation" className="flex items-center gap-2">
              <Bed className="h-4 w-4" />
              Bed Allocation
            </TabsTrigger>
            <TabsTrigger value="discharge" className="flex items-center gap-2">
              <UserMinus className="h-4 w-4" />
              Discharge Management
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsDashboard
              metrics={metrics}
              simulationSettings={simulationSettings}
              currentAlgorithm={currentAlgorithm}
              emergencyLevel={emergencyLevel}
              onSimulationSettingsChange={setSimulationSettings}
              onAlgorithmChange={setCurrentAlgorithm}
              onEmergencyTrigger={setEmergencyLevel}
            />
          </TabsContent>

          <TabsContent value="patients" className="space-y-6">
            <PatientManagement
              patients={patients}
              waitingQueue={waitingQueue}
              onAddPatient={addPatient}
            />
          </TabsContent>

          <TabsContent value="allocation" className="space-y-6">
            <BedAllocation
              patients={patients}
              beds={beds}
              waitingQueue={waitingQueue}
              onAllocateBed={allocateBed}
              onAutoAllocateNext={autoAllocateNext}
            />
          </TabsContent>

          <TabsContent value="discharge" className="space-y-6">
            <DischargeManagement
              patients={patients}
              beds={beds}
              onDischargePatient={dischargePatient}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;