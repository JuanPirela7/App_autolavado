import { Component, inject } from '@angular/core';
import { DashboardComponent } from './dashboard.component';
import { SimulationService } from './simulation.service';
import { StationComponent } from './station.component';

@Component({
  selector: 'app-root',
  imports: [StationComponent, DashboardComponent],
  template: `
    <div class="app-shell">
      <header class="topbar">
        <div class="brand">
          <div class="brand-mark">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path
                d="M12 2.2s6.8 7.1 6.8 11.4a6.8 6.8 0 1 1-13.6 0C5.2 9.3 12 2.2 12 2.2z"
              />
            </svg>
          </div>
          <div>
            <h1>Autolavado · Simulador</h1>
            <p class="subtitle">
              Tiempo transcurrido <strong>{{ simulation.elapsedTime() }}s</strong>
            </p>
          </div>
        </div>

        <div class="controls">
          <button type="button" class="btn primary" (click)="start()" [disabled]="simulation.isRunning()">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5.1v13.8c0 .8.9 1.3 1.6.9l11-6.9a1.1 1.1 0 0 0 0-1.8l-11-6.9A1.1 1.1 0 0 0 8 5.1z" />
            </svg>
            Iniciar
          </button>
          <button type="button" class="btn secondary" (click)="stop()" [disabled]="!simulation.isRunning()">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <rect x="6" y="5" width="4.2" height="14" rx="1.2" />
              <rect x="13.8" y="5" width="4.2" height="14" rx="1.2" />
            </svg>
            Detener
          </button>
          <button type="button" class="btn danger" (click)="reset()">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M3 12a9 9 0 1 0 3-6.7" />
              <path d="M3 3v6h6" />
            </svg>
            Reiniciar
          </button>
        </div>
      </header>

      <section class="toolbar">
        <div class="toolbar-left">
          <span class="toolbar-label">Velocidad</span>
          <div class="speed-stepper">
            <button type="button" (click)="decreaseSpeed()" [disabled]="!simulation.canDecreaseSpeed()" aria-label="Disminuir velocidad">
              −
            </button>
            <span class="speed-value">{{ simulation.speedLabel() }}</span>
            <button type="button" (click)="increaseSpeed()" [disabled]="!simulation.canIncreaseSpeed()" aria-label="Aumentar velocidad">
              +
            </button>
          </div>
          <span class="chip">Tick · {{ simulation.currentTickMs() }} ms</span>
        </div>
        <div class="run-state">
          <span class="run-dot" [class.running]="simulation.isRunning()"></span>
          {{ simulation.isRunning() ? 'En ejecución' : 'En pausa' }}
        </div>
      </section>

      <div class="section-head">
        <h2>Estaciones de trabajo</h2>
        <div class="legend">
          <span class="legend-item"><span class="legend-dot free"></span>Libre</span>
          <span class="legend-item"><span class="legend-dot busy"></span>Ocupado</span>
          <span class="legend-item"><span class="legend-dot blocked"></span>Bloqueado</span>
        </div>
      </div>

      <section class="stations-grid">
        @for (station of simulation.stations(); track station.id) {
          <app-station [station]="station"></app-station>
        }
      </section>

      <app-dashboard [metrics]="simulation.metrics()"></app-dashboard>
    </div>
  `,
})
export class AppComponent {
  protected readonly simulation = inject(SimulationService);

  protected start(): void {
    this.simulation.start();
  }

  protected stop(): void {
    this.simulation.stop();
  }

  protected reset(): void {
    this.simulation.reset();
  }

  protected increaseSpeed(): void {
    this.simulation.increaseSpeed();
  }

  protected decreaseSpeed(): void {
    this.simulation.decreaseSpeed();
  }
}