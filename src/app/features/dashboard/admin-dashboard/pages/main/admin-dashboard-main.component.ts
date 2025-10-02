import { Component, inject, signal, computed, OnInit, DestroyRef } from '@angular/core';
import { AdminDashboardService } from '../../services/admin-dashboard.service';
import { AdminDashboardUser } from '../../models/admin-dashboard.model';
import { finalize, Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ColumnDef, getCoreRowModel } from '@tanstack/table-core';
import { createAngularTable } from '@tanstack/angular-table';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import { BrnDialogImports } from '@spartan-ng/brain/dialog';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { FormsModule } from '@angular/forms';
import { HlmCheckbox } from '@spartan-ng/helm/checkbox';
import { AuthService } from '../../../../auth/services/auth.service';
import { toast } from 'ngx-sonner';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard-main',
  templateUrl: './admin-dashboard-main.component.html',
  imports: [
    HlmTableImports,
    HlmButton,
    HlmInput,
    BrnSelectImports,
    HlmSelectImports,
    FormsModule,
    BrnDialogImports,
    HlmDialogImports,
    HlmCheckbox,
  ],
})
export class AdminDashboardMainComponent implements OnInit {
  private adminService = inject(AdminDashboardService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  // expose Math to template
  Math = Math;

  users = signal<AdminDashboardUser[]>([]);
  totalUsers = signal<number>(0);
  pageNumber = signal<number>(1);
  pageSize = signal<number>(10);
  searchTerm = signal<string>('');
  isAdmin = signal<boolean | null>(null);
  isCSVSync = signal<boolean | null>(null);
  isActive = signal<boolean | null>(null);
  availablePageSizes = [5, 10, 20, 50];
  isLoading = signal<boolean>(false);

  // TanStack table columns
  columns: ColumnDef<AdminDashboardUser>[] = [
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'isAdmin', header: 'Admin' },
    { accessorKey: 'isCSVSync', header: 'CSV Sync' },
    { accessorKey: 'isActive', header: 'Status' },
    { id: 'actions', header: 'Actions' },
  ];

  // TanStack table instance
  table = createAngularTable<AdminDashboardUser>(() => ({
    columns: this.columns,
    getCoreRowModel: getCoreRowModel(),
    data: this.users(),
    renderFallbackValue: null,
  }));

  // Computed pagination helpers
  pageCount = computed(() => Math.ceil(this.totalUsers() / this.pageSize()));
  canPreviousPage = computed(() => this.pageNumber() > 1);
  canNextPage = computed(() => this.pageNumber() < this.pageCount());

  // Debounced search
  private searchSubject = new Subject<string>();

