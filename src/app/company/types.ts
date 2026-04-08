export type PortalCompany = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  linkedin_url: string | null;
  website: string | null;
  description: string | null;
  access_code: string;
};

export type PortalRole = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  location: string | null;
  status: string;
  referral_bonus?: string | null;
};

export type CompanyReferralRow = {
  id: string;
  role_id: string;
  created_at: string;
  candidate_linkedin_url: string;
  fit_description: string;
  candidate_name: string | null;
  candidate_email: string | null;
  relationship_type: string | null;
  relationship_other: string | null;
  connector_name: string | null;
  connector_linkedin_url: string | null;
  referral_stage: string;
  company_reason_preset: string | null;
  company_reason_note: string | null;
  company_responded_at: string | null;
};
