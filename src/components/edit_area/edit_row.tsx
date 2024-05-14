import React, { FC } from 'react';
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
    onContextMenuRow,
    areaRef,
    scrollLeft,
    startLeft,
    scale,
    scaleWidth,
    isLastRow,
    rowIndex,
    getGhostRender,
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
  const shouldShowHoverGhost = !(isFirstRow || isLastRow);

  const {
    getFloatingProps,
    getReferenceProps,
    isOpen,
    middlewareData,
    floatingStyles,
    refs
  } = useHoverGhost({
    rowData,
    startLeft,
    scaleWidth,
    scale,
    enabled: shouldShowHoverGhost,
  });

  return (
    <div
      ref={refs.setReference}
      {...getReferenceProps()}
      className={`${prefix(...classNames)} ${(rowData?.classNames || []).join(' ')}`}
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
        <EditAction key={action.id} {...props} handleTime={handleTime} row={rowData} action={action} />
      ))}
      {isOpen && (
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
  );
};
