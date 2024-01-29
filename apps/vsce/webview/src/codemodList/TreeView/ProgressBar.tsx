import { Line } from 'rc-progress';

const ProgressBar = (
	props: Readonly<{
		percent: number;
	}>,
) => (
	<div className="mb-2 flex" style={{ height: '4.5px', width: '100%' }}>
		<Line
			percent={props.percent}
			strokeWidth={1.5}
			className="w-full"
			strokeLinecap="round"
			trailColor="var(--scrollbar-slider-background)"
			strokeColor="var(--vscode-progressBar-background)"
		/>
	</div>
);

export default ProgressBar;
