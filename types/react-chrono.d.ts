// types/react-chrono.d.ts

declare module 'react-chrono' {
    import { ReactNode, RefObject } from 'react';
  
    export interface TimelineItemMedia {
      source: {
        url: string;
      };
      type: 'IMAGE' | 'VIDEO';
    }
  
    export interface TimelineItem {
      title?: string;
      cardTitle?: string;
      cardSubtitle?: string;
      cardDetailedText?: string;
      url?: string;
      media?: TimelineItemMedia;
      timelineContent?: ReactNode;
    }
  
    export interface ChronoTheme {
      primary?: string;
      secondary?: string;
      cardBgColor?: string;
      cardForeColor?: string;
      titleColor?: string;
      titleColorActive?: string;
    }
  
    export interface ChronoButtonTexts {
      first?: string;
      last?: string;
      next?: string;
      previous?: string;
    }
  
    export interface ChronoFontSizes {
      cardTitle?: string;
      cardSubtitle?: string;
      cardText?: string;
      title?: string;
    }
  
    export interface ChronoProps {
      items: TimelineItem[];
      mode?: 
        | 'HORIZONTAL' 
        | 'VERTICAL' 
        | 'VERTICAL_ALTERNATING'
        | 'TREE';
      theme?: ChronoTheme;
      buttonTexts?: ChronoButtonTexts;
      fontSizes?: ChronoFontSizes;
      cardHeight?: number;
      cardWidth?: number;
      enableOutline?: boolean;
      disableNavOnKey?: boolean;
      slideShow?: boolean;
      slideItemDuration?: number;
      itemWidth?: number;
      scrollable?: boolean | { scrollbar: boolean };
      flipLayout?: boolean;
      allowDynamicUpdate?: boolean;
      classNames?: {
        card?: string;
        cardMedia?: string;
        cardSubTitle?: string;
        cardText?: string;
        cardTitle?: string;
        controls?: string;
        title?: string;
      };
      onScrollEnd?: () => void;
      onItemSelect?: (selected: { 
        cardTitle?: string; 
        cardSubtitle?: string; 
        title?: string;
      }) => void;
      activeItemIndex?: number;
      focusActiveItemOnLoad?: boolean;
      hideControls?: boolean;
      borderLessCards?: boolean;
      cardPositionHorizontal?: 'TOP' | 'BOTTOM';
      timelinePointDimension?: number;
      lineWidth?: number;
      timelinePointShape?: 'circle' | 'square' | 'diamond';
      useReadMore?: boolean;
      readMore?: boolean;
      parseDetailsAsHTML?: boolean;
    }
  
    export interface ChronoRef {
      scrollTo: (index: number) => void;
      scrollToFirst: () => void;
      scrollToLast: () => void;
    }
  
    export const Chrono: React.ForwardRefExoticComponent<
      ChronoProps & React.RefAttributes<ChronoRef>
    >;
  }