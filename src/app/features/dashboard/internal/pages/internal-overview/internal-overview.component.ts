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
import { toast } from 'ngx-sonner';
import { DashboardHeaderComponent } from '../../../../../shared/components/dashboard-header/dashboard-header.component';

@Component({
  selector: 'app-internal-overview',
  templateUrl: './internal-overview.component.html',
  imports: [
    HlmTableImports,
    HlmButton,
    HlmInput,
    BrnSelectImports,
    HlmSelectImports,
    FormsModule,
    DashboardHeaderComponent,
  ],
  // Add header component import
  standalone: true,
})
export class InternalOverviewComponent implements OnInit {
  private internalService = inject(InternalService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Make Math available in template
  Math = Math;

  // Base columns without special actions
  private baseColumns: ColumnDef<InternalApplicationResponse>[] = [
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
      header: 'Internal Status',
    },
    {
      accessorKey: 'applicationStatusExternal',
      header: 'External Status',
    },
  ];

  // Special actions column
  private specialActionsColumn: ColumnDef<InternalApplicationResponse> = {
    id: 'specialActions',
    header: 'Actions',
  };

  // Dynamic columns based on special access
  get columns(): ColumnDef<InternalApplicationResponse>[] {
    if (this.specialAccess) {
      return [...this.baseColumns, this.specialActionsColumn];
    }
    return this.baseColumns;
  }

  // ✅ state
  internalApplications = signal<InternalApplicationResponse[]>([]);

  // ✅ search & pagination
  pageNumber = signal(1);
  pageSize = signal(10);
  totalItems = signal(0);
  searchTerm = signal('');
  selectedInternalStatus = signal<number | null>(null);
  selectedExternalStatus = signal<number | null>(null);
  availablePageSizes = [5, 10, 20, 50];
  isLoading = signal(false);
  availableInternalStatuses = signal<ApplicationStatus[]>([]);
  availableExternalStatuses = signal<ApplicationStatus[]>([]);
  sendingFormData = signal<Set<string>>(new Set());

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
      internalStatus: this.selectedInternalStatus() || undefined,
      externalStatus: this.selectedExternalStatus() || undefined,
    };

    this.internalService
      .getInternalApplications(params)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          const items = res.data?.items ?? [];
          const count = res.data?.count ?? 0;
          this.internalApplications.set(items);
          this.totalItems.set(count);
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

  onInternalStatusChange(statusId: number | null): void {
    this.selectedInternalStatus.set(statusId);
    this.pageNumber.set(1);
    this.loadData();
  }

  onExternalStatusChange(statusId: number | null): void {
    this.selectedExternalStatus.set(statusId);
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
        this.availableInternalStatuses.set(formattedStatuses);
      },
      error: (err) => {
        console.error('Error loading statuses:', err);
      },
    });
    this.internalService.getApplicationExternalStatus().subscribe({
      next: (res) => {
        const formattedStatuses = (res.data || []).map((status) => ({
          ...status,
          id: status.id + 1, // Add 1 to make UI 1-based
          name: this.formatStatusName(status.name),
        }));
        this.availableExternalStatuses.set(formattedStatuses);
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

  getSelectedInternalStatusName(): string {
    const status = this.availableInternalStatuses().find(
      (s) => s.id === this.selectedInternalStatus()
    );
    return status?.name || 'Unknown';
  }

  getSelectedExternalStatusName(): string {
    const status = this.availableExternalStatuses().find(
      (s) => s.id === this.selectedExternalStatus()
    );
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
  get specialAccess() {
    return this.authService.specialAccess();
  }
  get isAdmin(): boolean {
    const v = this.authService.isAdmin();
    return v === 'true';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  navigateToDetails(applicationId: unknown): void {
    const id = applicationId as string;
    if (id) {
      this.router.navigate(['/dashboard/internal/application-details', id]);
    }
  }

  // Special access action - send form data
  onSpecialAction(applicationId: unknown): void {
    const id = applicationId as string;
    if (!id) {
      console.error('No application ID provided');
      return;
    }

    // Add to loading set
    this.sendingFormData.update((set) => new Set(set).add(id));

    this.internalService
      .sendFormData(id)
      .pipe(
        finalize(() => {
          this.sendingFormData.update((set) => {
            const newSet = new Set(set);
            newSet.delete(id);
            return newSet;
          });
        })
      )
      .subscribe({
        next: (response) => {
          console.log('Form data sent successfully:', response);
          toast.success('Form data sent successfully');
        },
        error: (error) => {
          console.error('Error sending form data:', error);
          toast.error('Error sending form data');
        },
      });
  }

  // Helper method to check if form data is being sent for a specific application
  isSendingFormData(applicationId: string): boolean {
    return this.sendingFormData().has(applicationId);
  }
}
