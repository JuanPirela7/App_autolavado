import { Injectable, computed, signal } from '@angular/core';
import { Car, SimulationMetrics, Station, StationUsage, StationStatus } from './simulation.models';

interface SpeedOption {
  readonly label: string;
  readonly tickMs: number;
}

interface StationSpec {
  readonly name: string;
  readonly serviceDuration: number;
}

const CAR_COLORS: readonly string[] = [
  '#e53935',
  '#3949ab',
  '#00897b',
  '#8e24aa',
  '#f4511e',
  '#43a047',
  '#00acc1',
  '#fb8c00',
];

@Injectable({
  providedIn: 'root',
})
export class SimulationService {
  private readonly arrivalProbability = 0.35;
  private readonly costPerCar = 50;
  private readonly downstreamCapacity = 2;

  private readonly stationSpecs: readonly StationSpec[] = [
    { name: 'Llegada', serviceDuration: 2 },
    { name: 'Aspirado', serviceDuration: 3 },
    { name: 'Lavado', serviceDuration: 4 },
    { name: 'Secado', serviceDuration: 3 },
  ];

  readonly speedOptions: readonly SpeedOption[] = [
    { label: '0.5x', tickMs: 1600 },
    { label: '1x', tickMs: 800 },
    { label: '2x', tickMs: 400 },
    { label: '4x', tickMs: 200 },
  ];

  readonly isRunning = signal<boolean>(false);
  readonly stations = signal<Station[]>(this.createInitialStations());
  readonly elapsedTime = signal<number>(0);
  readonly totalRevenue = signal<number>(0);
  readonly totalInvoices = signal<number>(0);
  readonly totalCarsGenerated = signal<number>(0);
  readonly speedIndex = signal<number>(1);

  private readonly serviceTimeSum = signal<number>(0);
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private carIdCounter = 0;

  readonly speedLabel = computed<string>(() => this.speedOptions[this.speedIndex()].label);
  readonly canIncreaseSpeed = computed<boolean>(
    () => this.speedIndex() < this.speedOptions.length - 1,
  );
  readonly canDecreaseSpeed = computed<boolean>(() => this.speedIndex() > 0);
  readonly currentTickMs = computed<number>(() => this.speedOptions[this.speedIndex()].tickMs);

  readonly metrics = computed<SimulationMetrics>(() => {
    const stationList = this.stations();
    const elapsed = this.elapsedTime();
    const invoices = this.totalInvoices();

    const stationUsage: StationUsage[] = stationList.map((station) => ({
      name: station.name,
      percentage:
        elapsed > 0 ? Math.min(100, Math.round((station.busyTime / elapsed) * 100)) : 0,
    }));

    let bottleneckStation = 'Sin congestión';
    let maxQueue = 0;
    let totalQueued = 0;

    for (const station of stationList) {
      totalQueued += station.queue.length;
      if (station.queue.length > maxQueue) {
        maxQueue = station.queue.length;
        bottleneckStation = station.name;
      }
    }

    const bottleneckPercentage =
      totalQueued > 0 ? Math.round((maxQueue / totalQueued) * 100) : 0;

    return {
      totalRevenue: this.totalRevenue(),
      totalInvoices: invoices,
      totalCarsGenerated: this.totalCarsGenerated(),
      bottleneckStation,
      bottleneckPercentage,
      stationUsage,
      avgServiceTime: invoices > 0 ? this.serviceTimeSum() / invoices : 0,
    };
  });

  start(): void {
    if (this.isRunning()) {
      return;
    }
    this.isRunning.set(true);
    this.scheduleInterval();
  }

  stop(): void {
    if (!this.isRunning()) {
      return;
    }
    this.isRunning.set(false);
    this.clearInterval();
  }

  reset(): void {
    this.stop();
    this.stations.set(this.createInitialStations());
    this.elapsedTime.set(0);
    this.totalRevenue.set(0);
    this.totalInvoices.set(0);
    this.totalCarsGenerated.set(0);
    this.serviceTimeSum.set(0);
    this.speedIndex.set(1);
    this.carIdCounter = 0;
  }

  increaseSpeed(): void {
    if (!this.canIncreaseSpeed()) {
      return;
    }
    this.speedIndex.update((index) => index + 1);
    this.restartIntervalIfRunning();
  }

  decreaseSpeed(): void {
    if (!this.canDecreaseSpeed()) {
      return;
    }
    this.speedIndex.update((index) => index - 1);
    this.restartIntervalIfRunning();
  }

