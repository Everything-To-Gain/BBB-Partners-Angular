import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { getCoreRowModel, ColumnDef } from '@tanstack/table-core';
import { createAngularTable } from '@tanstack/angular-table';
import { InternalService, PaginationParams } from '../../services/internal.service';
import { InternalApplicationResponse } from '../../models/internal-application.model';
import { ApplicationStatus } from '../../../external/models/external-application.model';
import { AuthService } from '../../../../auth/services/auth.service';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, finalize, Subject } from 'rxjs';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-internal-overview',
  templateUrl: './internal-overview.component.html',
  imports: [HlmTableImports, HlmButton, HlmInput, BrnSelectImports, HlmSelectImports, FormsModule],
})
export class InternalOverviewComponent implements OnInit {
  private internalService = inject(InternalService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Make Math available in template
  Math = Math;

  columns: ColumnDef<InternalApplicationResponse>[] = [
    {
      accessorKey: 'applicationId',
      header: 'Application ID',
    },
    {
      accessorKey: 'blueApplicationID',
      header: 'Blue App ID',
    },
    {
      accessorKey: 'hubSpotApplicationID',
      header: 'HubSpot App ID',
    },
    {
      accessorKey: 'bid',
      header: 'BID',
    },
    {
      accessorKey: 'companyRecordID',
      header: 'Company Record ID',
    },
    {
      accessorKey: 'submittedByEmail',
      header: 'Submitted By',
    },
    {
      accessorKey: 'applicationStatusInternal',
      header: 'Status',
    },
  ];

  // ✅ state
  internalApplications = signal<InternalApplicationResponse[]>([]);

  // ✅ search & pagination
  pageNumber = signal(1);
  pageSize = signal(10);
  totalItems = signal(0);
  searchTerm = signal('');
  selectedStatus = signal<number | null>(null);
  availablePageSizes = [5, 10, 20, 50];
  isLoading = signal(false);
  availableStatuses = signal<ApplicationStatus[]>([]);

  // ✅ TanStack table (createTable API)
  table = createAngularTable<InternalApplicationResponse>(() => ({
    columns: this.columns,
    getCoreRowModel: getCoreRowModel(),
    data: this.internalApplications(),
    renderFallbackValue: null,
  }));

  // --- Computed values

  pageCount = computed(() => Math.ceil(this.totalItems() / this.pageSize()));

  canPreviousPage = computed(() => this.pageNumber() > 1);
  canNextPage = computed(() => this.pageNumber() < this.pageCount());

  // --- Search debouncing
  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.setupSearchDebouncing();
    this.loadStatuses();
    this.loadData();
  }

  private setupSearchDebouncing(): void {
    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe((searchTerm) => {
      this.searchTerm.set(searchTerm);
      this.pageNumber.set(1);
      this.loadData();
    });
  }

  loadData(): void {
    this.isLoading.set(true);
    const params: PaginationParams = {
      pageNumber: this.pageNumber(),
      pageSize: this.pageSize(),
      searchTerm: this.searchTerm() || undefined,
      status: this.selectedStatus() || undefined,
    };

    this.internalService
      .getInternalApplications(params)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          console.log('API Response:', res);
          const items = res.data?.items ?? [];
          const count = res.data?.count ?? 0;
          console.log('Items:', items);
          console.log('Count:', count);
          this.internalApplications.set(items);
          this.totalItems.set(count);
          // Force table update
          this.table.setOptions((prev) => ({ ...prev, data: items }));
          console.log('Signal updated, current value:', this.internalApplications());
        },
        error: (err) => {
          console.error('Error loading data:', err);
        },
      });
  }

  // --- pagination actions
  nextPage(): void {
    if (this.canNextPage()) {
      this.pageNumber.update((prev) => prev + 1);
      this.loadData();
    }
  }
  previousPage(): void {
    if (this.canPreviousPage()) {
      this.pageNumber.update((prev) => prev - 1);
      this.loadData();
    }
  }

  // --- search
  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchSubject.next(target.value);
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize.set(newSize);
    this.pageNumber.set(1);
    this.loadData();
  }

  onStatusChange(statusId: number | null): void {
    this.selectedStatus.set(statusId);
    this.pageNumber.set(1);
    this.loadData();
  }

  private loadStatuses(): void {
    this.internalService.getApplicationInternalStatus().subscribe({
      next: (res) => {
        const formattedStatuses = (res.data || []).map((status) => ({
          ...status,
          id: status.id + 1, // Add 1 to make UI 1-based
          name: this.formatStatusName(status.name),
        }));
        this.availableStatuses.set(formattedStatuses);
      },
      error: (err) => {
        console.error('Error loading statuses:', err);
      },
    });
  }

  private formatStatusName(name: string): string {
    return name
      .replace(/_/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  formatStatusForDisplay(statusValue: string | null): string {
    if (!statusValue) return 'N/A';
    return this.formatStatusName(statusValue);
  }

  getFormattedStatus(cellValue: unknown): string {
    return this.formatStatusForDisplay(cellValue as string | null);
  }

  getSelectedStatusName(): string {
    const status = this.availableStatuses().find((s) => s.id === this.selectedStatus());
    return status?.name || 'Unknown';
  }

  getSkeletonRows(): number[] {
    return Array(this.pageSize()).fill(0);
  }

  // --- auth getters
  get userName() {
    return this.authService.userName();
  }
  get userEmail() {
    return this.authService.userEmail();
  }
  get userRole() {
    return this.authService.userRole();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
