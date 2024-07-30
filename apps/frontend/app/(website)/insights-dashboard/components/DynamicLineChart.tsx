import React from 'react';
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { v4 as uuidv4 } from 'uuid';  // Import the uuid library
import { DynamicLineChartProps } from '../types';

const DynamicLineChart: React.FC<DynamicLineChartProps> = ({ dataSets }) => {
  const allData = dataSets.flatMap(set => set.data);
  const minValue = Math.min(...allData.map(d => d.value));
  const maxValue = Math.max(...allData.map(d => d.value));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={allData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="timestamp"
          type="number"
          scale="time"
          domain={['auto', 'auto']}
          tickFormatter={(unixTime) => new Date(unixTime).toLocaleDateString('en-US', { month: 'short' })}
          padding={{ left: 30, right: 30 }}
        />
        <YAxis
          domain={[minValue, maxValue]}
          padding={{ top: 20, bottom: 20 }}
        />
        <Tooltip
          labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        />
        {dataSets.map((set, index) => {
          const gradientId = `gradient-${uuidv4()}`; // Generate a unique id for each gradient
          return (
            <React.Fragment key={set.key}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={set.colorConfig.gradientStart} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={set.colorConfig.gradientEnd} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Line
                type="monotone"
                dataKey="value"
                data={set.data}
                name={set.key}
                stroke={set.colorConfig.line}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 8 }}
              />
              <Area
                type="monotone"
                dataKey="value"
                data={set.data}
                name={`${set.key}-area`}
                stroke="none"
                fill={`url(#${gradientId})`}
              />
            </React.Fragment>
          );
        })}
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default DynamicLineChart;
