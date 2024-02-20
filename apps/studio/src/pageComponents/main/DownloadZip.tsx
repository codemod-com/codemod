import { useAuth, useSession } from '@clerk/nextjs';
import { Export } from '@phosphor-icons/react';
import { Check, Copy, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import sendMessage from '~/api/sendMessage';
import Tooltip from '~/components/Tooltip/Tooltip';
import { Button } from '~/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '~/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { cn } from '~/lib/utils';
import { generateCodemodHumanNamePrompt } from '~/store/slices/CFS/prompts';
import { selectMod } from '~/store/slices/mod';
import { selectEngine, selectSnippets } from '~/store/slices/snippets';
import { downloadProject } from '~/utils/download';

export const DownloadZip = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [isDownloading, setIsDownloading] = useState(false);

	const modContext = useSelector(selectMod);
	const snippetsContext = useSelector(selectSnippets);
	const engine = useSelector(selectEngine);

	const { session } = useSession();
	const { getToken } = useAuth();

	const handleClick = async () => {
		setIsDownloading(true);
		if (!modContext.internalContent) {
			return;
		}

		const token = await getToken();

		const humanCodemodName =
			token !== null
				? await getHumanCodemodName(modContext.internalContent, token)
				: null;

		await downloadProject({
			name: humanCodemodName?.name ?? 'codemod',
			framework: humanCodemodName?.framework,
			version: humanCodemodName?.version,
			modBody: modContext.internalContent,
			before: snippetsContext.inputSnippet,
			after: snippetsContext.outputSnippet,
			engine,
			user: session?.user,
		});

		setIsDownloading(false);
		setIsOpen(true);
	};

	if (engine === 'tsmorph') {
		return null;
	}

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Tooltip
					trigger={
						<Button
							disabled={
								!modContext.internalContent || isDownloading
							}
							onClick={handleClick}
							id="download-zip-button"
							size="sm"
							variant="outline"
						>
							{isDownloading ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : (
								<Export className="mr-2 h-4 w-4" />
							)}
							Export locally
						</Button>
					}
					content={
						<p className="font-normal">
							Download a ZIP archive to use this codemod locally
						</p>
					}
				/>
			</DialogTrigger>

			<DialogContent className="max-w-2xl">
				<p>
					Unzip the codemod package into your preferred folder, copy
					its path, update the command below with the copied path, and
					run it.
				</p>

				<Tabs defaultValue="npm">
					<TabsList>
						<TabsTrigger value="npm">npm</TabsTrigger>
						<TabsTrigger value="pnpm">pnpm</TabsTrigger>
					</TabsList>

					<TabsContent value="npm">
						<InstructionsContent pm="npm" />
					</TabsContent>
					<TabsContent value="pnpm">
						<InstructionsContent pm="pnpm" />
					</TabsContent>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
};

function InstructionsContent({ pm }: { pm: 'pnpm' | 'npm' }) {
	const npxDialect = useMemo(() => {
		if (pm === 'pnpm') {
			return 'pnpm dlx';
		}

		return 'npx';
	}, [pm]);

	return (
		<div className="space-y-1">
			<CopyTerminalCommands
				text={`${npxDialect} codemod --dry <codemod_path>`}
			/>
		</div>
	);
}

export function CopyTerminalCommands({ text }: { text: string }) {
	const { isCopied, copy } = useCopyToClipboard({ timeout: 2000 });

	return (
		<div className="flex items-center justify-between rounded-md bg-secondary p-2 text-secondary-foreground">
			<code>{text}</code>

			<Button
				size="unstyled"
				variant="unstyled"
				className="space-x-2"
				onClick={() => copy(text)}
			>
				{isCopied ? (
					<Check className="h-4 w-4 text-green-600" />
				) : (
					<Copy
						className={cn(
							'h-4 w-4 cursor-pointer transition-colors hover:text-primary-light',
							isCopied && 'text-primary-light',
						)}
					/>
				)}
			</Button>
		</div>
	);
}

async function getHumanCodemodName(
	codemod: string,
	token: string,
): Promise<{
	name: string;
	framework?: string;
	version?: string;
}> {
	try {
		if (!codemod) {
			throw new Error('codemod content not found');
		}

		let codemodName = '';
		if (token !== null) {
			// Ask LLM to come up with a name for the given codemod
			const codemodNameOrError = await sendMessage({
				message: generateCodemodHumanNamePrompt(codemod),
				token,
			});

			if (codemodNameOrError.isLeft()) {
				console.error(codemodNameOrError.getLeft());
			} else {
				codemodName = codemodNameOrError.get().text;
			}
		}

		const splitResult = codemodName.split('/');

		if (splitResult.length === 1) {
			return {
				name: splitResult[0]!,
			};
		}

		if (splitResult.length === 3) {
			return {
				framework: splitResult[0]!,
				version: splitResult[1]!,
				name: splitResult[2]!,
			};
		}

		return {
			name: '',
		};
	} catch (error) {
		console.error(error);

		return {
			name: '',
		};
	}
}
