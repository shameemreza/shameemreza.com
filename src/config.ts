export const SITE = {
  name: 'Shameem Reza',
  url: 'https://shameemreza.com',
  tagline: 'Happiness Engineer, Plugin Builder & Open-Source Contributor',
  description:
    'Shameem Reza is a Happiness Engineer at Automattic and a member of the WordPress.org Plugins Team. Supporting WooCommerce merchants, reviewing plugin submissions on WordPress.org and WooCommerce.com, and writing about WordPress and WooCommerce.',
  locale: 'en-US',
  ogImage: '/images/og-default.png',
} as const;

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Blog', href: '/blog/' },
  { label: 'About', href: '/about/' },
  { label: 'Now', href: '/now/' },
] as const;

export const FOOTER_LINKS = [
  { label: 'Contact', href: '/contact/' },
  { label: 'Privacy', href: '/privacy/' },
  { label: 'RSS', href: '/rss.xml' },
] as const;

export const SOCIAL_LINKS = [
  { label: 'GitHub', href: 'https://github.com/shameemreza', icon: 'github' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/shameemreza/', icon: 'linkedin' },
  { label: 'X', href: 'https://x.com/shameemdev', icon: 'x' },
  { label: 'WordPress.org', href: 'https://profiles.wordpress.org/shameemreza/', icon: 'wordpress' },
] as const;

export const AUTHOR = {
  name: 'Shameem Reza',
  title: 'Happiness Engineer at Automattic',
  bio: 'Happiness Engineer at Automattic and a member of the WordPress.org Plugins Team. I support WooCommerce merchants, review plugin submissions on WordPress.org and WooCommerce.com, and write about WordPress and WooCommerce.',
  avatar: '/images/shameemreza.webp',
  links: {
    github: 'https://github.com/shameemreza',
    linkedin: 'https://www.linkedin.com/in/shameemreza/',
    x: 'https://x.com/shameemdev',
  },
} as const;

export const EXPERIENCE = [
    {
    period: '2022 - Now',
    title: 'Happiness Engineer',
    company: 'Automattic',
    url: 'https://automattic.com',
    description:
      'Supporting WooCommerce merchants with complex technical cases across Subscriptions, Bookings, WooPayments, Stripe, and more. Also a Woo Marketplace Product Ambassador, reviewing plugin submissions for code quality, security, and UX.',
    tech: ['WooCommerce', 'WordPress', 'PHP', 'JavaScript', 'REST API'],
  },
  {
    period: '2026 - Now',
    title: 'Plugin Reviewer',
    company: 'WordPress.org Plugins Team',
    url: 'https://make.wordpress.org/plugins/',
    description:
      'Reviewing plugin submissions on WordPress.org for code quality, security, and guideline compliance. Working with the Plugins Team to maintain plugin directory standards.',
    tech: ['WordPress', 'PHP', 'Security', 'Code Review'],
  },
  {
    period: '2012 - 2022',
    title: 'Freelance Developer',
    company: 'Upwork',
    url: 'https://www.upwork.com/freelancers/shameemreza',
    description:
      '60+ projects for clients across North America, Europe, the Middle East, and Asia. Custom WordPress themes, plugins, WooCommerce stores, and payment integrations. Top Rated with 100% Job Success.',
    tech: ['WordPress', 'WooCommerce', 'PHP', 'JavaScript', 'CSS'],
  },
] as const;

export const PROJECTS = [
  {
    title: 'HappyAccess',
    url: 'https://github.com/shameemreza/happyaccess',
    description:
      'Secure temporary admin access for WordPress. OTP-based, magic links, reCAPTCHA, audit logs, GDPR compliance.',
    tech: ['WordPress', 'PHP', 'Security'],
  },
  {
    title: 'SnipDrop',
    url: 'https://github.com/shameemreza/snipdrop',
    description:
      'One-click tested code snippets for WordPress and WooCommerce. Curated library with automatic error protection.',
    tech: ['WordPress', 'WooCommerce', 'PHP'],
  },
  {
    title: 'Assistify for WooCommerce',
    url: 'https://github.com/shameemreza/assistify-for-woocommerce',
    description:
      'Enhances WooCommerce with helpful tools for store owners to manage online stores efficiently.',
    tech: ['WooCommerce', 'PHP'],
  },
  {
    title: 'Kairo Theme',
    url: 'https://wordpress.org/themes/kairo/',
    description:
      'Clean WordPress theme for personal blogs and portfolios. Accessibility and performance focused.',
    tech: ['WordPress', 'PHP', 'CSS'],
  },
] as const;

export const SKILLS = [
  'WordPress',
  'WooCommerce',
  'PHP',
  'JavaScript',
  'React',
  'TypeScript',
  'Node.js',
  'MySQL',
  'REST APIs',
  'Git',
  'Astro',
  'CSS',
  'Figma',
  'Accessibility',
] as const;

export const DOMAINS = [
  { old: 'shameem.dev', new: 'shameemreza.com' },
  { old: 'shameem.blog', new: 'shameemreza.com' },
  { old: 'shameem.me', new: 'shameemreza.com' },
] as const;

export const HERO_CARDS = {
  currently: {
    label: 'Currently',
    text: 'Supporting WooCommerce at Automattic',
  },
  stack: {
    label: 'Stack',
    items: ['WordPress', 'PHP', 'JavaScript', 'React', 'WooCommerce', 'TypeScript'],
  },
  stats: [
    { value: '15+', label: 'Years coding' },
    { value: '4', label: 'OS plugins' },
    { value: '80+', label: 'Blog posts' },
  ],
} as const;

export const POSTS_PER_PAGE = 10;

export const GISCUS = {
  repo: 'shameemreza/shameemreza.com',
  repoId: 'R_kgDOSDGHDg',
  category: 'General',
  categoryId: 'DIC_kwDOSDGHDs4C65Qm',
} as const;

export const MAILCHIMP_URL = 'https://shameem.us12.list-manage.com/subscribe/post?u=3fadc08e1e8ab5d2257579566&id=67393ce137';
