import { cx } from "cva";

export default function GradientBlob({
	style = "ellipse",
}: {
	style: "ellipse" | "planet";
}) {
	return (
		<div
			className={cx("pointer-events-none absolute ", {
				"gradient-planet lg:-right[10%] -right-[41%] -top-[20%] -z-10 h-[390px] w-[390px] shrink-0 rotate-[151.909deg]  rounded-[390.038px] opacity-30 blur-[30px]  sm:-right-[20%] sm:h-[550px] sm:w-[620px] lg:-top-[40%] lg:h-[662px] lg:w-[662px] lg:blur-[90px] dark:opacity-10":
					style === "planet",
				"gradient-ellipse right-[80%] top-[46%] z-10  h-[481px] w-[402px] shrink-0 rotate-90 rounded-[481px] opacity-40  blur-[45px] lg:top-[34%] lg:h-[856px] lg:w-[716px] lg:blur-[160px] dark:opacity-15":
					style === "ellipse",
			})}
		/>
	);
}
