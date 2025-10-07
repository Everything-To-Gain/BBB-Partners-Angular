import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { getCoreRowModel, ColumnDef } from '@tanstack/table-core';
import { createAngularTable } from '@tanstack/angular-table';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { PaginationParams } from '../../../external/services/external.service';
import { ExternalApplicationResponse } from '../../../external/models/external-application.model';
import { ApplicationStatus } from '../../../external/models/external-application.model';
import { AuthService } from '../../../../auth/services/auth.service';
import { debounceTime, distinctUntilChanged, finalize, Subject } from 'rxjs';
import { DashboardHeaderComponent } from '../../../../../shared/components/dashboard-header/dashboard-header.component';
import { InternalService } from '../../services/internal.service';
import {
  PARTNERSHIP_SOURCE,
  PartnershipSource,
  getPartnershipDisplayName,
} from '../../../../accreditation-form/models/partnership-sources.model';

@Component({
  selector: 'app-external-admins',
  imports: [
    HlmTableImports,
    HlmButton,
    HlmInput,
    BrnSelectImports,
    HlmSelectImports,
    FormsModule,
    DashboardHeaderComponent,
  ],
  templateUrl: './external-admins.component.html',
  standalone: true,
})
export class ExternalAdminsComponent implements OnInit {
  private internalService = inject(InternalService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Make Math available in template
  Math = Math;

  get isAdmin(): boolean {
    return this.authService.isAdmin() === 'true';
  }

  columns: ColumnDef<ExternalApplicationResponse>[] = [
    {
      accessorKey: 'applicationId',
      header: 'Application ID',
    },
    {
      accessorKey: 'companyName',
      header: 'Company Name',
    },
    {
      accessorKey: 'submittedByEmail',
      header: 'Submitted By',
    },
    {
      accessorKey: 'applicationStatusExternal',
      header: 'Status',
    },
  ];

  // ✅ state
  externalApplications = signal<ExternalApplicationResponse[]>([]);

  // ✅ search & pagination
  pageNumber = signal(1);
  pageSize = signal(10);
  totalItems = signal(0);
  searchTerm = signal('');
  selectedExternalStatus = signal<number | null>(null);
  selectedPartnershipSource = signal<number | null>(null);
  availablePageSizes = [5, 10, 20, 50];
  isLoading = signal(false);
  availableStatuses = signal<ApplicationStatus[]>([]);
  partnershipSources = signal<{ id: number; name: string }[]>([]);

  // ✅ TanStack table (createTable API)
  table = createAngularTable<ExternalApplicationResponse>(() => ({
    columns: this.columns,
    getCoreRowModel: getCoreRowModel(),
    data: this.externalApplications(),
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
    this.loadPartnershipSources();
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
      externalStatus: this.selectedExternalStatus() ?? undefined,
      partnershipSource: this.selectedPartnershipSource() ?? undefined,
    };

    this.internalService
      .getExternalAdmins(params)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          console.log('API Response:', res);
          const items = res.data?.items ?? [];
          const count = res.data?.count ?? 0;
          console.log('Items:', items);
          console.log('Count:', count);
          this.externalApplications.set(items);
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

  onStatusChange(statusId: number | null): void {
    this.selectedExternalStatus.set(statusId);
    this.pageNumber.set(1);
    this.loadData();
  }

  onPartnershipSourceChange(sourceId: number | null): void {
    this.selectedPartnershipSource.set(sourceId);
    this.pageNumber.set(1);
    this.loadData();
  }

  clearAllFilters(): void {
    this.searchTerm.set('');
    this.selectedExternalStatus.set(null);
    this.selectedPartnershipSource.set(null);
    this.pageNumber.set(1);
    this.loadData();
  }

  private loadStatuses(): void {
    this.internalService.getApplicationExternalStatus().subscribe({
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

  private loadPartnershipSources(): void {
    const sources = Object.entries(PARTNERSHIP_SOURCE).map(([key, value]) => ({
      id: value,
      name: getPartnershipDisplayName(key as PartnershipSource),
    }));
    this.partnershipSources.set(sources);
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
    const status = this.availableStatuses().find((s) => s.id === this.selectedExternalStatus());
    return status?.name || 'Unknown';
  }

  getSkeletonRows(): number[] {
    return Array(this.pageSize()).fill(0);
  }

  get partnershipSourceDisplayName() {
    const role = this.authService.userRole();
    if (!role) return '';
    return role
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, (l: string) => l.toUpperCase());
  }
}
