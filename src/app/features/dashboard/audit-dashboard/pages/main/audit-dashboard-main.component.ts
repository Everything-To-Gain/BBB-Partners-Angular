import { Component, inject, signal, computed, OnInit, DestroyRef } from '@angular/core';
import { AuditPaginationRequest, AuditService } from '../../services/audit.service';
import { AuditLog } from '../../models/audit.model';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ColumnDef, getCoreRowModel } from '@tanstack/table-core';
import { createAngularTable } from '@tanstack/angular-table';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmButton } from '@spartan-ng/helm/button';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { FormsModule } from '@angular/forms';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { BrnDialogImports } from '@spartan-ng/brain/dialog';
import { AuthService } from '../../../../auth/services/auth.service';
import { Router } from '@angular/router';
import { HlmInput } from '@spartan-ng/helm/input';

@Component({
  selector: 'app-audit-dashboard-main',
  templateUrl: './audit-dashboard-main.component.html',
  imports: [
    HlmTableImports,
    BrnSelectImports,
    HlmSelectImports,
    FormsModule,
    BrnDialogImports,
    HlmDialogImports,
    HlmButton,
    HlmInput,
  ],
})
export class AuditDashboardMainComponent implements OnInit {
  private auditService = inject(AuditService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  // Data signals
  auditLogs = signal<AuditLog[]>([]);
  totalLogs = signal<number>(0);
  pageNumber = signal<number>(1);
  pageSize = signal<number>(10);
  isLoading = signal<boolean>(false);

  // Filters
  selectedUser = signal<string | null>(null);
  selectedStatus = signal<string | null>(null);
  selectedEntity = signal<string | null>(null);
  selectedVersion = signal<string | null>(null);
  dateFrom = signal<string>('');
  dateTo = signal<string>('');

  // Filter options
  users = signal<string[]>([]);
  statuses = signal<string[]>([]);
  entities = signal<string[]>([]);
  versions = signal<string[]>([]);

  // Table configuration
  columns: ColumnDef<AuditLog>[] = [
    { accessorKey: 'timestamp', header: 'Timestamp' },
    { accessorKey: 'user', header: 'User' },
    { accessorKey: 'action', header: 'Action' },
    { accessorKey: 'entity', header: 'Entity' },
    { accessorKey: 'entityIdentifier', header: 'ID' },
    { accessorKey: 'status', header: 'Status' },
    { id: 'actions', header: 'Actions' },
  ];

  table = createAngularTable<AuditLog>(() => ({
    columns: this.columns,
    getCoreRowModel: getCoreRowModel(),
    data: this.auditLogs(),
    renderFallbackValue: null,
  }));

  // Computed values
  pageCount = computed(() => Math.ceil(this.totalLogs() / this.pageSize()));
  canPreviousPage = computed(() => this.pageNumber() > 1);
  canNextPage = computed(() => this.pageNumber() < this.pageCount());

  // Dialog state
  selectedLog = signal<AuditLog | null>(null);

  // Available page sizes
  availablePageSizes = [5, 10, 20, 50];

  ngOnInit(): void {
    this.loadFilterOptions();
    this.loadAuditLogs();
  }

  // Header bindings
  get userName(): string | null {
    return this.authService.userName();
  }

  get userEmail(): string | null {
    return this.authService.userEmail();
  }

  get userRole(): string | null {
    return this.authService.userRole();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  loadAuditLogs(): void {
    this.isLoading.set(true);
    const params: AuditPaginationRequest = {
      pageNumber: this.pageNumber(),
      pageSize: this.pageSize(),
      user: this.selectedUser() || undefined,
      status: this.selectedStatus() || undefined,
      entity: this.selectedEntity() || undefined,
      userVersion: this.selectedVersion() || undefined,
      dateFrom: this.dateFrom() || undefined,
      dateTo: this.dateTo() || undefined,
    };

    this.auditService
      .getAllFilteredAudits(params)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe((response) => {
        console.log(response);
        this.auditLogs.set(response.data?.items || []);
        this.totalLogs.set(response.data?.count || 0);
      });
  }

  private loadFilterOptions(): void {
    this.auditService
      .getUsers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => this.users.set(res.data || []));
    this.auditService
      .getStatuses()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => this.statuses.set(res.data || []));
    this.auditService
      .getEntities()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => this.entities.set(res.data || []));
    this.auditService
      .getUserVersions()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => this.versions.set(res.data || []));
  }

  onFilterChange(): void {
    this.pageNumber.set(1);
    this.loadAuditLogs();
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize.set(newSize);
    this.pageNumber.set(1);
    this.loadAuditLogs();
  }

  nextPage(): void {
    if (this.canNextPage()) {
      this.pageNumber.update((p) => p + 1);
      this.loadAuditLogs();
    }
  }

  previousPage(): void {
    if (this.canPreviousPage()) {
      this.pageNumber.update((p) => p - 1);
      this.loadAuditLogs();
    }
  }

  getSkeletonRows(): number[] {
    return Array(this.pageSize()).fill(0);
  }

  openDetails(log: AuditLog): void {
    this.router.navigate(['/dashboard/audit/details', log.id]);
  }

  formatTimestamp(timestamp: any): string {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleString();
  }

  // Expose Math to template
  Math = Math;

  copyText(text?: string | null): void {
    if (!text) return;
    navigator.clipboard?.writeText(text).catch(() => {});
  }
}