  private restartIntervalIfRunning(): void {
    if (this.isRunning()) {
      this.scheduleInterval();
    }
  }

  private scheduleInterval(): void {
    this.clearInterval();
    this.intervalId = setInterval(() => this.tick(), this.currentTickMs());
  }

  private clearInterval(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private tick(): void {
    this.elapsedTime.update((time) => time + 1);

    const working = this.stations().map((station) => this.cloneStation(station));

    if (Math.random() < this.arrivalProbability) {
      this.spawnCar(working);
    }

    for (let index = working.length - 1; index >= 0; index -= 1) {
      this.processStation(working, index);
    }

    this.stations.set(working);
  }

  private processStation(working: Station[], index: number): void {
    const station = working[index];
    if (!station) {
      return;
    }

    const wasOccupied = station.currentCar !== null;

    if (station.currentCar !== null) {
      if (station.serviceRemaining > 0) {
        station.serviceRemaining -= 1;
      }

      if (station.serviceRemaining === 0) {
        this.dischargeCar(working, index);
      } else {
        station.status = 'busy';
      }
    } else {
      this.pullFromQueue(station);
    }

    if (wasOccupied || station.currentCar !== null) {
      station.busyTime += 1;
    }
  }

  private dischargeCar(working: Station[], index: number): void {
    const station = working[index];
    if (!station || station.currentCar === null) {
      return;
    }

    const car = station.currentCar;
    const isLastStation = index === working.length - 1;

    if (isLastStation) {
      this.finishCar(car);
      this.releaseStation(station);
      this.pullFromQueue(station);
      return;
    }

    const next = working[index + 1];
    if (!next) {
      station.status = 'blocked';
      return;
    }

    const canAccept = next.currentCar === null || next.queue.length < next.capacity;

    if (!canAccept) {
      station.status = 'blocked';
      return;
    }

    next.queue.push({
      ...car,
      status: 'waiting',
      currentStationIndex: index + 1,
      serviceEndTime: this.elapsedTime(),
    });
    this.releaseStation(station);
    this.pullFromQueue(station);
  }

  private releaseStation(station: Station): void {
    station.currentCar = null;
    station.serviceRemaining = 0;
    station.carsProcessed += 1;
    station.totalServiceTime += station.serviceDuration;
    station.status = 'free';
  }

  private pullFromQueue(station: Station): void {
    if (station.queue.length === 0) {
      station.currentCar = null;
      station.serviceRemaining = 0;
      station.status = 'free';
      return;
    }

    const nextCar = station.queue.shift();
    if (!nextCar) {
      station.status = 'free';
      return;
    }

    station.currentCar = {
      ...nextCar,
      status: 'in-service',
      serviceStartTime: this.elapsedTime(),
      currentStationIndex: station.id - 1,
    };
    station.serviceRemaining = station.serviceDuration;
    station.status = 'busy';
  }

  private spawnCar(working: Station[]): void {
    const entry = working[0];
    if (!entry) {
      return;
    }

    this.carIdCounter += 1;
    const car: Car = {
      id: this.carIdCounter,
      color: CAR_COLORS[this.carIdCounter % CAR_COLORS.length] ?? '#333333',
      status: 'waiting',
      currentStationIndex: 0,
      arrivalTime: this.elapsedTime(),
      serviceStartTime: null,
      serviceEndTime: null,
    };

    entry.queue.push(car);
    this.totalCarsGenerated.update((total) => total + 1);
  }

  private finishCar(car: Car): void {
    const totalTime = this.elapsedTime() - car.arrivalTime;
    this.totalRevenue.update((revenue) => revenue + this.costPerCar);
    this.totalInvoices.update((total) => total + 1);
    this.serviceTimeSum.update((sum) => sum + totalTime);
  }

  private cloneStation(station: Station): Station {
    return {
      ...station,
      currentCar: station.currentCar === null ? null : { ...station.currentCar },
      queue: station.queue.map((car) => ({ ...car })),
    };
  }

  private createInitialStations(): Station[] {
    return this.stationSpecs.map((spec, index) => ({
      id: index + 1,
      name: spec.name,
      status: 'free' as StationStatus,
      currentCar: null,
      serviceRemaining: 0,
      queue: [],
      serviceDuration: spec.serviceDuration,
      capacity: spec.name === 'Llegada' ? Number.POSITIVE_INFINITY : this.downstreamCapacity,
      totalServiceTime: 0,
      busyTime: 0,
      carsProcessed: 0,
    }));
  }
}
