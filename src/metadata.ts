import type {
  GridProps,
  LayoutProps,
  PathProps,
  PhotoProps,
  SpanNode,
  TableCellProps,
  TableProps,
  TextProps,
} from "./core";

export interface SoneMetadataPosition {
  top: number;
  left: number;
  bottom: number;
  right: number;
}

export interface SoneMetadataSegment {
  tag?: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SoneMetadata {
  tag?: string;
  type: string;
  props:
    | LayoutProps
    | GridProps
    | PhotoProps
    | TextProps
    | PathProps
    | TableProps
    | TableCellProps;

  children: SoneMetadata[] | Array<string | SpanNode>;
  width: number;
  height: number;
  x: number;
  y: number;
  position: SoneMetadataPosition;
  margin: SoneMetadataPosition;
  padding: SoneMetadataPosition;
}
