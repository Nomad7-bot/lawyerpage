/**
 * JSON-LD 구조화 데이터 타입 정의 (PRD §7 AEO)
 * schema-dts 같은 외부 의존성 없이 자체 최소 타입만 정의.
 */

type SchemaContext = "https://schema.org";

interface BaseSchema {
  "@context": SchemaContext;
  "@type": string;
}

export interface PostalAddress {
  "@type": "PostalAddress";
  streetAddress: string;
  addressLocality?: string;
  addressRegion?: string;
  postalCode?: string;
  addressCountry?: string;
}

export interface OpeningHoursSpecification {
  "@type": "OpeningHoursSpecification";
  dayOfWeek: string | string[];
  opens: string;
  closes: string;
}

export interface LegalServiceSchema extends BaseSchema {
  "@type": "LegalService";
  name: string;
  description?: string;
  url: string;
  telephone?: string;
  email?: string;
  address: PostalAddress;
  openingHoursSpecification?: OpeningHoursSpecification[];
  priceRange?: string;
  image?: string;
  areaServed?: { "@type": "City"; name: string };
  sameAs?: string[];
}

export interface PersonSchema extends BaseSchema {
  "@type": "Person";
  name: string;
  jobTitle?: string;
  description?: string;
  worksFor?: { "@type": "LegalService"; name: string };
  knowsAbout?: string[];
  image?: string;
  url: string;
}

export interface FAQQuestion {
  "@type": "Question";
  name: string;
  acceptedAnswer: {
    "@type": "Answer";
    text: string;
  };
}

export interface FAQPageSchema extends BaseSchema {
  "@type": "FAQPage";
  mainEntity: FAQQuestion[];
}

export interface ArticleSchema extends BaseSchema {
  "@type": "Article";
  headline: string;
  description?: string;
  datePublished: string;
  dateModified?: string;
  author: {
    "@type": "Person";
    name: string;
    url?: string;
  };
  publisher: {
    "@type": "Organization";
    name: string;
    logo?: { "@type": "ImageObject"; url: string };
  };
  image?: string | string[];
  mainEntityOfPage?: string;
}

export interface BreadcrumbListItem {
  "@type": "ListItem";
  position: number;
  name: string;
  item?: string;
}

export interface BreadcrumbListSchema extends BaseSchema {
  "@type": "BreadcrumbList";
  itemListElement: BreadcrumbListItem[];
}

export interface ServiceSchema extends BaseSchema {
  "@type": "Service";
  name: string;
  description?: string;
  provider: {
    "@type": "LegalService";
    name: string;
    url?: string;
  };
  areaServed?: { "@type": "City"; name: string };
  serviceType?: string;
}

export type AnySchema =
  | LegalServiceSchema
  | PersonSchema
  | FAQPageSchema
  | ArticleSchema
  | BreadcrumbListSchema
  | ServiceSchema;
