declare enum AudioNotificationType {
    Annotation = "Annotation"
}
interface AudioEngine {
    masterGain: number;
    playDataPoint(frequency: number, panning: number, duration: number): void;
    playNotification?(notificationType: AudioNotificationType, panning?: number, duration?: number): void;
}

interface DataPoint {
    x: number;
    label?: string;
    custom?: unknown;
    children?: string;
    type?: "annotation";
}
interface SimpleDataPoint extends DataPoint {
    y: number;
}
interface AlternateAxisDataPoint extends DataPoint {
    y2: number;
}
interface HighLowDataPoint extends DataPoint {
    high: number;
    low: number;
}
interface OHLCDataPoint extends HighLowDataPoint {
    open: number;
    close: number;
}
interface BoxDataPoint extends HighLowDataPoint {
    q1: number;
    q3: number;
    median: number;
    outlier?: number[];
}
type SupportedDataPointType = SimpleDataPoint | AlternateAxisDataPoint | HighLowDataPoint | OHLCDataPoint | BoxDataPoint;

type translateEvaluators = Record<string, string | number | boolean>;

type ExpandedKeyRegistration = {
    key: {
        key: string;
        shiftKey?: boolean;
        ctrlKey?: boolean;
        altKey?: boolean;
        metaKey?: boolean;
    };
} & {
    callback: (point: c2mCallbackType) => void;
    title?: string;
    keyDescription?: string;
    description?: string;
    force?: boolean;
};
type SupportedInputType = SupportedDataPointType | number;
type ChartContainerType = HTMLElement | SVGElement;
type AxisScale = "linear" | "log10";
type SonifyTypes = {
    type: SUPPORTED_CHART_TYPES | SUPPORTED_CHART_TYPES[];
    data: dataSet | SupportedInputType[];
    element: ChartContainerType;
    lang?: string;
    axes?: {
        x?: AxisData;
        y?: AxisData;
        y2?: AxisData;
    };
    title?: string;
    cc?: HTMLElement;
    audioEngine?: AudioEngine;
    options?: c2mOptions;
    info?: c2mInfo;
};
type dataSet = {
    [groupName: string]: SupportedInputType[] | null;
};
type AxisData = {
    minimum?: number;
    maximum?: number;
    label?: string;
    format?: (value: number) => string;
    type?: AxisScale;
    valueLabels?: string[];
    continuous?: boolean;
};
type SUPPORTED_CHART_TYPES = "band" | "bar" | "box" | "candlestick" | "histogram" | "line" | "matrix" | "pie" | "scatter" | "treemap" | "unsupported";
type StatBundle = {
    open?: number;
    high?: number;
    low?: number;
    close?: number;
    q1?: number;
    q3?: number;
    median?: number;
    outlier?: number[];
};
type c2mCallbackType = {
    slice: string;
    index: number;
    point: SupportedDataPointType;
};
type translationCallbackOptions = {
    language: string;
    id: string;
    evaluators: translateEvaluators;
};
type c2mOptions = {
    enableSound?: boolean;
    enableSpeech?: boolean;
    onFocusCallback?: (point: c2mCallbackType) => void;
    onSelectCallback?: (point: c2mCallbackType) => void;
    live?: boolean;
    maxWidth?: number;
    customHotkeys?: ExpandedKeyRegistration[];
    hertzes?: number[];
    stack?: boolean;
    root?: null | string;
    announcePointLabelFirst?: boolean;
    playOnCategoryChange?: boolean;
    translationCallback?: ({ language, id, evaluators }: translationCallbackOptions) => string | false;
    modifyHelpDialogText?: (lang: string, text: string) => string;
    modifyHelpDialogKeyboardListing?: (lang: string, headers: string[], shortcuts: string[][]) => string[][];
};
type c2mInfoMarker = {
    x: number;
    label: string;
};
type c2mInfo = {
    notes?: string[];
    annotations?: c2mInfoMarker[];
};
type c2mGolangReturn = {
    err: null | string;
    data?: c2m;
};

declare global {
    interface Window {
        __chart2music_options__?: {
            _hertzClamps?: {
                lower: number;
                upper: number;
            };
        };
    }
}
declare const c2mChart: (input: SonifyTypes) => c2mGolangReturn;
declare class c2m {
    private _chartElement;
    private _ccElement;
    private _chartSummary;
    private _instructions;
    private _groups;
    private _visible_group_indices;
    private _data;
    private _visibleGroupIndex;
    private _pointIndex;
    private _sr;
    private _xAxis;
    private _yAxis;
    private _y2Axis;
    private _title;
    private _playListInterval;
    private _playListContinuous;
    private _speedRateIndex;
    private _flagNewLevel;
    private _flagNewStat;
    private _keyEventManager;
    private _audioEngine;
    private _metadataByGroup;
    private _options;
    private _providedAudioEngine?;
    private _monitorMode;
    private _type;
    private _explicitAxes;
    private _hertzClamps;
    private _availableActions;
    private _silent;
    private _outlierIndex;
    private _outlierMode;
    private _announcePointLabelFirst;
    private _info;
    private _hierarchy;
    private _hierarchyRoot;
    private _hierarchyBreadcrumbs;
    private _language;
    private _cleanUpTasks;
    private _translator;
    constructor(input: SonifyTypes);
    static get languages(): string[];
    get _groupIndex(): number;
    cleanUp(): void;
    private get _currentGroupType();
    private get _currentDataRow();
    private get _movementAvailable();
    get currentPoint(): SupportedDataPointType;
    private get _currentGroupName();
    private _clearPlay;
    private _initializeActionMap;
    private _cleanupAfterCategoryChange;
    private _generateSummary;
    private _createFrequencyTable;
    private _buildStackBar;
    private _buildStackScatter;
    private _setData;
    setData(data: SonifyTypes["data"], axes?: SonifyTypes["axes"], pointIndex?: number, groupName?: string): void;
    setCategoryVisibility(name: string, state: boolean): string;
    getCurrent(): {
        index: number;
        group: string;
        point: SupportedDataPointType;
        stat: "" | keyof StatBundle;
    };
    private _shrinkToMaxWidth;
    appendData(dataPoint: SupportedDataPointType | number, group?: string): {
        err: string | null;
        data?: SupportedDataPointType;
    };
    private _initializeKeyActionMap;
    private _setHertzClamps;
    private _initializeData;
    private generateGroupSummary;
    private _startListening;
    private _announceCategoryChange;
    private _playAndSpeak;
    private _moveNextOutlier;
    private _movePrevOutlier;
    private _moveRight;
    private _moveLeft;
    private _moveToMinimum;
    private _moveToMaximum;
    private _moveLeftTenths;
    private _moveRightTenths;
    private _checkOutlierMode;
    private _movePrevStat;
    private _moveNextStat;
    private _playLeftOutlier;
    private _playLeft;
    private _playRightOutlier;
    private _playRightContinuous;
    private _playLeftContinuous;
    private _playRight;
    private _updateToNewLevel;
    private _drillDown;
    private _drillUp;
    private _drillToRoot;
    private _getHertzRange;
    private _playCurrent;
    private _checkAudioEngine;
    private _playDataPoint;
    private _onFocus;
    private _speakCurrent;
}

export { type SonifyTypes as C2MChartConfig, c2m, c2mChart, c2mChart as default };
