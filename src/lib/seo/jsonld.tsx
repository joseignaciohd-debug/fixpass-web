// JSON-LD blobs for structured data. Rendered via <script type="application/ld+json">
// inside each page. Keeping them typed so shape mistakes fail at build time.
//
// Schema reference: https://schema.org/docs/full.html
// Google rich result docs: https://developers.google.com/search/docs/appearance/structured-data

export const SITE_URL = "https://www.getfixpass.com";

export const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Fixpass",
  url: SITE_URL,
  logo: `${SITE_URL}/apple-icon`,
  sameAs: [] as string[],
  contactPoint: [
    {
      "@type": "ContactPoint",
      email: "hello@getfixpass.com",
      telephone: "+1-713-555-0188",
      contactType: "customer service",
      areaServed: "US",
      availableLanguage: ["English"],
    },
  ],
};

export const localBusinessLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${SITE_URL}#business`,
  name: "Fixpass",
  url: SITE_URL,
  image: `${SITE_URL}/api/og?title=Fixpass&eyebrow=Home%20maintenance%2C%20handled.`,
  priceRange: "$$",
  telephone: "+1-713-555-0188",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Katy",
    addressRegion: "TX",
    addressCountry: "US",
  },
  areaServed: {
    "@type": "City",
    name: "Katy, Texas",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "18:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "09:00",
      closes: "14:00",
    },
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "42",
  },
};

// One Service entry per plan. Google uses these for rich pricing
// snippets under /plans queries.
export function planServiceLd(plan: {
  name: string;
  monthlyPrice: number;
  includedVisits: string | number;
  tagline: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `Fixpass ${plan.name} Membership`,
    description: plan.tagline,
    provider: { "@id": `${SITE_URL}#business` },
    areaServed: "Katy, TX",
    offers: {
      "@type": "Offer",
      price: plan.monthlyPrice.toFixed(2),
      priceCurrency: "USD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: plan.monthlyPrice.toFixed(2),
        priceCurrency: "USD",
        unitText: "monthly subscription",
      },
      availability: "https://schema.org/InStock",
    },
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Included visits",
        value: String(plan.includedVisits),
      },
    ],
  };
}

export function faqPageLd(faqs: Array<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

// Renders a batch of JSON-LD blobs. Use inside a page component:
//   <JsonLd data={[organizationLd, localBusinessLd]} />
export function JsonLd({ data }: { data: unknown[] }) {
  return (
    <>
      {data.map((d, i) => (
        <script
          key={i}
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(d) }}
        />
      ))}
    </>
  );
}
