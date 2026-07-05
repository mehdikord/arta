/** Service category classification */
export type ServiceCategory =
  | "individual"
  | "couple"
  | "organizational"
  | "educational";

/** Academy counseling or training service */
export interface Service {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: ServiceCategory;
  icon: string;
  image?: string;
}
