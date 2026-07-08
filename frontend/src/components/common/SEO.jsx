import { Helmet } from "react-helmet-async";

const SITE_NAME = "AstonnyFlyy";
const DEFAULT_DESCRIPTION = "Premium fashion e-commerce for modern luxury, urban style, and trendsetting collections.";
const DEFAULT_IMAGE = "https://astonnyflyy.com/logo.jpeg";
const SITE_URL = "https://astonnyflyy.com";

export default function SEO({
  title,
  description,
  image,
  url,
  type = "website",
  jsonLd,
}) {
  const pageTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - Modern Street Luxury`;
  const pageDescription = description || DEFAULT_DESCRIPTION;
  const pageImage = image || DEFAULT_IMAGE;
  const pageUrl = url || SITE_URL;

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <link rel="canonical" href={pageUrl} />

      <meta property="og:type" content={type} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:site_name" content={SITE_NAME} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={pageImage} />

      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}
