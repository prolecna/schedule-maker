import { useEffect, useRef, useState } from "react";

type ExpandableJsonProps = {
  value: unknown;
};

export function ExpandableJson({ value }: ExpandableJsonProps) {
  const [expanded, setExpanded] = useState(false);
  const pretty = JSON.stringify(value, null, 2);
  const compact = JSON.stringify(value);

  return (
    <div className="relative">
      <pre
        className="whitespace-pre-wrap break-all text-xs bg-muted rounded p-2 cursor-pointer"
        onClick={() => setExpanded((e) => !e)}
        title="Click to expand/collapse"
      >
        {expanded ? pretty : compact}
      </pre>
    </div>
  );
}
