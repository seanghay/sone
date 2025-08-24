import type {
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

export interface SoneMetadata {
  tag?: string;
  type: string;
  props:
    | LayoutProps
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
