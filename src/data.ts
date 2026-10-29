export type Project = {
  id: string;
  name: string;
  number: string;
  category: string;
  year: string;
  description: string;
  tagline: string;
  color: string;
  image?: string;
  imageSource?: "figma";
  gallery?: {
    image: string;
    title: string;
    alt: string;
    width: number;
    height: number;
    mobile?: boolean;
  }[];
  formerDomain?: string;
  url?: string;
  repo?: string;
  tags: string[];
  features: string[];
  decision: string;
  featured?: boolean;
};
export const projects: Project[] = [
  {
    id: "daao",
    name: "DAAO",
    number: "01",
    category: "WEB3 / PRODUCT",
    year: "SELECTED WORK",
    tagline: "Collective vision. Collective capital.",
    description:
      "An end-to-end Web3 interface for discovering funds, launching DAOs, and exploring decentralized AI finance.",
    color: "#ccf868",
    image: "/projects/daao.webp",
    url: "https://www.daao.ai/",
    tags: ["Web3", "Product engineering", "Responsive"],
    features: [
      "Featured and upcoming fund discovery",
      "DAO launch and wallet connection entry points",
      "Farms navigation and product FAQs",
      "Responsive end-to-end Web3 experience",
    ],
    decision:
      "Give a technically complex product a coherent visual language, clear hierarchy, and purposeful interaction.",
    featured: true,
  },
  {
    id: "frammer",
    name: "Frammer AI",
    number: "02",
    category: "AI / ANALYTICS",
    year: "SELECTED WORK",
    tagline: "From content to clarity.",
    description:
      "A full-stack analytics workspace that turns a three-stage video pipeline into actionable, explorable intelligence.",
    color: "#d5d1f2",
    image: "/projects/frammer.webp",
    url: "https://frammerai-gc.vercel.app/",
    repo: "https://github.com/Anta18/frammerai-gc",
    tags: ["Next.js", "FastAPI", "PostgreSQL", "AI"],
    features: [
      "Upload, processing, and publishing analytics",
      "Global filters, date ranges, and detailed exploration",
      "Natural-language queries and custom KPIs",
      "Operational alerts and intelligence summaries",
    ],
    decision:
      "Connect an executive overview to detailed exploration, while keeping the primary analytics path and natural-language query path independently understandable.",
    featured: true,
  },
  {
    id: "dvote",
    name: "dVote",
    number: "03",
    category: "FULL STACK / VOTING",
    year: "SELECTED WORK",
    tagline: "Every voice. Clearly heard.",
    description:
      "A full-stack voting portal designed around a focused, approachable frontend and a clear multi-election experience.",
    color: "#ffb69a",
    image: "/projects/dvote.webp",
    url: "https://dvote-eight.vercel.app/",
    repo: "https://github.com/Anta18/voting_portal_frontend",
    tags: ["Full stack", "Next.js", "Product UI"],
    features: [
      "Multi-election voting portal",
      "Registration and login experiences",
      "End-to-end frontend and backend implementation",
    ],
    decision:
      "Make the path into a voting experience easy to understand, with consistent navigation and a restrained interface.",
    featured: true,
  },
  {
    id: "nullstate",
    name: "Nullstate",
    number: "04",
    category: "WEB3 / MARKETPLACE",
    year: "SELECTED WORK",
    tagline: "Built for the next wave of collectors.",
    description:
      "A responsive NFT marketplace with Web3 integrations to buy, sell, and mint NFTs.",
    color: "#c3acf2",
    image: "/projects/nullstate.webp",
    url: "https://nullstate.vercel.app/",
    repo: "https://github.com/Anta18/nullstate_frontend",
    tags: ["Next.js", "Web3", "NFT marketplace"],
    features: [
      "NFT buying, selling, and minting integrations",
      "Collection discovery and marketplace interface",
      "Responsive web application delivery under aggressive deadlines",
    ],
    decision:
      "Bring collection discovery, market information, and transaction actions into one recognizable visual system.",
    featured: true,
  },
  {
    id: "zelta",
    name: "Zelta",
    number: "05",
    category: "FINTECH / DATA",
    year: "SELECTED WORK",
    tagline: "Make the market legible.",
    description:
      "Interactive cryptocurrency backtesting and analysis, making dense BTC and ETH trade datasets easier to explore.",
    color: "#c5dfce",
    image: "/projects/zelta.webp",
    url: "https://zelta-dash.vercel.app/",
    repo: "https://github.com/Anta18/Zelta_Dash",
    tags: ["Next.js", "Data visualization", "Backtesting"],
    features: [
      "BTC/ETH and leverage-based analysis",
      "Equity and drawdown curves with performance metrics",
      "Quarter-wise breakdowns and trade exploration",
    ],
    decision:
      "Use visual hierarchy and linked analytics to make dense strategy performance data navigable.",
  },
  {
    id: "bhs",
    name: "BHS",
    number: "06",
    category: "FINANCE / PORTAL",
    year: "SELECTED WORK",
    tagline: "A clearer view of investment.",
    description:
      "An end-to-end investor portal with a considered frontend and a consistent application experience.",
    color: "#e6d9bc",
    image: "/projects/bhs.webp",
    url: "https://bhs-frontend.vercel.app/",
    tags: ["Full stack", "Investor portal", "React"],
    features: [
      "Investor-facing application interface",
      "Registration and login experience",
      "End-to-end application development",
    ],
    decision:
      "Prioritize a legible, consistent interface for financial information and account workflows.",
  },
  {
    id: "commerce",
    name: "Reflection",
    number: "07",
    category: "COMMERCE / FULL STACK",
    year: "SELECTED WORK",
    tagline: "The whole journey, from discovery to delivery.",
    description:
      "A full-stack lingerie store connecting product discovery, customer accounts, inventory awareness, checkout, and administration.",
    color: "#e5dad0",
    image: "/projects/reflection.webp",
    imageSource: "figma",
    formerDomain: "reflectionlingerie.com",
    gallery: [
      {
        image: "/projects/reflection-home.webp",
        title: "The storefront",
        alt: "Reflection desktop storefront: editorial campaign photography, product collections, membership invitation, and footer.",
        width: 1006,
        height: 4096,
      },
      {
        image: "/projects/reflection-product.webp",
        title: "The product story",
        alt: "Reflection product detail design with a photo gallery, size selector, wishlist action, and garment details.",
        width: 1000,
        height: 2646,
      },
      {
        image: "/projects/reflection-mobile.webp",
        title: "Made for the small screen",
        alt: "Reflection mobile storefront design with a compact header, campaign photography, stacked product collections, and newsletter signup.",
        width: 412,
        height: 3328,
        mobile: true,
      },
    ],
    tags: ["Full stack", "Stripe", "Commerce"],
    features: [
      "Dynamic catalogs, sorting, price/category filters, and search",
      "Shopping cart and wishlists with automatic restock notifications",
      "Order management and an admin portal",
      "Stripe payment gateway integration",
    ],
    decision:
      "Design discovery and purchase as a connected journey, with supporting administrative workflows and inventory-aware notifications.",
  },
];
export const engineering = [
  {
    id: "exchange",
    number: "01",
    title: "High-Frequency Trading Exchange & Market Simulation",
    short: "The exchange",
    field: "SYSTEMS / C++",
    description:
      "A price-time priority matching engine with a cache-efficient limit order book, lock-free event propagation, deterministic replay, crash recovery, and a real-time trading terminal.",
    details:
      "180ns p50 matching latency, as reported in the original C++ project benchmark. First place, General Championship Open Soft.",
    url: "https://github.com/orgs/NHR-OS-2026/repositories",
  },
  {
    id: "alpha",
    number: "02",
    title: "High-Frequency Alpha Discovery & Validation",
    short: "The signal",
    field: "QUANT / RESEARCH",
    description:
      "An event-driven research and backtesting engine combining order-flow imbalance, Hawkes intensity, and learning-based signals with purged cross-validation and market-impact modeling.",
    details:
      "Includes overfitting assessment, signal interpretation, and strategy capacity analysis.",
    url: "https://github.com/Anta18/Backtester_Alpha",
  },
  {
    id: "database",
    number: "03",
    title: "Embedded Distributed Peer-to-Peer DBMS",
    short: "The network",
    field: "DISTRIBUTED SYSTEMS",
    description:
      "A database engine with SQL query processing, indexes, ACID transactions, WAL recovery, MVCC, and coordinator-free peer synchronization.",
    details:
      "Course project supervised by Prof. Pabitra Mitra and Prof. Pralay Mitra.",
    url: "https://github.com/utsaghosh04/AdHocDB-P2P",
  },
  {
    id: "transport",
    number: "04",
    title: "High-Performance Reliable Transport Protocol",
    short: "The protocol",
    field: "NETWORKS / SYSTEMS",
    description:
      "Reliable transport over UDP with sliding-window ARQ, adaptive retransmission, congestion control, and a lock-free io_uring runtime.",
    details:
      "Includes configurable network simulation and deterministic replay. Supervised by Prof. Sandip Chakraborty.",
  },
] as const;
export type Mode = (typeof engineering)[number]["id"];
