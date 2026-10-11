export type StationStatus = 'free' | 'busy' | 'blocked';
export type CarStatus = 'waiting' | 'in-service' | 'done';

export interface Car {
  readonly id: number;
  readonly color: string;
  status: CarStatus;
  currentStationIndex: number;
  readonly arrivalTime: number;
  serviceStartTime: number | null;
  serviceEndTime: number | null;
}

export interface Station {
  readonly id: number;
  readonly name: string;
  status: StationStatus;
  currentCar: Car | null;
  serviceRemaining: number;
  queue: Car[];
  readonly serviceDuration: number;
  readonly capacity: number;
  totalServiceTime: number;
  busyTime: number;
  carsProcessed: number;
}

export interface StationUsage {
  readonly name: string;
  readonly percentage: number;
}

export interface SimulationMetrics {
  totalRevenue: number;
  totalInvoices: number;
  totalCarsGenerated: number;
  bottleneckStation: string;
  bottleneckPercentage: number;
  stationUsage: StationUsage[];
  avgServiceTime: number;
}
