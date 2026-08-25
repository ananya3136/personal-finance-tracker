import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./CategoryChart.css";

const COLORS = [
  "#00E599", "#10B981", "#3B82F6", "#F59E0B",
  "#EF4444", "#A78BFA", "#06B6D4", "#F97316",
  "#EC4899", "#84CC16",
];

const CustomTooltip = ({ active, payload, total }) => {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0];
  const pct = ((item.value / total) * 100).toFixed(1);

  return (
    <div className="pie-tooltip">
      <div className="pie-tooltip__label">{item.name}</div>
      <div className="pie-tooltip__value">₹{item.value.toLocaleString("en-IN")}</div>
      <div className="pie-tooltip__pct">{pct}% of total expenses</div>
    </div>
  );
};

function CategoryChart({ categoryData = [] }) {
  const [activeIndex, setActiveIndex] = useState(null);

  // categoryData comes from backend as [{ _id: "Food", total: 3000 }, ...]
  const data = categoryData
    .map((c) => ({ name: c._id || c.category, value: c.total }))
    .sort((a, b) => b.value - a.value);

  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (!data.length) {
    return (
      <div className="category-chart-card">
        <div className="category-chart__header">
          <div className="category-chart__title-wrap">
            <h3>🥧 Spending by Category</h3>
            <p>Where your money is going</p>
          </div>
        </div>
        <div className="category-chart__empty">
          <div className="category-chart__empty-icon">📭</div>
          <p>No expense data yet.<br />Add transactions to see breakdown.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="category-chart-card">
      {/* Header */}
      <div className="category-chart__header">
        <div className="category-chart__title-wrap">
          <h3>🥧 Spending by Category</h3>
          <p>Where your money is going this month</p>
        </div>
        <div className="category-chart__total">
          <div className="category-chart__total-label">Total Spent</div>
          <div className="category-chart__total-value">
            ₹{total.toLocaleString("en-IN")}
          </div>
        </div>
      </div>

      {/* Chart + Legend */}
      <div className="category-chart__body">

        {/* Donut Chart with Hollow Center */}
        <div className="category-chart__pie" style={{ position: "relative" }}>
          <ResponsiveContainer width={220} height={220}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={64}
                outerRadius={96}
                paddingAngle={4}
                dataKey="value"
                isAnimationActive={true}
                animationDuration={1200}
                animationEasing="ease-out"
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    opacity={
                      activeIndex === null || activeIndex === index ? 1 : 0.35
                    }
                    style={{ cursor: "pointer", transition: "opacity 0.25s ease" }}
                  />
                ))}
              </Pie>
              <Tooltip
                content={<CustomTooltip total={total} />}
                cursor={false}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Hollow center total spent overlay */}
          <div className="donut-center-overlay">
            <span className="donut-center-label">Total Spent</span>
            <span className="donut-center-value">₹{total.toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* Legend */}
        <div className="category-chart__legend">
          {data.map((item, index) => {
            const pct = ((item.value / total) * 100).toFixed(1);
            return (
              <div
                key={index}
                className={`legend-item ${activeIndex === index ? "legend-item--active" : ""}`}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <div className="legend-item__left">
                  <div
                    className="legend-item__dot"
                    style={{ background: COLORS[index % COLORS.length] }}
                  />
                  <span className="legend-item__name">{item.name}</span>
                </div>
                <div className="legend-item__right">
                  <span className="legend-item__amount">
                    ₹{item.value.toLocaleString("en-IN")}
                  </span>
                  <span className="legend-item__pct">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default CategoryChart;
