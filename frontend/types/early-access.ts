export interface EarlyAccessFormData {
  // Section 1: Sobre ti
  name: string;
  email: string;
  country: string;
  age_range: string;
  professional_profiles: string[];
  professional_profiles_other: string;
  current_situation: string;
  current_situation_other: string;
  programming_experience: string;

  // Section 2: Tu experiencia aprendiendo
  platforms_used: string[];
  platforms_used_other: string;
  biggest_frustrations: string[];
  biggest_frustrations_other: string;
  abandoned_courses: string;

  // Section 3: Qué quieres construir
  project_types: string[];
  project_types_other: string;
  deployment_importance: string;

  // Section 4: Qué esperas de Umbral
  feature_ranking: string[];
  weekly_time: string;
  suggestions: string;

  // Section 5: Inversión y confirmaciones
  monthly_payment: string;
  confirmations: {
    terms: boolean;
    privacy: boolean;
    beta: boolean;
    communications: boolean;
  };
}

export const INITIAL_FORM_DATA: EarlyAccessFormData = {
  name: "",
  email: "",
  country: "",
  age_range: "",
  professional_profiles: [],
  professional_profiles_other: "",
  current_situation: "",
  current_situation_other: "",
  programming_experience: "",
  platforms_used: [],
  platforms_used_other: "",
  biggest_frustrations: [],
  biggest_frustrations_other: "",
  abandoned_courses: "",
  project_types: [],
  project_types_other: "",
  deployment_importance: "",
  feature_ranking: [],
  weekly_time: "",
  suggestions: "",
  monthly_payment: "",
  confirmations: {
    terms: false,
    privacy: false,
    beta: false,
    communications: false,
  },
};
