import React, { useState, useRef, useEffect } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useSnippetsStore } from "@studio/store/snippets";
import { cn } from "@/utils";

export const TabComponent = () => {
	const {
		getSelectedEditors,
		addPair,
		removePair,
		selectedPairIndex,
		setSelectedPairIndex,
		editors,
		renameEditor
	} = useSnippetsStore();

	const [editingIndex, setEditingIndex] = useState(null);
	const [newName, setNewName] = useState('');
	const inputRef = useRef(null);

	useEffect(() => {
		if (inputRef.current) {
			inputRef.current.focus();
		}
	}, [editingIndex]);

	const handleRename = (index) => {
		setEditingIndex(index);
		setNewName(editors[index].name);
	};

	const handleBlur = (index) => {
		if (newName.trim() === '' || editors.some((editor, i) => editor.name === newName && i !== index)) {
			setNewName(editors[index].name);
		} else {
			renameEditor(index)(newName);
		}
		setEditingIndex(null);
	};

	const handleKeyPress = (e, index) => {
		if (e.key === 'Enter') {
			handleBlur(index);
		}
	};

	return (
		<Tabs.Root defaultValue="0" className="tabs">
			<Tabs.List className="tabs-list">
				{editors.map((editor, i) => (
					<div key={editor.name} className="tab-item">
						<Tabs.Trigger
							className={cn(selectedPairIndex === i && "tab-trigger")}
							onClick={() => setSelectedPairIndex(i)}
							onDoubleClick={() => handleRename(i)}
							value={String(i)}
							style={{ minWidth: '100px' }}
						>
							{editingIndex === i ? (
								<input
									ref={inputRef}
									type="text"
									value={newName}
									onChange={(e) => setNewName(e.target.value)}
									onBlur={() => handleBlur(i)}
									onKeyPress={(e) => handleKeyPress(e, i)}
									autoFocus
								/>
							) : (
								editor.name
							)}
						</Tabs.Trigger>
						<DropdownMenu.Root>
							<DropdownMenu.Trigger asChild>
								<button className="dots-button">⋮</button>
							</DropdownMenu.Trigger>
							<DropdownMenu.Content className="dropdown-menu-content">
								<DropdownMenu.Item className="dropdown-menu-item" onClick={() => handleRename(i)}>Rename</DropdownMenu.Item>
								<DropdownMenu.Item className="dropdown-menu-item" onClick={() => removePair(i)}>Remove Snippets</DropdownMenu.Item>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					</div>
				))}
				<button className="add-tab-button" onClick={addPair}>+</button>
			</Tabs.List>
		</Tabs.Root>
	);
};
