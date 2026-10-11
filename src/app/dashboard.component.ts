import { DecimalPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { SimulationMetrics } from './simulation.models';

@Component({
  selector: 'app-dashboard',
  imports: [DecimalPipe],
  template: `
    <div class="dashboard-grid">
      <article class="metric revenue">
        <div class="metric-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M16.5 9.2A4.5 4.5 0 0 0 12 7.5c-2 0-3.5 1-3.5 2.5s1.4 2.3 3.5 2.6 3.5 1 3.5 2.4-1.6 2.5-3.5 2.5a4.5 4.5 0 0 1-4.5-1.8" />
            <path d="M12 6v2.2M12 15.8V18" />
          </svg>
        </div>
        <span class="metric-label">Ingresos Totales</span>
        <p class="metric-value">\${{ metrics().totalRevenue | number }}</p>
        <span class="metric-hint">\$50 por carro finalizado</span>
      </article>

      <article class="metric invoices">
        <div class="metric-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M6 3h12a1 1 0 0 1 1 1v17l-3.5-2-3.5 2-3.5-2L5 21V4a1 1 0 0 1 1-1z" />
            <path d="M9 8h6M9 12h6" />
          </svg>
        </div>
        <span class="metric-label">Facturas Totales</span>
        <p class="metric-value">{{ metrics().totalInvoices }}</p>
        <span class="metric-hint">Carros que completaron el ciclo</span>
      </article>

      <article class="metric generated">
        <div class="metric-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M5 17h14M6 17l-1.2-4.2A2 2 0 0 1 6.7 11h10.6a2 2 0 0 1 1.9 1.8L18 17" />
            <path d="M7 11l1.2-2.6A2 2 0 0 1 10 7h4a2 2 0 0 1 1.8 1.4L17 11" />
            <circle cx="7.5" cy="19" r="1.3" />
            <circle cx="16.5" cy="19" r="1.3" />
          </svg>
        </div>
        <span class="metric-label">Carros Generados</span>
        <p class="metric-value">{{ metrics().totalCarsGenerated }}</p>
        <span class="metric-hint">Total que ingresaron al sistema</span>
      </article>

      <article class="metric bottleneck">
        <div class="metric-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
            <path d="M12 9v4M12 17h.01" />
          </svg>
        </div>
        <span class="metric-label">Cuello de Botella</span>
        <p class="metric-value sm">{{ metrics().bottleneckStation }}</p>
        <span class="metric-hint">{{ metrics().bottleneckPercentage }}% de congestión</span>
      </article>

      <article class="metric time">
        <div class="metric-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
        </div>
        <span class="metric-label">Tiempo Prom. Total</span>
        <p class="metric-value">{{ metrics().avgServiceTime | number: '1.0-1' }}s</p>
        <span class="metric-hint">Desde llegada hasta salida</span>
      </article>
    </div>

    <section class="panel">
      <div class="panel-head">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
        </svg>
        <h3>Utilización por Estación</h3>
      </div>

      @for (item of metrics().stationUsage; track item.name) {
        <div class="usage-row">
          <span class="usage-name">{{ item.name }}</span>
          <div class="usage-track">
            <div class="usage-fill" [style.width.%]="item.percentage"></div>
          </div>
          <span class="usage-pct">{{ item.percentage }}%</span>
        </div>
      }
    </section>
  `,
})
export class DashboardComponent {
  readonly metrics = input.required<SimulationMetrics>();
}