  // Add user dialog state & form
  addEmail = signal<string>('');
  addIsAdmin = signal<boolean>(false);
  addIsCsvSync = signal<boolean>(false);
  addSubmitting = signal<boolean>(false);
  addEmailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.addEmail().trim()));
  canSubmitAdd = computed(() => this.addEmailValid() && !this.addSubmitting());

  // Bulk add dialog state
  bulkText = signal<string>('');
  bulkSubmitting = signal<boolean>(false);
  canSubmitBulk = computed(() => this.bulkText().trim().length > 0 && !this.bulkSubmitting());

  // Edit dialog state
  editId = signal<string | null>(null);
  editEmail = signal<string>('');
  editIsCsvSync = signal<boolean>(false);
  editSubmitting = signal<boolean>(false);
  editEmailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.editEmail().trim()));
  canSubmitEdit = computed(() => this.editEmailValid() && !this.editSubmitting());

  // Delete dialog state
  deleteId = signal<string | null>(null);
  deleteEmail = signal<string>('');
  deleting = signal<boolean>(false);

  // Toggle active state loading set
  togglingActive = signal<Set<string>>(new Set());

  ngOnInit(): void {
    this.setupSearchDebouncing();
    this.loadUsers();
  }

  // Header bindings (match internal overview header API)
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

  loadUsers(): void {
    this.isLoading.set(true);
    this.adminService
      .getAdminDashboardUsers({
        pageNumber: this.pageNumber(),
        pageSize: this.pageSize(),
        searchTerm: this.searchTerm() || undefined,
        isAdmin: this.isAdmin() ?? undefined,
        isCSVSync: this.isCSVSync() ?? undefined,
        isActive: this.isActive() ?? undefined,
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe((res) => {
        this.users.set(res.data?.items || []);
        this.totalUsers.set(res.data?.count || 0);
      });
  }

  private setupSearchDebouncing(): void {
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((term) => {
        this.searchTerm.set(term);
        this.pageNumber.set(1);
        this.loadUsers();
      });
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchSubject.next(target.value);
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize.set(newSize);
    this.pageNumber.set(1);
    this.loadUsers();
  }

  onAdminFilterChange(value: boolean | null): void {
    this.isAdmin.set(value);
    this.pageNumber.set(1);
    this.loadUsers();
  }

  onCsvSyncFilterChange(value: boolean | null): void {
    this.isCSVSync.set(value);
    this.pageNumber.set(1);
    this.loadUsers();
  }

  onActiveFilterChange(value: boolean | null): void {
    this.isActive.set(value);
    this.pageNumber.set(1);
    this.loadUsers();
  }

  nextPage(): void {
    if (this.canNextPage()) {
      this.pageNumber.update((p) => p + 1);
      this.loadUsers();
    }
  }

  previousPage(): void {
    if (this.canPreviousPage()) {
      this.pageNumber.update((p) => p - 1);
      this.loadUsers();
    }
  }

  getSkeletonRows(): number[] {
    return Array(this.pageSize()).fill(0);
  }

  // Placeholder handlers for future modals/actions
  openAddUser(): void {
    this.addEmail.set('');
    this.addIsAdmin.set(false);
    this.addIsCsvSync.set(false);
  }

  openBulkAdd(): void {
    this.bulkText.set('');
  }

  submitAddUser(): void {
    const email = this.addEmail().trim();
    if (!this.addEmailValid()) {
      return;
    }
    this.addSubmitting.set(true);
    this.adminService
      .createAdminDashboardUser({
        email,
        isAdmin: this.addIsAdmin(),
        isCSVSync: this.addIsCsvSync(),
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.addSubmitting.set(false))
      )
      .subscribe(() => {
        toast.success('User added successfully');
        this.pageNumber.set(1);
        this.loadUsers();
      });
  }

  submitBulkAdd(): void {
    const raw = this.bulkText();
    if (!raw || !raw.trim()) return;
    this.bulkSubmitting.set(true);
    this.adminService
      .createAdminDashboardUsers({ usersCsv: raw })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.bulkSubmitting.set(false))
      )
      .subscribe({
        next: () => {
          toast.success('Users added successfully');
          this.pageNumber.set(1);
          this.loadUsers();
        },
        error: (error) => {
          const errorMessage = error.error?.detail || error.message || 'Unknown error';

          toast.error('', {
            description: errorMessage, // contains \n
          });
        },
      });
  }

  openEdit(user: AdminDashboardUser): void {
    this.editId.set(user.userId);
    this.editEmail.set(user.email);
    this.editIsCsvSync.set(!!user.isCSVSync);
  }

  submitEdit(): void {
    const id = this.editId();
    if (!id || !this.editEmailValid()) return;
    this.editSubmitting.set(true);
    this.adminService
      .updateAdminDashboardUser(id, { email: this.editEmail(), isCSVSync: this.editIsCsvSync() })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.editSubmitting.set(false))
      )
      .subscribe(() => {
        this.loadUsers();
        toast.success('User updated successfully');
      });
  }

  openDelete(user: AdminDashboardUser): void {
    this.deleteId.set(user.userId);
    this.deleteEmail.set(user.email);
  }

  submitDelete(): void {
    const id = this.deleteId();
    if (!id) return;
    this.deleting.set(true);
    this.adminService
      .deleteAdminDashboardUser(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.deleting.set(false))
      )
      .subscribe(() => {
        this.loadUsers();
        toast.success('User deleted successfully');
      });
  }

  toggleActive(user: AdminDashboardUser): void {
    const id = user.userId;
    const set = new Set(this.togglingActive());
    if (set.has(id)) return;
    set.add(id);
    this.togglingActive.set(set);
    this.adminService
      .updateAdminDashboardUser(id, { isActive: !user.isActive })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          const n = new Set(this.togglingActive());
          n.delete(id);
          this.togglingActive.set(n);
        })
      )
      .subscribe(() => {
        this.loadUsers();
        toast.success('User updated successfully');
      });
  }
}
