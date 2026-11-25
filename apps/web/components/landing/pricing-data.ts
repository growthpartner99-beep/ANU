import { PLAN_LIMITS } from "@askwell/shared";

export type PricingRow = {
  label: string;
  free: string;
  pro: string;
};

const formatCount = (value: number) => new Intl.NumberFormat("en-US").format(value);

/** Exact plan comparison from project.md §5. Numeric cells come from PLAN_LIMITS. */
export const PRICING_ROWS: readonly PricingRow[] = [
  {
    label: "Projects",
    free: formatCount(PLAN_LIMITS.free.maxProjects),
    pro: formatCount(PLAN_LIMITS.pro.maxProjects),
  },
  {
    label: "Messages / month (per project)",
    free: formatCount(PLAN_LIMITS.free.maxMessagesPerMonth),
    pro: formatCount(PLAN_LIMITS.pro.maxMessagesPerMonth),
  },
  {
    label: "Knowledge sources (per project, files + pasted text)",
    free: formatCount(PLAN_LIMITS.free.maxKnowledgeSources),
    pro: formatCount(PLAN_LIMITS.pro.maxKnowledgeSources),
  },
  { label: "Button color", free: "Default", pro: "Any" },
  { label: "Button position", free: "Bottom right", pro: "Any corner" },
  { label: "Button label", free: "Default", pro: "Custom" },
  { label: "Open animation", free: "Fade", pro: "Fade / slide / scale" },
  { label: "Header text", free: "Default", pro: "Custom" },
  { label: "\"Powered by\" badge", free: "Shown", pro: "Hidden" },
];
