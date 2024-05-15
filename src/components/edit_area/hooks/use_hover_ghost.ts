import { TimelineRow } from '@/interface/action';
import { parserTimeToPixel } from '@/utils/deal_data';
import { useClientPoint, useFloating, useHover, useInteractions } from '@floating-ui/react';
import { useMemo, useState } from 'react';

const hideOutside = ({ actions, startLeft, floatingWidth, maxGhostRight }) => {
  return {
    name: 'hideOutside',
    options: { actions, startLeft, floatingWidth },
    fn({ x, y }) {
      const isBeforeStart = x < startLeft;
      actions.push({ left: maxGhostRight, right: maxGhostRight });

      const isInsideAnAction = actions.some((action) => {
        return x >= action.left && x <= action.right;
      });

      const isAfterEnd = x > maxGhostRight;

      if (isBeforeStart || isInsideAnAction || isAfterEnd)
        return { x, y, data: { isOutside: true, width: floatingWidth } };

      const nearAction = actions.find((action) => {
        return x + floatingWidth >= action.left && x < action.right;
      });

      if (nearAction) return { x, y, data: { isOutside: false, width: nearAction.left - x } };

      return {
        x,
        y,
        data: { isOutside: false, width: floatingWidth },
      };
    },
  };
};

export const useHoverGhost = ({
  rowData,
  startLeft,
  scaleWidth,
  scale,
  enabled,
  maxGhostRight,
}: {
  rowData: TimelineRow;
  startLeft: number;
  scaleWidth: number;
  scale: number;
  enabled: boolean;
  maxGhostRight: number;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const middlewareOptions = useMemo(() => {
    return {
      actions: rowData?.actions
        .filter((actions) => !actions.allowGhost)
        .map((action) => {
          return {
            id: action.id,
            left: parserTimeToPixel(action.start, { startLeft, scaleWidth, scale }),
            right: parserTimeToPixel(action.end, { startLeft, scaleWidth, scale }),
          };
        })
        .sort((a, b) => a.left - b.left),
      startLeft,
      maxGhostRight: parserTimeToPixel(maxGhostRight, { startLeft, scaleWidth, scale }),
      floatingWidth: scaleWidth * 2,
    };
  }, [rowData, startLeft, scaleWidth, scale, maxGhostRight]);

  const { refs, floatingStyles, context, middlewareData, x } = useFloating({
    open: isVisible,
    onOpenChange: setIsVisible,
    placement: 'right',
    middleware: [hideOutside(middlewareOptions)],
  });

  const hover = useHover(context, {
    enabled,
  });
  const clientPoint = useClientPoint(context, {
    axis: 'x',
    enabled,
  });
  const { getReferenceProps, getFloatingProps } = useInteractions([hover, clientPoint]);

  return {
    refs,
    x,
    isVisible: enabled && isVisible,
    floatingStyles,
    middlewareData,
    getReferenceProps,
    getFloatingProps,
  };
};
