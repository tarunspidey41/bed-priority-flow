import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  AlertTriangle, 
  Activity,
  Brain,
  Zap,
  Timer,
  Users,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { SchedulingAlgorithm, SimulationSettings, SystemMetrics, EmergencyLevel } from '@/types/hospital';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, BarChart, Bar } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';

interface AnalyticsDashboardProps {
  metrics: SystemMetrics;
  simulationSettings: SimulationSettings;
  currentAlgorithm: SchedulingAlgorithm;
  emergencyLevel: EmergencyLevel;
  onSimulationSettingsChange: (settings: SimulationSettings) => void;
  onAlgorithmChange: (algorithm: SchedulingAlgorithm) => void;
  onEmergencyTrigger: (level: EmergencyLevel) => void;
}

const algorithmData = [
  { name: 'Priority', waitTime: 15, throughput: 85, satisfaction: 90 },
  { name: 'FCFS', waitTime: 25, throughput: 70, satisfaction: 75 },
  { name: 'SJF', waitTime: 12, throughput: 88, satisfaction: 85 },
  { name: 'Round Robin', waitTime: 20, throughput: 80, satisfaction: 82 },
];

const performanceData = [
  { time: '00:00', patients: 45, beds: 85, efficiency: 88 },
  { time: '04:00', patients: 52, beds: 90, efficiency: 85 },
  { time: '08:00', patients: 68, beds: 95, efficiency: 92 },
  { time: '12:00', patients: 75, beds: 88, efficiency: 89 },
  { time: '16:00', patients: 82, beds: 92, efficiency: 94 },
  { time: '20:00', patients: 71, beds: 87, efficiency: 91 },
];

