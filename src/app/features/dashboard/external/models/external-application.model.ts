export interface ExternalApplicationResponse {
  applicationId: string;
  companyName?: string | null;
  submittedByEmail?: string | null;
  applicationStatusExternal?: string | null;
}

export interface ApplicationStatus {
  id: number;
  name: string;
}
