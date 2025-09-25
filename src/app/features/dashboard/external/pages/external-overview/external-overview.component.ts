import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { ExternalService, PaginationParams } from '../../services/external.service';
import { ExternalApplicationResponse } from '../../models/external-application.model';
import { AuthService } from '../../../../auth/services/auth.service';
import { debounceTime, distinctUntilChanged, finalize, Subject } from 'rxjs';

@Component({
  selector: 'app-external-overview',
  imports: [HlmTableImports, HlmButton, HlmInput, BrnSelectImports, HlmSelectImports, FormsModule],
  templateUrl: './external-overview.component.html',
})
export class ExternalOverviewComponent implements OnInit {
  private externalService = inject(ExternalService);
  private authService = inject(AuthService);
  private router = inject(Router);
  externalApplications = signal<ExternalApplicationResponse[]>([]);

  // Pagination state
  currentPage = signal(1);
  pageSize = signal(10);
  totalItems = signal(0);
  searchTerm = signal('');
  availablePageSizes = [5, 10, 20, 50];
  isLoading = signal(false);

  // Search debouncing
  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.setupSearchDebouncing();
    this.loadData();
  }

  private setupSearchDebouncing(): void {
    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe((searchTerm) => {
      this.searchTerm.set(searchTerm);
      this.currentPage.set(1); // Reset to first page when searching
      this.loadData();
    });
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchSubject.next(target.value);
  }

  loadData(): void {
    this.isLoading.set(true);
    const params: PaginationParams = {
      pageNumber: this.currentPage(),
      pageSize: this.pageSize(),
      searchTerm: this.searchTerm() || undefined,
    };

    this.externalService
      .getExternalApplications(params)
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        })
      )
      .subscribe({
        next: (response) => {
          const items = response.data?.items ?? [];
          this.externalApplications.set(items);
          this.totalItems.set(response.data?.count ?? items.length);
        },
        error: (error) => {
          console.error('Error loading data:', error);
        },
      });
  }

  get paginatedData(): ExternalApplicationResponse[] {
    return this.externalApplications();
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems() / this.pageSize());
  }

  get canPreviousPage(): boolean {
    return this.currentPage() > 1;
  }

  get canNextPage(): boolean {
    return this.currentPage() < this.totalPages;
  }

  getStartIndex(): number {
    return (this.currentPage() - 1) * this.pageSize() + 1;
  }

  getEndIndex(): number {
    return Math.min(this.currentPage() * this.pageSize(), this.totalItems());
  }

  previousPage(): void {
    if (this.canPreviousPage) {
      this.currentPage.update((page) => page - 1);
      this.loadData();
    }
  }

  nextPage(): void {
    if (this.canNextPage) {
      this.currentPage.update((page) => page + 1);
      this.loadData();
    }
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize.set(newSize);
    this.currentPage.set(1);
    this.loadData();
  }

  // Auth data getters
  get userName() {
    return this.authService.userName();
  }

  get userEmail() {
    return this.authService.userEmail();
  }

  get userRole() {
    return this.authService.userRole();
  }

  get partnershipSourceDisplayName() {
    const role = this.userRole;
    if (!role) return '';

    // Convert PascalCase to readable format
    return role
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, (l: string) => l.toUpperCase());
  }

  // Page navigation helpers
  getPageNumbers(): number[] {
    const totalPages = this.totalPages;
    const current = this.currentPage();
    const pages: number[] = [];

    // Always show first page
    if (totalPages > 0) pages.push(1);

    // Show pages around current page
    const start = Math.max(2, current - 1);
    const end = Math.min(totalPages - 1, current + 1);

    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) pages.push(i);
    }

    // Always show last page if more than 1 page
    if (totalPages > 1 && !pages.includes(totalPages)) {
      pages.push(totalPages);
    }

    return pages;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage()) {
      this.currentPage.set(page);
      this.loadData();
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
