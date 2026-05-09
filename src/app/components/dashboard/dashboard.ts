import {
  Component,
  inject,
  signal,
  afterNextRender,
  ViewChild,
  ElementRef,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AccountService } from '../../services/account';
import { DashboardStats } from '../../models/account.model';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private accountService = inject(AccountService);
  private platformId = inject(PLATFORM_ID);

  @ViewChild('pieChartCanvas') pieChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barChartCanvas') barChartCanvas!: ElementRef<HTMLCanvasElement>;

  stats = signal<DashboardStats | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor() {
    afterNextRender(() => {
      this.loadStats();
    });
  }

  loadStats() {
    this.accountService.getStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.loading.set(false);
        setTimeout(() => this.initCharts(data), 0);
      },
      error: () => {
        this.error.set('Failed to load dashboard statistics.');
        this.loading.set(false);
      },
    });
  }

  async initCharts(data: DashboardStats) {
    if (!isPlatformBrowser(this.platformId)) return;

    const { Chart, registerables } = await import('chart.js');
    Chart.register(...registerables);

    if (this.pieChartCanvas?.nativeElement) {
      new Chart(this.pieChartCanvas.nativeElement, {
        type: 'doughnut',
        data: {
          labels: Object.keys(data.accountsByType).map((k) =>
            k === 'CurrentBankAccount' ? 'Current' : 'Savings',
          ),
          datasets: [
            {
              data: Object.values(data.accountsByType),
              backgroundColor: ['#4f46e5', '#7c3aed'],
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } },
          cutout: '65%',
        },
      });
    }

    if (this.barChartCanvas?.nativeElement) {
      new Chart(this.barChartCanvas.nativeElement, {
        type: 'bar',
        data: {
          labels: data.operationsByDay.map((d) => d.date),
          datasets: [
            {
              label: 'Transactions',
              data: data.operationsByDay.map((d) => d.count),
              backgroundColor: '#6366f1',
              borderRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
            x: { grid: { display: false } },
          },
        },
      });
    }
  }
}
