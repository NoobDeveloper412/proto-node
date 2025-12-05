<script>
	import { writable } from 'svelte/store';
	import {
		SvelteFlow,
		Background,
		Controls,
		MiniMap,
		BackgroundVariant,
		Panel
	} from '@xyflow/svelte';
	import { nanoid } from 'nanoid';

	import DialogueNode from '$lib/components/DialogueNode.svelte';
	import { gameState } from '$lib/store/gameStore.svelte.js';
	import { browser } from '$app/environment';
	import TypingLogic from '$lib/components/TypingLogic.svelte';

	const nodeTypes = {
		dialogue: DialogueNode
	};
	
	let nodes = $state.raw([]);
	let edges = $state.raw([]);

	let isFocusOnCanvas = $state(false);
	let inputBuffer = $state(''); 
	
	const STORAGE_KEY = 'proto-node-save-v1';

	function saveData() {
		if (!browser) return;
		const flowInstance = {
			nodes: nodes,
			edges: edges,
			gameData: gameState.exportData()
		};
		localStorage.setItem(STORAGE_KEY, JSON.stringify(flowInstance));
		alert('State Saved to LocalStorage!');
	}

	function loadData() {
		if (!browser) return;
		const jsonString = localStorage.getItem(STORAGE_KEY);
		if (!jsonString) return alert('No saved state found.');

		try {
			const parsed = JSON.parse(jsonString);
			gameState.importData(parsed.gameData);
			nodes = parsed.nodes || [];
			edges = parsed.edges || [];
		} catch (e) {
			alert('Failed to parse save file.');
		}
	}

	function exportFile() {
		const flowInstance = {
			nodes: nodes,
			edges: edges,
			gameData: gameState.exportData()
		};
		const blob = new Blob([JSON.stringify(flowInstance)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'prototype_save.json';
		a.click();
	}

	function importFile(e) {
		const file = e.target.files[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (event) => {
			const parsed = JSON.parse(event.target.result);
			gameState.importData(parsed.gameData);
			nodes = parsed.nodes;
			edges = parsed.edges;
		};
		reader.readAsText(file);
	}

	function handleKeyDown(e) {
		if (!isFocusOnCanvas) return;
		if (e.key.length > 1) return;

		inputBuffer += e.key;
	}

	function addNode() {
		const newNodeId = nanoid();
		gameState.createNodeData(newNodeId);
		const newNode = {
			id: newNodeId,
			type: 'dialogue',
			position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
			data: { label: 'New Node' },
			origin: [0.0, 0.0]
		};
		nodes = [...nodes, newNode];
	}
</script>

<div class="w-screen h-screen flex flex-col font-sans overflow-hidden">
	<!-- Toolbar -->
	<div class="h-12 bg-gray-800 text-white flex items-center px-4 gap-4 shadow-md z-50">
		<span class="font-bold text-yellow-400">PROTO-NODE</span>
		<button onclick={saveData} class="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm">Save State</button>
		<button onclick={loadData} class="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm">Load State</button>
		<div class="w-[1px] h-6 bg-gray-500 mx-2"></div>
		<button onclick={exportFile} class="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-sm">Export File</button>
		<label class="bg-green-600 hover:bg-green-500 px-3 py-1 rounded text-sm cursor-pointer">
			Import File
			<input type="file" onchange={importFile} class="hidden" accept=".json" />
		</label>
		<span class="ml-auto text-xs text-gray-400">Click Canvas + Type 3 chars to auto-spawn</span>
	</div>

	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		class="flex-1 w-full h-full bg-gray-50"
		role="application"
		onkeydown={handleKeyDown}
		tabindex="-1"
	>
		{#if browser}
			<SvelteFlow
				bind:nodes
				{edges}
				{nodeTypes}
				fitView
				onpaneclick={(e) => {
					isFocusOnCanvas = true;
					inputBuffer = '';
				}}
				onnodeclick={() => (isFocusOnCanvas = false)}
			>
				<Background bgColor="#15181E" variant={BackgroundVariant.Dots} />
				<Controls />
				<Panel position="bottom-left" class="!ml-14 mb-2">
					<button
						onclick={addNode}
						class="bg-teal-600 cursor-pointer hover:bg-teal-500 text-white font-bold py-2 px-4 rounded shadow-lg flex items-center gap-2 transition-all"
					>
						<span class="text-lg leading-none">+</span> Add Node
					</button>
				</Panel>
				<MiniMap bgColor="#15181E" />

				<TypingLogic bind:nodes bind:inputBuffer />
			</SvelteFlow>
		{/if}
	</div>
</div>