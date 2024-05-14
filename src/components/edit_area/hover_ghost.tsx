import React, { forwardRef } from 'react';
import "./hover_ghost.less";
import { prefix } from '@/utils/deal_class_prefix';

export type HoverGhostProps = {
  styles?: React.CSSProperties;
};

export const HoverGhost = forwardRef<HTMLDivElement, HoverGhostProps>((props, ref) => {
  const { styles, ...otherProps } = props;

  return (
    <div
      ref={ref}
      style={styles}
      {...otherProps}
      className={prefix('hover-ghost')}
    >
      +
    </div>
  );
});


