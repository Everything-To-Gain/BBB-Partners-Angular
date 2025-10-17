import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HlmButton } from '@spartan-ng/helm/button';
import { ActivatedRoute } from '@angular/router';
import { AuditService } from '../../services/audit.service';
import { AuditLog } from '../../models/audit.model';
import { AuthService } from '../../../../auth/services/auth.service';
import hljs from 'highlight.js/lib/core';
import jsonLang from 'highlight.js/lib/languages/json';
import 'highlight.js/styles/atom-one-dark.css';

hljs.registerLanguage('json', jsonLang);

@Component({
  selector: 'app-audit-details',
  templateUrl: './audit-details.component.html',
  imports: [RouterLink, HlmButton],
})
export class AuditDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private auditService = inject(AuditService);
  private authService = inject(AuthService);
  private router = inject(Router);
  auditDetails = signal<AuditLog | null>(null);
  highlightedMetadata = computed(() => {
    const meta = this.auditDetails()?.metadata;
    if (!meta) return '';
    const json = typeof meta === 'string' ? meta : JSON.stringify(meta, null, 2);
    return hljs.highlight(json, { language: 'json' }).value;
  });

  screenshotUrl = computed(() => {
    const meta = this.auditDetails()?.metadata;
    if (!meta) return null;

    // Handle both string and object metadata
    let metadataObj: any;
    if (typeof meta === 'string') {
      try {
        metadataObj = JSON.parse(meta);
      } catch {
        return null;
      }
    } else {
      metadataObj = meta;
    }

    return metadataObj?.screenshotUrl || null;
  });
  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.loadAuditDetails(id);
      }
    });
  }

  private loadAuditDetails(id: string): void {
    this.auditService.getAudit(id).subscribe({
      next: (response) => {
        this.auditDetails.set(response.data);
      },
      error: (error) => {
        console.error('Error loading audit details:', error);
      },
    });
  }

  // Header consistency helpers
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
}
