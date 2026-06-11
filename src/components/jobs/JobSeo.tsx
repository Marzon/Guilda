import { Helmet } from "react-helmet-async";
import type { Job } from "@/hooks/usePlatformStats";

interface JobSeoProps {
  job: Job;
}

export const JobSeo = ({ job }: JobSeoProps) => {
  const employmentType = job.required_archetype === "BUILDER" 
    ? "CONTRACTOR" 
    : "FULL_TIME";

  const descriptionHtml = job.role_description
    ? `<p>${job.role_description.replace(/\n/g, "</p><p>")}</p>`
    : `<p>Vaga aberta para ${job.role_name} no projeto ${job.project.title} na plataforma Guilda.</p>`;

  const datePosted = job.created_at.split("T")[0];

  // Valid 60 days from posting
  const validDate = new Date(job.created_at);
  validDate.setDate(validDate.getDate() + 60);
  const validThrough = validDate.toISOString().split("T")[0];

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: job.role_name,
    description: descriptionHtml,
    datePosted,
    validThrough,
    hiringOrganization: {
      "@type": "Organization",
      name: job.project.title,
      sameAs: "https://www.guilda.app.br",
      logo: "https://www.guilda.app.br/og-image.png",
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressCountry: "BR",
      },
    },
    jobLocationType: "TELECOMMUTE",
    applicantLocationRequirements: {
      "@type": "Country",
      name: "Brazil",
    },
    employmentType,
    ...(job.required_skills && job.required_skills.length > 0 && {
      skills: job.required_skills.join(", "),
    }),
  };

  const pageTitle = `${job.role_name} - ${job.project.title} | Guilda`;
  const pageDescription = job.role_description
    ? job.role_description.substring(0, 155) + "..."
    : `Vaga para ${job.role_name} no projeto ${job.project.title}. Candidate-se na Guilda.`;

  const canonicalUrl = `https://www.guilda.app.br/vagas/${job.id}`;

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={job.project.cover_image_url || "https://www.guilda.app.br/og-image.png"} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />

      {/* JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>
    </Helmet>
  );
};
