export interface Labeling {
    prefix: string;
    showValues?: boolean;
    suffix: string;
}

export interface ITooltip {
    enable: boolean;
    titleIndicator: string;
}

export type Listener = (item: string) => void;
