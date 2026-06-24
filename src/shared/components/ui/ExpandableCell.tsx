import React, { useState } from 'react';

interface Props {
  text: string;
  maxLines?: number;
  lineHeight?: number;
}

const ExpandableCell: React.FC<Props> = ({ text, maxLines = 2, lineHeight = 18 }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      title={expanded ? 'Click para colapsar' : 'Click para expandir'}
      style={{
        lineHeight: `${lineHeight}px`,
        maxHeight: expanded ? 'none' : `${maxLines * lineHeight}px`,
        overflow: expanded ? 'visible' : 'hidden',
        cursor: 'pointer',
        transition: 'max-height 0.25s ease-in-out',
        wordBreak: 'break-word',
        whiteSpace: 'normal',
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: expanded ? 'unset' : maxLines,
        textOverflow: 'ellipsis',
      }}
    >
      {text}
    </div>
  );
};

export default ExpandableCell;