import { Component, computed, input } from '@angular/core';
import { Station } from './simulation.models';

@Component({
  selector: 'app-station',
  imports: [],
  template: `
    <article class="station" [class]="station().status">
      <div class="station-head">
        <div class="name-row">
          <span class="step">{{ station().id }}</span>
          <h3>{{ station().name }}</h3>
        </div>
        <span class="status-badge">
          <span class="status-dot"></span>
          @switch (station().status) {
            @case ('free') {
              Libre
            }
            @case ('busy') {
              Ocupado
            }
            @case ('blocked') {
              Bloqueado
            }
          }
        </span>
      </div>

      <div class="stage">
        @if (station().currentCar; as car) {
          <div class="car-wrap">
            <svg
              class="car-svg"
              viewBox="0 0 64 34"
              [style.--car-color]="car.color"
              [attr.aria-label]="'Carro ' + car.id"
            >
              <path
                d="M6 24h52a2 2 0 0 0 2-2v-4.5a6 6 0 0 0-4.2-5.7l-6.3-2.1-6.2-4.4A5 5 0 0 0 40 4H24a5 5 0 0 0-3.3 1.3L14.5 10 6.9 12.2A6 6 0 0 0 2 17.8V22a2 2 0 0 0 2 2z"
                fill="var(--car-color)"
              />
              <path
                d="M18.5 10.5l4.2-4.1A3 3 0 0 1 25 5.5h14a3 3 0 0 1 2.2 1l4.2 4z"
                fill="rgba(255,255,255,.8)"
              />
              <circle cx="18" cy="25" r="5" fill="#1e293b" />
              <circle cx="18" cy="25" r="2" fill="#cbd5e1" />
              <circle cx="46" cy="25" r="5" fill="#1e293b" />
              <circle cx="46" cy="25" r="2" fill="#cbd5e1" />
            </svg>
            <span class="car-id">#{{ car.id }}</span>
          </div>
        } @else {
          <div class="idle">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.7"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M5 17h14M6 17l-1.2-4.2A2 2 0 0 1 6.7 11h10.6a2 2 0 0 1 1.9 1.8L18 17" />
              <path d="M7 11l1.2-2.6A2 2 0 0 1 10 7h4a2 2 0 0 1 1.8 1.4L17 11" />
              <circle cx="7.5" cy="19" r="1.3" />
              <circle cx="16.5" cy="19" r="1.3" />
            </svg>
            <span>Libre</span>
          </div>
        }
      </div>

      <div class="progress">
        <div class="progress-fill" [style.width.%]="serviceProgress()"></div>
      </div>

      <div class="queue-block">
        <div class="queue-head">
          <span>Cola FIFO</span>
          <span class="queue-count">{{ station().queue.length }}</span>
        </div>
        <div class="queue-items">
          @for (car of station().queue; track car.id) {
            <span class="mini-car" [style.background-color]="car.color" [title]="'Carro #' + car.id"></span>
          } @empty {
            <span class="queue-empty">Sin carros en espera</span>
          }
        </div>
      </div>

      <div class="station-foot">
        <span>Atendidos</span>
        <strong>{{ station().carsProcessed }}</strong>
      </div>
    </article>
  `,
})
export class StationComponent {
  readonly station = input.required<Station>();

  readonly serviceProgress = computed<number>(() => {
    const station = this.station();
    if (station.currentCar === null || station.serviceDuration <= 0) {
      return 0;
    }
    const done = station.serviceDuration - station.serviceRemaining;
    return Math.max(0, Math.min(100, Math.round((done / station.serviceDuration) * 100)));
  });
}