import { TimelineRow } from "@/interface/action";
import { parserTimeToPixel } from "@/utils/deal_data";
import { useClientPoint, useFloating, useHover, useInteractions } from "@floating-ui/react";
import { useMemo, useState } from "react";

const hideOutside = ({ actions, startLeft, floatingWidth }) => {
  return {
    name: 'hideOutside',
    options: { actions, startLeft, floatingWidth },
    fn({x, y}) {
      const isBeforeStart = x < startLeft;

      const isInsideAnAction = actions.some(action => {
        return x >= action.left && x <= action.right;
      });

      if (isBeforeStart || isInsideAnAction) return { x, y, data: { isOutside: true, width: floatingWidth } };

      const nearAction = actions.find(action => {
        return x + floatingWidth >= action.left && x < action.right;
      });

      if (nearAction) return { x, y, data: { isOutside: false, width: nearAction.left - x } };

      return {
        x,
        y,
        data: { isOutside: false, width: floatingWidth }
      };
    },
  }
}

export const useHoverGhost = ({
  rowData,
  startLeft,
  scaleWidth,
  scale,
  enabled,
}: {
  rowData: TimelineRow,
  startLeft: number,
  scaleWidth: number,
  scale: number,
  enabled: boolean
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const middlewareOptions = useMemo(() => {
    return {
      actions: rowData?.actions.map(action => {
        return {
          id: action.id,
          left: parserTimeToPixel(action.start, { startLeft, scaleWidth, scale }),
          right: parserTimeToPixel(action.end, { startLeft, scaleWidth, scale })
        }
      }).sort((a, b) => a.left - b.left),
      startLeft,
      floatingWidth: scaleWidth * 2
    };
  }, [rowData, startLeft, scaleWidth, scale]);

  const { refs, floatingStyles, context, middlewareData } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: "right",
    middleware: [hideOutside(middlewareOptions)]
  });

  const hover = useHover(context, {
    enabled
  });
  const clientPoint = useClientPoint(context, {
    axis: "x",
    enabled
  });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    clientPoint,
  ]);

  return {
    refs,
    isOpen: enabled && isOpen,
    floatingStyles,
    middlewareData,
    getReferenceProps,
    getFloatingProps,
  }
}
