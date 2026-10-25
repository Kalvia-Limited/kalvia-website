export type Interest = "Academy" | "Sponsoring" | "Marketplace" | "Partnership";
export type Offering = "academy" | "market";
export interface Audience { tab: string; who: string; title: string; text: string; points: string[]; tags: string[] }
export interface Persona { kicker: string; title: string; text: string; cta: string; interest: Interest }
export interface Value { title: string; description: string }
export interface SourceSection { id: string; label: string; text: string }
export const audiences = {
    academy: [
      { tab: 'Students', who: 'For students', title: 'Relevance and quality.', text: 'Career-relevant, practical training that helps you become more market-ready, capable and competitive.', points: ['Hands-on workshop training in real trades', 'Customer and business skills, not just technique', 'Credentials recognised wherever opportunity exists'], tags: ['Mastery', 'Quality', 'Growth'] },
      { tab: 'Parents & sponsors', who: 'For parents and sponsors', title: 'Assurance for a stronger future.', text: 'A credible pathway for empowering someone you support with relevant skills that lead to independence, security and opportunity.', points: ['A structured, accountable programme', 'Skills that lead directly to earning', 'Confidence that your support builds self-sufficiency'], tags: ['Assurance', 'Confidence'] },
      { tab: 'Enterprises', who: 'For organisations', title: 'Impact you can measure.', text: 'An impact-led training platform that helps organisations create meaningful social and future impact through skills development and job creation.', points: ['Sponsor cohorts aligned to your workforce or CSR goals', 'Outcomes tied to skills and job creation', 'A partner built for long-term impact'], tags: ['Impact', 'Growth'] }
    ],
    market: [
      { tab: 'Technicians', who: 'For technicians', title: 'Access and structure.', text: 'A structured pool of available jobs and client opportunities, supported by systems for placement, management and tracking.', points: ['Reliable access to jobs and clients', 'Invoicing and job tracking handled for you', 'The SOAT seal to show customers they can trust you'], tags: ['Access', 'Structure'] },
      { tab: 'Customers', who: 'For homes and businesses', title: 'Reliable, skilled professionals.', text: 'Access to technicians positioned around professional mastery, quality and reliability.', points: ['Every technician certified and re-certified yearly', 'Professional conduct, not just a quick fix', 'Clear quality standards behind every job'], tags: ['Mastery', 'Ethics'] },
      { tab: 'Enterprises', who: 'For organisations', title: 'Professionalism in service delivery.', text: 'Kalvia connects organisations with skilled professionals and strengthens professionalism in how services are delivered.', points: ['Vetted technicians for ongoing or project work', 'Structured quality assurance and standards', 'One partner for placement and management'], tags: ['Quality', 'Assurance'] }
    ]
  } satisfies Record<Offering, Audience[]>;
export const personas = {
    student: { kicker: 'Your door: Kalvia Academy', title: 'Build a career, not just a skill.', text: 'Practical training in the trades plus the professional skills clients expect. Graduate career-ready and SOAT-certified.', cta: 'Apply to the Academy', interest: 'Academy' },
    sponsor: { kicker: 'Your door: Kalvia Academy', title: 'Sponsor a future you can see.', text: 'Give someone a credible pathway to independence and security, with a structured programme you can trust.', cta: 'Sponsor a learner', interest: 'Sponsoring' },
    tech: { kicker: 'Your door: Kalvia Marketplace', title: 'Steady work, handled professionally.', text: 'Get access to jobs and clients, with placement, invoicing and tracking built in, and a seal customers recognise.', cta: 'Join the Marketplace', interest: 'Marketplace' },
    org: { kicker: 'Your door: Academy + Marketplace', title: 'Hire certified talent, or fund real impact.', text: 'Hire vetted technicians through the Marketplace, or sponsor Academy cohorts for measurable workforce and social impact.', cta: 'Talk to partnerships', interest: 'Partnership' }
  } satisfies Record<'student' | 'sponsor' | 'tech' | 'org', Persona>;
