"use client";
import { useState } from "react";
import { InfoCard } from "../CodemodPageUI";

export const LineChart = ({ data, svgWidth = 140, svgHeight = 50 }) => {
  // Calculate the maximum value in the data array
  const maxValue = Math.max(...data);

  // Calculate the scaling factor for the y-axis
  const scaleY = svgHeight / maxValue;

  // Calculate the x-coordinate spacing between points
  const pointSpacing = svgWidth / (data.length - 1);

  // Generate SVG path for the line chart
  let path = `M0,${svgHeight - data[0] * scaleY}`;
  for (let i = 1; i < data.length; i++) {
    const x = i * pointSpacing;
    const y = svgHeight - data[i] * scaleY;
    path += ` L${x},${y}`;
  }

  // MOCK DATA
  const dates = getPastDates(data.length);

  const latestData = data[data.length - 1];
  const [currentHoveredData, setHoveredData] = useState(latestData);
  const [currentDate, setCurrentDate] = useState<string | null>(null);
  const [width, setWidth] = useState(0);

  const handleMouseMove = (event) => {
    if (event.target.getAttribute("data-dot-indicator") === "true") return;

    const rect = event.target.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const dataIndex = Math.round(((data.length - 1) * mouseX) / svgWidth);

    setHoveredData(data[dataIndex]);
    setCurrentDate(
      dates[dataIndex].toLocaleString("en-us", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    );
    setWidth(svgWidth - mouseX);
  };

  const areaPath = `${path} L${svgWidth},${svgHeight} L0,${svgHeight} Z`;

  return (
    <>
      <InfoCard
        value={currentHoveredData}
        label={currentDate ?? "Number of uses"}
      />

      <div
        className="group relative flex items-end pt-3"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          setHoveredData(latestData);
          setCurrentDate(null);
        }}
      >
        <div
          data-dot-indicator
          className="absolute hidden h-full w-[1.6px] rounded-full bg-[#A2DB00] group-hover:flex"
          style={{
            transform: `translateX(${svgWidth - width}px)`,
          }}
        />

        <svg
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="20%" stopColor="#A2DB00" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#A2DB00" stopOpacity="0" />
            </linearGradient>
          </defs>
          <defs>
            <linearGradient
              id="areaGradientGrey"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="20%" stopColor="grey" stopOpacity="0.8" />
              <stop offset="100%" stopColor="grey" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Gradient background under the lines  */}
          <path
            d={areaPath}
            fill="url(#areaGradient)"
            // fill="url(#areaGradientGrey)"
            opacity="0.3"
          />
          {/* <path
            d={areaPath}
            style={{
              clipPath: `inset(0 ${width}px 0 0)`,
            }}
            fill="url(#areaGradient)"
            opacity="0.3"
          /> */}
          {/* Lines */}
          <path
            d={path}
            fill="none"
            stroke="#A2DB00"
            // stroke="grey"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          {/* Active line */}
          {/* <path
            d={path}
            style={{
              clipPath: `inset(0 ${width}px 0 0)`,
            }}
            fill="none"
            stroke="#A2DB00"
            strokeWidth="2.2"
            strokeLinecap="round"
          /> */}
        </svg>
      </div>
    </>
  );
};

function getPastDates(n: number): Date[] {
  const dates: Date[] = [];
  const today = new Date();

  for (let i = 0; i < n; i++) {
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - i);
    dates.push(pastDate);
  }

  return dates.reverse();
}
