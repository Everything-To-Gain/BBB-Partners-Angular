import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-track-application',
  templateUrl: './track-application.component.html',
})
export class TrackApplicationComponent {
  private route = inject(ActivatedRoute);
  applicationId = this.route.snapshot.paramMap.get('id');
}
