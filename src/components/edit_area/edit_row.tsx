import React, { FC, useState } from 'react';
import { TimelineRow } from '../../interface/action';
import { CommonProp } from '../../interface/common_prop';
import { prefix } from '../../utils/deal_class_prefix';
import { parserPixelToTime, parserTimeToPixel } from '../../utils/deal_data';
import { DragLineData } from './drag_lines';
import { EditAction } from './edit_action';
import './edit_row.less';

import { HoverGhost } from './hover_ghost';
import { useHoverGhost } from './hooks/use_hover_ghost';

export type EditRowProps = CommonProp & {
  areaRef: React.MutableRefObject<HTMLDivElement>;
  rowData?: TimelineRow;
  isLastRow: boolean;
  isCursorDragging: boolean;
  rowIndex: number;
  style?: React.CSSProperties;
  dragLineData: DragLineData;
  setEditorData: (params: TimelineRow[]) => void;
  /** 距离左侧滚动距离 */
  scrollLeft: number;
  /** 设置scroll left */
  deltaScrollLeft: (scrollLeft: number) => void;
};

export const EditRow: FC<EditRowProps> = (props) => {
  const {
    rowData,
    style = {},
    onClickRow,
    onDoubleClickRow,
    onGhostClick,
    onContextMenuRow,
    onMouseMoveRow,
    areaRef,
    scrollLeft,
    startLeft,
    scale,
    scaleWidth,
    isLastRow,
    isCursorDragging,
    rowIndex,
    getGhostRender,
    getGhostCursorRender,
    maxGhostRight,
    isGhostEnabled,
  } = props;

  const [isDraggingAction, setIsDraggingAction] = useState(false);
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
  const shouldShowHoverGhost = !(isFirstRow || isLastRow || isDraggingAction || isCursorDragging);

  const {
    x,
    getFloatingProps,
    getReferenceProps,
    isVisible: isGhostVisible,
    middlewareData,
    floatingStyles,
    refs,
  } = useHoverGhost({
    rowData,
    startLeft,
    scaleWidth,
    scale,
    enabled: shouldShowHoverGhost && isGhostEnabled,
    maxGhostRight,
  });

  return (
    <>
      <div
        ref={refs.setReference}
        {...getReferenceProps({
          onClick: (e) => {
            if (!rowData) return;
            if (onGhostClick && isGhostVisible && !middlewareData.hideOutside?.isOutside) {
              const start = handleTime(e);
              const end = parserPixelToTime(x + middlewareData.hideOutside?.width, { startLeft, scale, scaleWidth });

              onGhostClick(e, { row: rowData, start, end });
            }

            if (onClickRow) {
              const time = handleTime(e);
              onClickRow(e, { row: rowData, time });
            }
          },
          onDoubleClick: (e) => {
            if (rowData && onDoubleClickRow) {
              const time = handleTime(e);
              onDoubleClickRow(e, { row: rowData, time: time });
            }
          },
          onContextMenu: (e) => {
            if (rowData && onContextMenuRow) {
              const time = handleTime(e);
              onContextMenuRow(e, { row: rowData, time: time });
            }
          },
          onMouseMove: (e) => {
            if (rowData && onMouseMoveRow) {
              const time = handleTime(e);
              onMouseMoveRow(e, { row: rowData, time: time });
            }
          },
        } as React.HTMLProps<HTMLDivElement>)}
        className={`${prefix(...classNames)} ${(rowData?.classNames || []).join(' ')}`}
        style={style}
      >
        {(rowData?.actions || []).map((action) => (
          <EditAction
            key={action.id}
            {...props}
            handleTime={handleTime}
            row={rowData}
            action={action}
            onActionDragStart={() => setIsDraggingAction(true)}
            onActionDragEnd={() => setIsDraggingAction(false)}
          />
        ))}
        {isGhostVisible && (
          <HoverGhost
            ref={refs.setFloating}
            styles={{
              ...floatingStyles,
              width: middlewareData.hideOutside?.width || scaleWidth * 2,
              visibility: middlewareData.hideOutside?.isOutside ? 'hidden' : 'visible',
            }}
            row={rowData}
            getGhostRender={getGhostRender}
            {...getFloatingProps()}
          />
        )}
      </div>
      {isGhostVisible &&
        (getGhostCursorRender ? (
          getGhostCursorRender({ x })
        ) : (
          <div
            style={{
              width: 1,
              height: '100%',
              position: 'absolute',
              left: x,
              backgroundColor: 'black',
              pointerEvents: 'none',
            }}
          />
        ))}
    </>
  );
};
