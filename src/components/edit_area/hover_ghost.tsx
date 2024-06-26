import React, { forwardRef } from 'react';
import "./hover_ghost.less";
import { prefix } from '@/utils/deal_class_prefix';
import { TimelineRow } from '@/interface/action';

export type HoverGhostProps = {
  styles?: React.CSSProperties;
  getGhostRender?: (row: TimelineRow) => React.ReactNode;
  row: TimelineRow;
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
      {props.getGhostRender?.(props.row) || <div className={prefix('hover-ghost-default')}>+</div>}
    </div>
  );
});