export const AnalyticsDashboard = ({ 
  metrics, 
  simulationSettings, 
  currentAlgorithm, 
  emergencyLevel,
  onSimulationSettingsChange,
  onAlgorithmChange,
  onEmergencyTrigger 
}: AnalyticsDashboardProps) => {
  const [selectedMetric, setSelectedMetric] = useState<'patients' | 'beds' | 'efficiency'>('patients');

  const handleSimulationToggle = () => {
    onSimulationSettingsChange({
      ...simulationSettings,
      enabled: !simulationSettings.enabled
    });
  };

  const handleSpeedChange = (speed: number[]) => {
    onSimulationSettingsChange({
      ...simulationSettings,
      speed: speed[0]
    });
  };

  const handleAutoPatientToggle = () => {
    onSimulationSettingsChange({
      ...simulationSettings,
      autoGeneratePatients: !simulationSettings.autoGeneratePatients
    });
  };

  const handleEmergencyToggle = () => {
    onSimulationSettingsChange({
      ...simulationSettings,
      enableEmergencies: !simulationSettings.enableEmergencies
    });
  };

  const resetSimulation = () => {
    onSimulationSettingsChange({
      enabled: false,
      speed: 1,
      autoGeneratePatients: false,
      patientArrivalRate: 2,
      enableEmergencies: false,
      emergencyProbability: 0.05,
    });
    onEmergencyTrigger('none');
  };

  const emergencyColors = {
    none: 'bg-available text-available-foreground',
    'code-blue': 'bg-primary text-primary-foreground',
    'code-red': 'bg-critical text-critical-foreground',
    'mass-casualty': 'bg-destructive text-destructive-foreground',
  };

  return (
    <div className="space-y-6">
      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{metrics.totalPatients}</div>
              <div className="text-sm text-muted-foreground">Total Patients</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Timer className="h-5 w-5 text-accent" />
            </div>
            <div>
              <div className="text-2xl font-bold">{metrics.averageWaitTime}m</div>
              <div className="text-sm text-muted-foreground">Avg Wait Time</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 bg-available/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-available" />
            </div>
            <div>
              <div className="text-2xl font-bold">{metrics.bedUtilization}%</div>
              <div className="text-sm text-muted-foreground">Bed Utilization</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 bg-critical/10 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-critical" />
            </div>
            <div>
              <div className="text-2xl font-bold">{metrics.criticalPatients}</div>
              <div className="text-sm text-muted-foreground">Critical Cases</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Emergency Status */}
      {emergencyLevel !== 'none' && (
        <Card className="border-critical bg-critical/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-critical animate-pulse" />
                <span className="font-semibold text-critical">EMERGENCY PROTOCOL ACTIVE</span>
              </div>
              <Badge className={emergencyColors[emergencyLevel]}>
                {emergencyLevel.toUpperCase().replace('-', ' ')}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Simulation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Real-Time Hospital Simulation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Simulation Control */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="simulation">Simulation</Label>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={simulationSettings.enabled ? "destructive" : "default"}
                    onClick={handleSimulationToggle}
                  >
                    {simulationSettings.enabled ? (
                      <>
                        <Pause className="h-4 w-4 mr-1" />
                        Stop
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-1" />
                        Start
                      </>
                    )}
                  </Button>
                  <Button size="sm" variant="outline" onClick={resetSimulation}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Speed: {simulationSettings.speed}x</Label>
                <Slider
                  value={[simulationSettings.speed]}
                  onValueChange={handleSpeedChange}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>

            {/* Algorithm Selection */}
            <div className="space-y-4">
              <Label>CPU Scheduling Algorithm</Label>
              <Select value={currentAlgorithm} onValueChange={(value: SchedulingAlgorithm) => onAlgorithmChange(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="priority">Priority Scheduling</SelectItem>
                  <SelectItem value="fcfs">First Come First Serve</SelectItem>
                  <SelectItem value="sjf">Shortest Job First</SelectItem>
                  <SelectItem value="round-robin">Round Robin</SelectItem>
                </SelectContent>
              </Select>

              <div className="text-sm text-muted-foreground">
                {currentAlgorithm === 'priority' && 'Critical patients get highest priority'}
                {currentAlgorithm === 'fcfs' && 'Patients served in arrival order'}
                {currentAlgorithm === 'sjf' && 'Shortest estimated stay first'}
                {currentAlgorithm === 'round-robin' && 'Balanced priority and stay time'}
              </div>
            </div>

            {/* Emergency Controls */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-patients">Auto Generate Patients</Label>
                <Switch 
                  id="auto-patients"
                  checked={simulationSettings.autoGeneratePatients}
                  onCheckedChange={handleAutoPatientToggle}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="emergencies">Enable Emergencies</Label>
                <Switch 
                  id="emergencies"
                  checked={simulationSettings.enableEmergencies}
                  onCheckedChange={handleEmergencyToggle}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onEmergencyTrigger('code-blue')}
                  className="text-primary"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  Code Blue
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onEmergencyTrigger('code-red')}
                  className="text-critical"
                >
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Code Red
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real-time Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Real-Time Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Area 
                    type="monotone" 
                    dataKey={selectedMetric} 
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary))" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="flex justify-center gap-2 mt-4">
              <Button 
                size="sm" 
                variant={selectedMetric === 'patients' ? 'default' : 'outline'}
                onClick={() => setSelectedMetric('patients')}
              >
                Patients
              </Button>
              <Button 
                size="sm" 
                variant={selectedMetric === 'beds' ? 'default' : 'outline'}
                onClick={() => setSelectedMetric('beds')}
              >
                Bed Usage
              </Button>
              <Button 
                size="sm" 
                variant={selectedMetric === 'efficiency' ? 'default' : 'outline'}
                onClick={() => setSelectedMetric('efficiency')}
              >
                Efficiency
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Algorithm Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Algorithm Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={algorithmData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Bar dataKey="waitTime" fill="hsl(var(--critical))" name="Wait Time (min)" />
                  <Bar dataKey="throughput" fill="hsl(var(--primary))" name="Throughput %" />
                  <Bar dataKey="satisfaction" fill="hsl(var(--available))" name="Satisfaction %" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm font-medium">Current Algorithm</div>
                <Badge variant="outline" className="mt-1">
                  {currentAlgorithm.toUpperCase().replace('-', ' ')}
                </Badge>
              </div>
              <div>
                <div className="text-sm font-medium">Efficiency</div>
                <div className="text-lg font-bold text-primary">{metrics.staffEfficiency}%</div>
              </div>
              <div>
                <div className="text-sm font-medium">Equipment Use</div>
                <div className="text-lg font-bold text-accent">{metrics.equipmentUtilization}%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};