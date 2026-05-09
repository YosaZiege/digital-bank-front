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
  @ViewChild('lineChartCanvas') lineChartCanvas!: ElementRef<HTMLCanvasElement>;

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
        this.error.set('Failed to load dashboard statistics. Make sure the /stats endpoint is available.');
        this.loading.set(false);
      },
    });
  }

  async initCharts(data: DashboardStats) {
    if (!isPlatformBrowser(this.platformId)) return;

    const { Chart, registerables } = await import('chart.js');
    Chart.register(...registerables);

    this.buildPieChart(Chart, data);
    this.buildLineChart(Chart, data);
  }

  private buildPieChart(Chart: any, data: DashboardStats) {
    if (!this.pieChartCanvas?.nativeElement) return;

    const labels = Object.keys(data.accountsByType).map((k) =>
      k === 'CurrentBankAccount' ? 'Current Account' : 'Savings Account',
    );
    const values = Object.values(data.accountsByType);
    const total = values.reduce((a, b) => a + b, 0);

    new Chart(this.pieChartCanvas.nativeElement, {
      type: 'pie',
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: ['#4f46e5', '#7c3aed', '#a855f7', '#ec4899'],
            borderColor: '#ffffff',
            borderWidth: 3,
            hoverOffset: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true,
              font: { size: 13 },
            },
          },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const value = context.raw as number;
                const pct = total > 0 ? Math.round((value / total) * 100) : 0;
                return `  ${context.label}: ${value} (${pct}%)`;
              },
            },
          },
        },
      },
    });
  }

  private buildLineChart(Chart: any, data: DashboardStats) {
    if (!this.lineChartCanvas?.nativeElement) return;

    new Chart(this.lineChartCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: data.operationsByDay.map((d) => d.date),
        datasets: [
          {
            label: 'Transactions',
            data: data.operationsByDay.map((d) => d.count),
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.08)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#6366f1',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context: any) => `  ${context.raw} transaction${context.raw !== 1 ? 's' : ''}`,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1, precision: 0 },
            grid: { color: '#f3f4f6' },
            border: { display: false },
          },
          x: {
            grid: { display: false },
            border: { display: false },
          },
        },
      },
    });
  }
}
