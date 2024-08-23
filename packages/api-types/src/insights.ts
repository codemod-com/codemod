import * as v from "valibot";

export type PrimitiveWidgetData = v.InferInput<
  typeof primitiveWidgetDataSchema
>;
export const primitiveWidgetDataSchema = v.object({
  heading: v.optional(v.string()),
  text: v.optional(v.string()),
  description: v.optional(v.string()),
});

export type TableWidgetData = v.InferInput<typeof tableWidgetDataSchema>;
export const tableWidgetDataSchema = v.array(
  v.object({
    value: v.string(),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
  }),
);

export type ChartWidgetData = v.InferInput<typeof chartWidgetDataSchema>;
export const chartWidgetDataSchema = v.object({
  y: v.array(
    v.object({
      title: v.string(),
      value: v.string(),
      color: v.optional(v.string()),
    }),
  ),
  x: v.string(),
});

export type WidgetData = v.InferInput<typeof widgetDataSchema>;
export const widgetDataSchema = v.union([
  primitiveWidgetDataSchema,
  tableWidgetDataSchema,
  chartWidgetDataSchema,
]);

export const putWidgetBodySchema = v.union([
  v.object({
    title: v.string(),
    insightId: v.number(),
    data: primitiveWidgetDataSchema,
    kind: v.literal("primitive"),
  }),
  v.object({
    title: v.string(),
    insightId: v.number(),
    data: tableWidgetDataSchema,
    kind: v.literal("table"),
  }),
  v.object({
    title: v.string(),
    insightId: v.number(),
    data: chartWidgetDataSchema,
    kind: v.literal("chart"),
  }),
  v.object({
    id: v.number(),
    title: v.optional(v.string()),
    data: v.optional(widgetDataSchema),
    kind: v.optional(
      v.union([v.literal("primitive"), v.literal("table"), v.literal("chart")]),
    ),
  }),
]);

export type PutWidgetBody = v.InferInput<typeof putWidgetBodySchema>;
export const parsePutWidgetBody = (input: unknown) =>
  v.parse(putWidgetBodySchema, input);