export const values = [
    {
        "description":  "We value every trade and treat every person with dignity.",
        "title":  "Respect the Work and the Worker"
    },
    {
        "description":  "We build competence, practise consistently and strive for excellence.",
        "title":  "Pursue Mastery"
    },
    {
        "description":  "We take responsibility, follow through and focus on results.",
        "title":  "Own the Outcome"
    },
    {
        "description":  "We act with integrity, communicate honestly and keep our word.",
        "title":  "Earn Trust Every Day"
    },
    {
        "description":  "We listen, communicate clearly and deliver quality work.",
        "title":  "Serve with Professionalism"
    },
    {
        "description":  "We stay curious, embrace technology and grow through collaboration.",
        "title":  "Advance Together"
    }
] satisfies Value[];
// Canonical section copy in original order; presentation is migrated in step 5.
export const sourceSections = [
    {
        "label":  "hero-title",
        "id":  "",
        "text":  "Kalvia · Lagos, Nigeria Africa\u0027s next class of technical professionals solar installers electricians plumbers HVAC technicians starts here! We train people who can build, manage, and lead: technically capable on the worksite, professionally equipped at the client meeting. Get started → Why Kalvia ✓ Certified with SOAT ★ Business-ready Enabling prosperity!"
    },
    {
        "label":  "What Kalvia promises",
        "id":  "",
        "text":  "Mastery, built in Practical, career-relevant training in the trades and the professional skills around them. Trust you can see The SOAT seal gives customers a visible, renewable reason to trust a technician. Access to opportunity Jobs, clients and the systems to manage them, through Kalvia Marketplace."
    },
    {
        "label":  "why-title",
        "id":  "about",
        "text":  "Why we exist Technical education was underbuilt. That is fixable. Africa\u0027s technical workforce is enormous in number and underserved in quality. Young people enter the trade economy without structure, without credentials, and without the professional formation that turns skill into a career. The result is a cycle that has nothing to do with the ability of the people in it, and everything to do with the absence of the right institutions. Kalvia exists to break that cycle. The old cycle With Kalvia Low trust Earned trust Customers Low pay Fair pay Technicians Low aspiration Real careers Young people No structure, no credentials Training, SOAT \u0026 access"
    },
    {
        "label":  "prosper-title",
        "id":  "",
        "text":  "The chain of prosperity The chain of prosperity Students prosper By gaining the skills, knowledge and opportunities needed to build meaningful, sustainable careers. People → Businesses → Families → Society Tap a ring to follow the ripple. When our people prosper, our businesses prosper. When our businesses prosper, our society prospers. Our essence: Enabling Prosperity"
    },
    {
        "label":  "brands-title",
        "id":  "academy",
        "text":  "One Kalvia, two ways in Learn the craft. Then find the work. Kalvia Academy builds the professional. Kalvia Marketplace connects them with the customers and businesses who need them. Kalvia Academy Kalvia Marketplace Academy The magic of mastery. Thorough training, strong structures and practical systems that develop technical competence and the professional skills the trade has been missing. Apply to the Academy → Marketplace Peace of mind, assured quality. A structured pool of certified technicians, with systems for placement, invoicing and tracking built in. Hire a technician →"
    },
    {
        "label":  "journey-title",
        "id":  "",
        "text":  "Read our mark from the bottom up Absorb. Apply. Ascend. Our logo tells the story of every Kalvia professional: knowledge enters through the open book, is transformed through skilled work, and produces someone who sees what others cannot. 01 01 · The open book Absorb The book faces upward, pages ready to receive. Every Kalvia student begins here, taking in the foundations of their craft. 02 · The gear Apply Theory becomes practice. Knowledge becomes skill. In the workshop, the student becomes a maker. 03 · The seeing eye Ascend The enlightened professional emerges: technically skilled, customer-trained, career-ready, with credentials recognised wherever opportunity exists."
    },
    {
        "label":  "soat-title",
        "id":  "soat",
        "text":  "SOAT SEAL OF AUTHORISED TECHNICIAN KALVIA CERTIFIED The Kalvian seal SOAT: trust, made visible. The Seal of Authorised Technician carries the trust Kalvia transfers to a technician, and gives customers a visible reason to trust them. It\u0027s valid for one year; renewal means passing Kalvia\u0027s theory and practical tests again. 0 months of validity per seal 2 tests to renew: theory and practical 1 visible reason to trust Check a technician\u0027s seal Verify Preview with sample IDs: KA17/A · KA09/C . Demonstration only; no live register is queried. These results do not verify a real technician."
    },
    {
        "label":  "finder-title",
        "id":  "finder",
        "text":  "Start enabling prosperity Who are you here as? Pick the one that fits and we\u0027ll point you to the right door. A student I want practical skills and a real career. A parent or sponsor I want a better future for someone I support. A technician I want steady jobs and clients. A business I need skilled people or want measurable impact."
    },
    {
        "label":  "values-title",
        "id":  "",
        "text":  "How we behave Six values, built like a perforated wall. Air and light pass through. So do ideas and opportunity. Hover or tap a value to see what it means in practice. 01 Respect the Work and the Worker We value every trade and treat every person with dignity. 02 Pursue Mastery We build competence, practise consistently and strive for excellence. 03 Own the Outcome We take responsibility, follow through and focus on results. 04 Earn Trust Every Day We act with integrity, communicate honestly and keep our word. 05 Serve with Professionalism We listen, communicate clearly and deliver quality work. 06 Advance Together We stay curious, embrace technology and grow through collaboration."
    },
    {
        "label":  "Kalvia in the field",
        "id":  "",
        "text":  "Theory becomes practice Respect the work Professional on every site"
    },
    {
        "label":  "vision-title",
        "id":  "",
        "text":  "Where we\u0027re going Beginning in Nigeria. Built for the continent. Our vision To establish Africa as a global source of highly skilled, business-ready technical professionals. Our mission To redefine skilled trades as a prestigious, technology-enabled profession, developing Africa\u0027s most respected generation of artisans. Brave. Honest. Confident. Reassuring. Informed."
    },
    {
        "label":  "contact-title",
        "id":  "contact",
        "text":  "start enabling prosperity Say hello! Let\u0027s build something that lasts. Whether you\u0027re enrolling, sponsoring, hiring or partnering, tell us a little and the right person will get back to you. hello@kalvia.one 50 Herbert Macaulay Way, Yaba, Lagos, Nigeria I\u0027m interested in Academy Sponsoring a learner Marketplace Partnership Full name Please tell us your name. Email Please enter a valid email. Message A short message helps us route you. Send message →"
    }
] satisfies SourceSection[];
