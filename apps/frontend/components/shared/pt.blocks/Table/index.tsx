import type { TableBlock as TableBlockType } from "@/types/object.types";
import { clsx } from "clsx";

export default function TableBlock(props: TableBlockType) {
	return (
		<div className="mt-10">
			<Table {...props} />
		</div>
	);
}

function Table(props: TableBlockType) {
	const { table } = props;

	return (
		<>
			<div className="relative w-full">
				<div className=" no-scrollbar max-w-fit overflow-x-scroll">
					<table className="table table-fixed border-separate border-spacing-0 overflow-hidden rounded-[4px] border border-border-light/10 bg-white dark:border-border-dark/20  dark:bg-background-dark">
						{table && (
							<>
								<thead className="lg:relative">
									<tr className="relative">
										{table.rows[0]?.cells?.map((headingColumn, i) => (
											<th
												colSpan={1}
												className={clsx(
													table.rows.length > 3
														? "min-w-[150px] max-w-[200px]"
														: "",
													"align-bottom",
													"copy-m border  bg-border-light/10 p-0 dark:bg-background-dark dark:bg-border-dark/10 ",
													"border-r-0 border-t-0 border-l-border-light/10 dark:border-border-dark/10",
													{
														"border-l-0": i === 0,
													},
												)}
												key={headingColumn}
											>
												<div
													className={clsx(
														"flex flex-col justify-center rounded-[4px] px-4 py-2 text-left",
													)}
												>
													<span className="">{headingColumn}</span>
												</div>
											</th>
										))}
									</tr>
								</thead>
							</>
						)}
						<tbody>
							{table?.rows?.slice(1)?.map((row, rowIdx, arr) => {
								return (
									<tr className={clsx("relative z-0", {})} key={row._key}>
										{row?.cells?.map((cell, colIdx) => {
											return (
												<td
													key={colIdx}
													rowSpan={1}
													colSpan={1}
													className={clsx(
														"border border-r-0 border-t-0 dark:border-border-dark/20",
														rowIdx < arr.length - 1 ? "" : "border-b-0",
														{
															"border-l-0": colIdx === 0,
														},
													)}
												>
													<div
														className={clsx(
															"flex flex-col justify-center gap-2 rounded-[4px] px-4 py-2",
														)}
													>
														{cell}
													</div>
												</td>
											);
										})}
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</div>
		</>
	);
}

export { Table };
