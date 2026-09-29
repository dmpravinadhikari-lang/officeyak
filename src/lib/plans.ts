/**
 * Plans decide two things: which modules are unlocked, and how much AI use is
 * included. Prices are set here and nowhere else, so changing them after a
 * conversation with a consultancy owner is a one-line edit.
 *
 * No payment gateway yet, you set a consultancy's plan in the admin panel and
 * invoice them by hand. The limits below are enforced regardless.
 *
 * What a plan counts changed, and the reason is worth keeping.
 *
 * It used to count active students. That charges a consultancy for being
 * good at its job: the month they enrol thirty families instead of twenty is
 * the month the software asks for more money, and the obvious way out is to
 * stop recording students, which breaks the product and the customer's own
 * numbers at the same time. It also does not match the work. Nothing costs
 * more to run because a file exists; it costs more because another person
 * logs in all day.
 *
 * So plans now count staff accounts and offices, which is what every CRM in
 * this category charges on, and a consultancy can put every student it has on
 * the system without being punished for it.
 */
/**
 * How long a consultancy gets before the first bill.
 *
 * Thirty days rather than the fourteen software companies elsewhere use: a
 * consultancy owner does not evaluate this in an afternoon, they try it on one
 * branch and decide at the end of the month.
 *
 * It lives here, beside the prices, because it is a commercial term and the
 * Terms of Service and the pricing pages all have to state it. The last time a
 * number like this was written out by hand in prose, the prose said billing
 * started when the customer asked for it while the product started a clock at
 * signup, and that contradiction sat in a contract for a day.
 */
export const TRIAL_DAYS = 30;

export const PLANS = {
  starter: {
    label: "Starter",
    audience: "consultancy",
    priceNpr: 4999,
    maxUsers: 5,
    maxBranches: 1,
    monthlyCredits: 300,
    blurb: "One office, a small team",
  },
  growth: {
    label: "Growth",
    audience: "consultancy",
    priceNpr: 12999,
    maxUsers: 15,
    maxBranches: 3,
    monthlyCredits: 1500,
    blurb: "A few offices, a growing team",
  },
  pro: {
    label: "Pro",
    audience: "consultancy",
    priceNpr: 29999,
    maxUsers: Number.POSITIVE_INFINITY,
    maxBranches: Number.POSITIVE_INFINITY,
    monthlyCredits: 5000,
    blurb: "Any number of offices and staff",
  },
  student_free: {
    label: "Student Free",
    audience: "student",
    priceNpr: 0,
    maxUsers: 1,
    maxBranches: 1,
    monthlyCredits: 15,
    blurb: "Direct student, free tier",
  },
  student_premium: {
    label: "Student Premium",
    audience: "student",
    priceNpr: 999,
    maxUsers: 1,
    maxBranches: 1,
    monthlyCredits: 120,
    blurb: "Direct student, full access",
  },
} as const;

/**
 * What each plan unlocks beyond its limits.
 *
 * Kept here beside the prices so the pricing page and the guard read the same
 * list. A feature named on the website and not in this map is a promise the
 * software does not keep.
 */
export const PLAN_FEATURES = {
  starter: ["pipeline", "tasks", "attendance", "documents"],
  growth: ["pipeline", "tasks", "attendance", "documents", "payroll", "market", "partners"],
  pro: ["pipeline", "tasks", "attendance", "documents", "payroll", "market", "partners"],
  student_free: [],
  student_premium: [],
} as const;

export type PlanFeature = "pipeline" | "tasks" | "attendance" | "documents" | "payroll" | "market" | "partners";

export const planAllows = (planId: string, feature: PlanFeature): boolean =>
  ((PLAN_FEATURES as Record<string, readonly string[]>)[planId] ?? PLAN_FEATURES.starter).includes(feature);

/** The cheapest plan that includes something, for the upsell message. */
export const cheapestWith = (feature: PlanFeature) =>
  (["starter", "growth", "pro"] as const).find((id) => planAllows(id, feature)) ?? "pro";

export type PlanId = keyof typeof PLANS;
export const PLAN_IDS = Object.keys(PLANS) as PlanId[];
export const planOf = (id: string) => PLANS[(id as PlanId)] ?? PLANS.starter;
export const isConsultancyPlan = (id: string) => planOf(id).audience === "consultancy";
