declare module 'react-plotly.js' {
    import * as Plotly from 'plotly.js';
    import { PureComponent } from 'react';

    export interface PlotParams {
        data: Plotly.Data[];
        layout?: Partial<Plotly.Layout>;
        frames?: Plotly.Frame[];
        config?: Partial<Plotly.Config>;
        onInitialized?: (figure: Plotly.Figure, graphDiv: HTMLElement) => void;
        onPurge?: (graphDiv: HTMLElement) => void;
        onUpdate?: (figure: Plotly.Figure, graphDiv: HTMLElement) => void;
        onAfterPlot?: (graphDiv: HTMLElement) => void;
        [key: string]: any;
    }

    class Plot extends PureComponent<PlotParams, any> {}
    export default Plot;
}