export interface Activation {
  activationId: string;
  year: string;
  month: string;
  requestTime: string;
  interventionTime: string;
  districtLabel: string;
  hospitalLabel: string;
  emergencyType: string;
  districtWikidataLink: string | undefined;
  hospitalWikidataLink: string | undefined;
}

export interface Binding {
  label: { value: string };
  year: { value: string };
  month: { value: string };
  requestTime: { value: string };
  interventionTime: { value: string };
  districtLabel: { value: string };
  hospitalLabel: { value: string };
  emergencyType: { value: string };
  districtWikidataLink: { value: string };
  hospitalWikidataLink: { value: string };
}

export interface HospitalBinding {
  hospitalLabel: { value: string };
  activationCount: { value: string };
}
export interface DistrictBinding {
  districtLabel: { value: string };
  activationCount: { value: string };
}