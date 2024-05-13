import React, { FC, useMemo, useState } from 'react';
import { TimelineRow } from '../../interface/action';
import { CommonProp } from '../../interface/common_prop';
import { prefix } from '../../utils/deal_class_prefix';
import { parserPixelToTime, parserTimeToPixel } from '../../utils/deal_data';
import { DragLineData } from './drag_lines';
import { EditAction } from './edit_action';
import './edit_row.less';

import {
  useFloating,
  useHover,
  useInteractions,
  useClientPoint,
} from "@floating-ui/react";

export type EditRowProps = CommonProp & {
  areaRef: React.MutableRefObject<HTMLDivElement>;
  rowData?: TimelineRow;
  isLastRow: boolean;
  rowIndex: number;
  style?: React.CSSProperties;
  dragLineData: DragLineData;
  setEditorData: (params: TimelineRow[]) => void;
  /** 距离左侧滚动距离 */
  scrollLeft: number;
  /** 设置scroll left */
  deltaScrollLeft: (scrollLeft: number) => void;
};

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

export const EditRow: FC<EditRowProps> = (props) => {
  const {
    rowData,
    style = {},
    onClickRow,
    onDoubleClickRow,
    onContextMenuRow,
    areaRef,
    scrollLeft,
    startLeft,
    scale,
    scaleWidth,
    isLastRow,
    rowIndex
  } = props;

  const classNames = ['edit-row'];
  if (rowData?.selected) classNames.push('edit-row-selected');

  const handleTime = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!areaRef.current) return;
    const rect = areaRef.current.getBoundingClientRect();
    const position = e.clientX - rect.x;
    const left = position + scrollLeft;
    const time = parserPixelToTime(left, { startLeft, scale, scaleWidth });
    return time;
  };

  const isFirstRow = rowIndex === 0;
  const shouldShowAdd = !(isFirstRow || isLastRow);

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
    enabled: shouldShowAdd
  });
  const clientPoint = useClientPoint(context, {
    axis: "x",
    enabled: shouldShowAdd
  });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    clientPoint,
  ]);

  return (
    <div
      ref={refs.setReference}
      {...getReferenceProps()}
      className={`${prefix(...classNames)} ${(rowData?.classNames || []).join(
        ' ',
      )}`}
      style={style}
      onClick={(e) => {
        if (rowData && onClickRow) {
          const time = handleTime(e);
          onClickRow(e, { row: rowData, time: time });
        }
      }}
      onDoubleClick={(e) => {
        if (rowData && onDoubleClickRow) {
          const time = handleTime(e);
          onDoubleClickRow(e, { row: rowData, time: time });
        }
      }}
      onContextMenu={(e) => {
        if (rowData && onContextMenuRow) {
          const time = handleTime(e);
          onContextMenuRow(e, { row: rowData, time: time });
        }
      }}
    >
      {(rowData?.actions || []).map((action) => (
        <EditAction
          key={action.id}
          {...props}
          handleTime={handleTime}
          row={rowData}
          action={action}
        />
      ))}
      {shouldShowAdd && isOpen && (
        <div
          ref={refs.setFloating}
          style={{
            ...floatingStyles,
            width: middlewareData.hideOutside?.width || scaleWidth * 2,
            visibility: middlewareData.hideOutside?.isOutside ? "hidden" : "visible",
          }}
          {...getFloatingProps()}
          className="h-full bg-blue-500 flex justify-center items-center text-white rounded text-center pointer-events-none"
        >
          +
        </div>
      )}
    </div>
  );
};
