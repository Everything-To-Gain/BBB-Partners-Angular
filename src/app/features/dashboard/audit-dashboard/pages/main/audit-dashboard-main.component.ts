import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  DestroyRef,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { AuditPaginationRequest, AuditService } from '../../services/audit.service';
import { AuditLog } from '../../models/audit.model';
import { finalize, forkJoin } from 'rxjs';
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
import { Router, ActivatedRoute } from '@angular/router';
import { HlmInput } from '@spartan-ng/helm/input';
import { DashboardHeaderComponent } from '../../../../../shared/components/dashboard-header/dashboard-header.component';
import { HlmCommandImports } from '@spartan-ng/helm/command';
import { BrnCommandImports } from '@spartan-ng/brain/command';
import { BrnPopover, BrnPopoverContent, BrnPopoverTrigger } from '@spartan-ng/brain/popover';
import { HlmPopoverContent } from '@spartan-ng/helm/popover';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronsUpDown, lucideSearch, lucideCheck } from '@ng-icons/lucide';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

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
    DashboardHeaderComponent,
    HlmCommandImports,
    BrnCommandImports,
    BrnPopover,
    BrnPopoverTrigger,
    HlmPopoverContent,
    BrnPopoverContent,
    NgIcon,
    HlmIcon,
  ],
  providers: [provideIcons({ lucideChevronsUpDown, lucideSearch, lucideCheck })],
})
export class AuditDashboardMainComponent implements OnInit {
  private auditService = inject(AuditService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

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
  selectedAction = signal<string | null>(null);
  selectedVersion = signal<string | null>(null);
  dateFrom = signal<string>('');
  dateTo = signal<string>('');
  searchTerm = signal<string>('');

  // Filter options
  users = signal<string[]>([]);
  statuses = signal<string[]>([]);
  entities = signal<string[]>([]);
  actions = signal<string[]>([]);
  versions = signal<string[]>([]);

  // User filter search functionality
  filteredUsers = signal<string[]>([]);
  userSearchTerm = signal<string>('');
  userPopoverState = signal<'closed' | 'open'>('closed');
  private userSearchSubject = new Subject<string>();

  @ViewChild('userFilterTrigger', { static: false }) userFilterTrigger!: ElementRef;

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

  // Header helpers
  get gmtOffsetLabel(): string {
    const totalMinutes = -new Date().getTimezoneOffset(); // minutes ahead of UTC
    const sign = totalMinutes >= 0 ? '+' : '-';
    const absMin = Math.abs(totalMinutes);
    const hours = Math.floor(absMin / 60);
    const minutes = absMin % 60;
    return minutes
      ? `GMT${sign}${hours}:${minutes.toString().padStart(2, '0')}`
      : `GMT${sign}${hours}`;
  }

  get timestampHeader(): string {
    return `Timestamp (${this.gmtOffsetLabel})`;
  }

  constructor() {
    // Set up debounced search for users
    this.userSearchSubject
      .pipe(
        debounceTime(300), // Wait 300ms after user stops typing
        distinctUntilChanged(), // Only emit if value actually changed
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((searchTerm) => {
        this.userSearchTerm.set(searchTerm);
        this.filterUsers(searchTerm);
      });
  }

  ngOnInit(): void {
    this.loadFilterOptions();
    this.loadAuditLogs();
  }

  loadAuditLogs(): void {
    this.isLoading.set(true);
    const params: AuditPaginationRequest = {
      pageNumber: this.pageNumber(),
      pageSize: this.pageSize(),
      user: this.selectedUser() || undefined,
      status: this.selectedStatus() || undefined,
      entity: this.selectedEntity() || undefined,
      action: this.selectedAction() || undefined,
      userVersion: this.selectedVersion() || undefined,
      dateFrom: this.dateFrom() || undefined,
      dateTo: this.dateTo() || undefined,
      searchTerm: this.searchTerm() || undefined,
    };

    this.auditService
      .getAllFilteredAudits(params)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe((response) => {
        this.auditLogs.set(response.data?.items || []);
        this.totalLogs.set(response.data?.count || 0);
      });
  }

  private loadFilterOptions(): void {
    // Load all filter options in parallel and wait for all to complete
    const users$ = this.auditService.getUsers().pipe(takeUntilDestroyed(this.destroyRef));
    const statuses$ = this.auditService.getStatuses().pipe(takeUntilDestroyed(this.destroyRef));
    const entities$ = this.auditService.getEntities().pipe(takeUntilDestroyed(this.destroyRef));
    const actions$ = this.auditService.getActions().pipe(takeUntilDestroyed(this.destroyRef));
    const versions$ = this.auditService.getUserVersions().pipe(takeUntilDestroyed(this.destroyRef));

    // Use forkJoin to wait for all requests to complete
    forkJoin({
      users: users$,
      statuses: statuses$,
      entities: entities$,
      actions: actions$,
      versions: versions$,
    }).subscribe((results) => {
      // Set all filter options
      this.users.set(results.users.data || []);
      this.statuses.set(results.statuses.data || []);
      this.entities.set(results.entities.data || []);
      this.actions.set(results.actions.data || []);
      this.versions.set(results.versions.data || []);

      // Initialize filtered users
      this.filteredUsers.set(results.users.data || []);

      // Now that all options are loaded, apply query parameters
      this.initializeFiltersFromQueryParams();
    });
  }

  onFilterChange(): void {
    this.pageNumber.set(1);
    this.updateQueryParams();
    // loadAuditLogs() will be called by initializeFiltersFromQueryParams() when URL updates
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
    this.pageNumber.set(1);
    this.updateQueryParams();
    // loadAuditLogs() will be called by initializeFiltersFromQueryParams() when URL updates
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.pageNumber.set(1);
    this.updateQueryParams();
    // loadAuditLogs() will be called by initializeFiltersFromQueryParams() when URL updates
  }

  clearAllFilters(): void {
    this.selectedUser.set(null);
    this.selectedStatus.set(null);
    this.selectedEntity.set(null);
    this.selectedAction.set(null);
    this.selectedVersion.set(null);
    this.dateFrom.set('');
    this.dateTo.set('');
    this.searchTerm.set('');
    this.pageNumber.set(1);
    this.pageSize.set(10);
    this.updateQueryParams();
    // loadAuditLogs() will be called by initializeFiltersFromQueryParams() when URL updates
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize.set(newSize);
    this.pageNumber.set(1);
    this.updateQueryParams();
    // loadAuditLogs() will be called by initializeFiltersFromQueryParams() when URL updates
  }

  nextPage(): void {
    if (this.canNextPage()) {
      this.pageNumber.update((p) => p + 1);
      this.updateQueryParams();
      // loadAuditLogs() will be called by initializeFiltersFromQueryParams() when URL updates
    }
  }

  previousPage(): void {
    if (this.canPreviousPage()) {
      this.pageNumber.update((p) => p - 1);
      this.updateQueryParams();
      // loadAuditLogs() will be called by initializeFiltersFromQueryParams() when URL updates
    }
  }

  getSkeletonRows(): number[] {
    return Array(this.pageSize()).fill(0);
  }

  openDetails(log: AuditLog): void {
    // Open in new tab
    window.open(`/dashboard/audit/details/${log.id}`, '_blank', 'noopener,noreferrer');
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

  // User filter methods
  onUserPopoverStateChange(state: 'open' | 'closed'): void {
    this.userPopoverState.set(state);
    if (state === 'open') {
      // Initialize filtered users when opening
      this.filteredUsers.set(this.users());
    }
  }

  onUserSearch(value: string): void {
    this.userSearchSubject.next(value);
  }

  onUserSelected(user: string | null): void {
    this.selectedUser.set(user);
    this.userPopoverState.set('closed');
    this.onFilterChange();
  }

  private filterUsers(searchTerm: string): void {
    if (!searchTerm.trim()) {
      this.filteredUsers.set(this.users());
    } else {
      const filtered = this.users().filter((user) =>
        user.toLowerCase().includes(searchTerm.toLowerCase())
      );
      this.filteredUsers.set(filtered);
    }
  }

  getSelectedUserName(): string {
    return this.selectedUser() || 'All users';
  }

  getTriggerWidth(): number {
    return this.userFilterTrigger?.nativeElement?.offsetWidth || 300;
  }

  // Query parameter handling methods
  private initializeFiltersFromQueryParams(): void {
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      // Set filters from query parameters
      this.selectedUser.set(params['user'] || null);
      this.selectedStatus.set(params['status'] || null);
      this.selectedEntity.set(params['entity'] || null);
      this.selectedAction.set(params['action'] || null);
      this.selectedVersion.set(params['version'] || null);
      this.dateFrom.set(params['dateFrom'] || '');
      this.dateTo.set(params['dateTo'] || '');
      this.searchTerm.set(params['search'] || '');
      this.pageNumber.set(parseInt(params['page']) || 1);
      this.pageSize.set(parseInt(params['pageSize']) || 10);

      // Load audit logs with the applied filters
      this.loadAuditLogs();
    });
  }

  private updateQueryParams(): void {
    const queryParams: any = {};

    // Only add non-default values to query params
    if (this.selectedUser()) queryParams['user'] = this.selectedUser();
    if (this.selectedStatus()) queryParams['status'] = this.selectedStatus();
    if (this.selectedEntity()) queryParams['entity'] = this.selectedEntity();
    if (this.selectedAction()) queryParams['action'] = this.selectedAction();
    if (this.selectedVersion()) queryParams['version'] = this.selectedVersion();
    if (this.dateFrom()) queryParams['dateFrom'] = this.dateFrom();
    if (this.dateTo()) queryParams['dateTo'] = this.dateTo();
    if (this.searchTerm()) queryParams['search'] = this.searchTerm();
    if (this.pageNumber() > 1) queryParams['page'] = this.pageNumber();
    if (this.pageSize() !== 10) queryParams['pageSize'] = this.pageSize();

    // Update URL without triggering navigation
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'replace',
      replaceUrl: true,
    });
  }
}
