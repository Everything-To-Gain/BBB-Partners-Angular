export interface InternalApplicationResponse {
  applicationId: string;
  blueApplicationID?: string | null;
  hubSpotApplicationID?: string | null;
  bid?: string | null;
  companyRecordID?: string | null;
  submittedByEmail?: string | null;
  applicationStatusInternal?: string | null;
}

export interface License {
  dateIssued: string;
  agency: string;
  licensingNumber: string;
  expiration: string | null;
}

export interface ApplicationDetails {
  applicationId: string;
  applicationNumber: string;
  blueApplicationID: string;
  hubSpotApplicationID: string;
  bid: string;
  companyRecordID: string;
  trackingLink: string;
  applicationStatusInternal: string;
  applicationStatusExternal: string;
  businessName: string;
  doingBusinessAs: string;
  businessAddress: string;
  businessAptSuite: string;
  businessState: string;
  businessCity: string;
  businessZip: string;
  mailingAddress: string;
  mailingCity: string;
  mailingState: string;
  mailingZip: string;
  numberOfLocations: number | null;
  primaryBusinessPhone: string;
  primaryBusinessEmail: string;
  emailToReceiveQuoteRequestsFromCustomers: string;
  website: string;
  socialMediaLinks: string[];
  primaryFirstName: string;
  primaryLastName: string;
  primaryTitle: string;
  primaryDateOfBirth: string;
  primaryContactEmail: string;
  primaryContactNumber: string;
  preferredContactMethod: string;
  primaryContactTypes: string[];
  secondaryFirstName: string;
  secondaryLastName: string;
  secondaryTitle: string;
  secondaryEmail: string;
  secondaryContactTypes: string[];
  secondaryPhone: string;
  secondaryPreferredContactMethod: string;
  businessDescription: string;
  businessServiceArea: string;
  ein: string;
  businessType: string;
  businessEntityType: string;
  businessStartDate: string;
  licenses: License[];
  numberOfFullTimeEmployees: number;
  numberOfPartTimeEmployees: number;
  grossAnnualRevenue: number;
  avgCustomersPerYear: string;
  additionalBusinessInformation: string;
  submittedByName: string;
  submittedByTitle: string;
  submittedByEmail: string;
  partnershipSource: string;
}
