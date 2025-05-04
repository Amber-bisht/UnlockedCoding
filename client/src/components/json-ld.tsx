import React from 'react';

interface JsonLdProps {
  type: 'Organization' | 'WebSite' | 'Course' | 'Article';
  data: Record<string, any>;
}

export function JsonLd({ type, data }: JsonLdProps) {
  const getSchemaData = () => {
    const baseSchema = {
      '@context': 'https://schema.org',
      '@type': type,
      ...data,
    };
    
    return JSON.stringify(baseSchema);
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: getSchemaData() }}
    />
  );
}

export function WebsiteJsonLd() {
  const websiteData = {
    name: 'Unlocked Coding',
    url: 'https://unlockedcoding.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://unlockedcoding.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  };

  return <JsonLd type="WebSite" data={websiteData} />;
}

export function OrganizationJsonLd() {
  const orgData = {
    name: 'Unlocked Coding',
    url: 'https://unlockedcoding.com',
    logo: 'https://unlockedcoding.com/logo.png',
    sameAs: [
      'https://twitter.com/unlockedcoding',
      'https://facebook.com/unlockedcoding',
      'https://linkedin.com/company/unlockedcoding'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-234-567-8901',
      contactType: 'customer service',
      email: 'support@unlockedcoding.com'
    }
  };

  return <JsonLd type="Organization" data={orgData} />;
}

interface CourseJsonLdProps {
  course: {
    title: string;
    description: string;
    instructor?: string;
    imageUrl?: string;
    price?: number;
    duration?: string;
    level?: string;
    slug?: string;
  };
}

export function CourseJsonLd({ course }: CourseJsonLdProps) {
  const courseData = {
    name: course.title,
    description: course.description,
    provider: {
      '@type': 'Organization',
      name: 'Unlocked Coding'
    },
    ...(course.instructor && { 
      author: {
        '@type': 'Person',
        name: course.instructor
      }
    }),
    ...(course.imageUrl && { image: course.imageUrl }),
    ...(course.price !== undefined && { 
      offers: {
        '@type': 'Offer',
        price: course.price,
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock'
      }
    }),
    ...(course.level && { educationalLevel: course.level }),
    ...(course.duration && { timeRequired: course.duration }),
    ...(course.slug && { url: `https://unlockedcoding.com/course/${course.slug}` })
  };

  return <JsonLd type="Course" data={courseData} />;
}

interface ArticleJsonLdProps {
  article: {
    title: string;
    description: string;
    published: string;
    modified?: string;
    author: string;
    imageUrl?: string;
    slug: string;
  };
}

export function ArticleJsonLd({ article }: ArticleJsonLdProps) {
  const articleData = {
    headline: article.title,
    description: article.description,
    author: {
      '@type': 'Person',
      name: article.author
    },
    publisher: {
      '@type': 'Organization',
      name: 'Unlocked Coding',
      logo: {
        '@type': 'ImageObject',
        url: 'https://unlockedcoding.com/logo.png'
      }
    },
    datePublished: article.published,
    dateModified: article.modified || article.published,
    ...(article.imageUrl && { image: article.imageUrl }),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://unlockedcoding.com/blog/${article.slug}`
    }
  };

  return <JsonLd type="Article" data={articleData} />;
}