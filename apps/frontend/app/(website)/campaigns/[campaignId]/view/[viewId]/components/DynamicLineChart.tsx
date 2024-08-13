import React from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  type TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import { v4 as uuidv4 } from "uuid";
import type { DynamicLineChartProps } from "../types";

interface ExtendedDynamicLineChartProps extends DynamicLineChartProps {
  title: string;
}

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  payload?: TooltipPayloadItem[];
}

export const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    const uniquePayload = payload.reduce<TooltipPayloadItem[]>(
      (acc, current) => {
        if (!acc.find((item) => item.name === current.name)) {
          acc.push(current);
        }
        return acc;
      },
      [],
    );

    return (
      <div className="custom-tooltip bg-white p-4 shadow-md rounded">
        <p className="label">{`${new Date(label || "").toLocaleDateString(
          "en-US",
          {
            month: "long",
            year: "numeric",
          },
        )}`}</p>
        {uniquePayload.map((pld, index) => (
          <p
            key={index}
            style={{ color: pld.color }}
          >{`${pld.name}: ${pld.value.toFixed(2)}`}</p>
        ))}
      </div>
    );
  }
  return null;
};

interface LegendPayloadItem {
  value: string;
  color: string;
}

interface CustomLegendProps {
  payload?: { value: string; color: string }[];
}

const CustomLegend: React.FC<CustomLegendProps> = ({ payload = [] }) => {
  const uniquePayload = payload.reduce<LegendPayloadItem[]>((acc, current) => {
    return acc.some((item) => item.value === current.value)
      ? acc
      : [...acc, current];
  }, []);

  return (
    <ul className="flex flex-wrap relative justify-center space-x-4">
      {uniquePayload.map((entry, index) => (
        <li key={`item-${index}`} className="flex items-center">
          <span
            style={{
              backgroundColor: entry.color,
              width: "10px",
              height: "10px",
              display: "inline-block",
              marginRight: "5px",
            }}
          />
          <span>{entry.value}</span>
        </li>
      ))}
    </ul>
  );
};

const DynamicLineChart: React.FC<ExtendedDynamicLineChartProps> = ({
  title,
  dataSets,
  colorConfig,
}) => {
  const allData = dataSets.reduce<Record<string, number>[]>((acc, set) => {
    set.data.forEach((item, index) => {
      if (!acc[index]) {
        acc[index] = { timestamp: item.timestamp };
      }
      acc[index][set.title] = item.value;
    });
    return acc;
  }, []);

  const minValue = Math.floor(
    Math.min(...dataSets.flatMap((set) => set.data.map((d) => d.value))),
  );
  const maxValue = Math.ceil(
    Math.max(...dataSets.flatMap((set) => set.data.map((d) => d.value))),
  );

  return (
    <div className="w-full h-full flex flex-col">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={allData}
          margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="timestamp"
            type="number"
            scale="time"
            domain={["auto", "auto"]}
            tickFormatter={(unixTime) =>
              new Date(unixTime).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })
            }
            padding={{ left: 30, right: 30 }}
          />
          <YAxis
            domain={[minValue, maxValue]}
            padding={{ top: 20, bottom: 20 }}
            tickFormatter={(value) => Math.round(value)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
          {dataSets.map((set, index) => {
            const gradientId = `gradient-${uuidv4()}`;
            const color = colorConfig[index % colorConfig.length];
            return (
              <React.Fragment key={set.title}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={color.gradientStart}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor={color.gradientEnd}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <Line
                  type="monotone"
                  dataKey={set.title}
                  stroke={color.line}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 8 }}
                />
                <Area
                  type="monotone"
                  dataKey={set.title}
                  stroke="none"
                  fill={`url(#${gradientId})`}
                />
              </React.Fragment>
            );
          })}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DynamicLineChart;
