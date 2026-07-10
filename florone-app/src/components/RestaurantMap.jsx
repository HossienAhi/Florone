import { TABLE_LAYOUT, faNum } from "../data/tableLayout";

function TableLabel({ table, horizontal }) {
  const cx = table.x + table.w / 2;
  const cy = table.y + table.h / 2;
  const isTall = table.h >= 80;
  const showCap = table.cap >= 4;

  /* when the whole map is rotated -90°, counter-rotate text so it stays upright */
  const upright = (x, y) => (horizontal ? `rotate(90 ${x} ${y})` : undefined);

  if (isTall) {
    const y1 = cy - (showCap ? 10 : 0);
    return (
      <>
        <text
          x={cx}
          y={y1}
          transform={upright(cx, y1)}
          textAnchor="middle"
          dominantBaseline="central"
          className="rm-table-num rm-table-num--tall"
        >
          {faNum(table.id)}
        </text>
        {showCap && (
          <text
            x={cx}
            y={cy + 14}
            transform={upright(cx, cy + 14)}
            textAnchor="middle"
            dominantBaseline="central"
            className="rm-table-cap"
          >
            {faNum(table.cap)} نفر
          </text>
        )}
      </>
    );
  }

  if (showCap) {
    return (
      <>
        <text
          x={cx}
          y={cy - 9}
          transform={upright(cx, cy - 9)}
          textAnchor="middle"
          dominantBaseline="central"
          className="rm-table-num"
        >
          {faNum(table.id)}
        </text>
        <text
          x={cx}
          y={cy + 11}
          transform={upright(cx, cy + 11)}
          textAnchor="middle"
          dominantBaseline="central"
          className="rm-table-cap"
        >
          {faNum(table.cap)} نفر
        </text>
      </>
    );
  }

  return (
    <text
      x={cx}
      y={cy}
      transform={upright(cx, cy)}
      textAnchor="middle"
      dominantBaseline="central"
      className="rm-table-num"
    >
      {faNum(table.id)}
    </text>
  );
}

export default function RestaurantMap({
  tables = TABLE_LAYOUT,
  getTableColors,
  selectedKey = null,
  onTableClick,
  isTableClickable = () => true,
  className = "",
  variant = "dark",
  orientation = "vertical",
}) {
  const horizontal = orientation === "horizontal";
  const viewBox = horizontal ? "0 0 620 400" : "0 0 400 620";
  /* rigid 90° rotation → same arrangement, landscape orientation */
  const rotateGroup = horizontal ? "translate(0 400) rotate(-90)" : undefined;

  return (
    <svg
      className={`rm-map ${className}`}
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid meet"
      data-variant={variant}
      data-orientation={orientation}
    >
      <g transform={rotateGroup}>
        <rect
          x="8" y="8" width="384" height="604" rx="22"
          className="rm-wall"
        />

        <path
          d="M 18 14 L 356 14 L 334 130 L 40 130 Z"
          className="rm-zone-top"
        />

        <line x1="358" y1="14" x2="358" y2="118" className="rm-entry-line" />
        <text
          x="374"
          y="66"
          textAnchor="middle"
          transform="rotate(90 374 66)"
          className="rm-entry-label"
        >
          input cafe
        </text>

        <line x1="14" y1="136" x2="386" y2="136" className="rm-divider" />

        <path
          d="M 192 148 H 334 V 172 H 304 V 372 H 192 Z"
          className="rm-counter"
        />
        <text
          x="263"
          y="268"
          transform={horizontal ? "rotate(90 263 268)" : undefined}
          textAnchor="middle"
          className="rm-counter-label"
        >
          فلــوران
        </text>

        <line x1="14" y1="382" x2="386" y2="382" className="rm-divider" />

        {tables.map((t) => {
          const isSel = t.key === selectedKey;
          const c = getTableColors(t, isSel);
          const clickable = isTableClickable(t);

          return (
            <g
              key={t.key}
              className={`rm-table ${t.status ?? ""} ${isSel ? "is-selected" : ""} ${clickable ? "is-clickable" : ""}`}
              onClick={() => clickable && onTableClick?.(t)}
            >
              <rect
                x={t.x - 6}
                y={t.y - 6}
                width={t.w + 12}
                height={t.h + 12}
                fill="transparent"
              />
              <rect
                x={t.x}
                y={t.y}
                width={t.w}
                height={t.h}
                rx="12"
                fill={c.fill}
                stroke={c.stroke}
                strokeWidth={isSel ? 2.5 : 2}
              />
              <TableLabel table={t} horizontal={horizontal} />
              {t.hasUnread && (
                <>
                  <circle
                    className="rm-unread-halo"
                    cx={t.x + t.w}
                    cy={t.y}
                    r="9"
                  />
                  <circle
                    className="rm-unread-dot"
                    cx={t.x + t.w}
                    cy={t.y}
                    r="5.5"
                  />
                </>
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
}
