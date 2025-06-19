declare module 'react-chrono' {
  import { ReactNode } from 'react';
  
  export interface TimelineItemModel {
    title?: string;
    cardTitle?: string;
    cardSubtitle?: string;
    cardDetailedText?: string | string[];
    media?: any;
    timelineContent?: ReactNode;
    [key: string]: any;
  }

  export interface TimelineProps {
    items: TimelineItemModel[];
    mode?: 'HORIZONTAL' | 'VERTICAL' | 'VERTICAL_ALTERNATING';
    [key: string]: any;
  }

  export function Chrono(props: TimelineProps): JSX.Element;
}