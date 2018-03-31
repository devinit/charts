export interface Labeling {
    prefix?: string;
    showLabels?: boolean;
    showValues?: boolean;
    custom?: boolean;
    suffix?: string;
}

export interface Tooltip {
    enable: boolean;
    titleIndicator: string;
}

export type Listener = (item: string) => void;
