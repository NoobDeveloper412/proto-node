<script>
	import { Handle, Position, NodeResizer, NodeResizeControl } from '@xyflow/svelte';
	import { gameState } from '$lib/store/gameStore.svelte.js';
	import ResizeHandler from './ResizeHandler.svelte';

	let { id, selected } = $props();

	let nodeData = $derived(gameState.nodes[id]);
	let lineIds = $derived(gameState.nodeLineRelations[id] || []);

	function autoResize(node) {
		const resize = () => {
			node.style.height = 'auto';
			node.style.height = node.scrollHeight + 'px';
		};
		node.addEventListener('input', resize);
		resize();
		return {
			destroy() {
				node.removeEventListener('input', resize);
			}
		};
	}

	function handleLineInput(e, lineId, index) {
		const text = e.target.value;
		gameState.updateLine(lineId, text);

		if (index === lineIds.length - 1 && text.trim().length > 0) {
			gameState.addLine(id);
		}
	}

	function handleBlur() {
		setTimeout(() => {
			gameState.cleanupLines(id);
		}, 100);
	}

	function stopWheel(e) {
		e.stopPropagation();
	}
</script>

<div
	class="bg-slate-800 rounded-xl relative z-10 border overflow-hidden shadow-2xl flex flex-col text-slate-100 group
	{selected ? 'border-blue-500 ring-[.5px] ring-blue-200' : 'border-slate-700'}"
	style="min-width: 400px; width: 100%; min-height: 200px; height: 100%; transition: border-color 0.1s;"
>
	<NodeResizeControl minWidth={100} minHeight={5} style="background: transparent;">
		<ResizeHandler />
	</NodeResizeControl>

	<div class="flex gap-4 p-4 border-b border-slate-700/50">
		<div
			class="shrink-0 w-24 h-24 rounded-lg bg-slate-900 border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500 select-none"
		>
			<span class="text-xs">{nodeData?.avatar || 'Avatar'}</span>
		</div>

		<div class="flex flex-col gap-2 flex-1 justify-center">
		
			<textarea
				class="nodrag w-full bg-slate-700/50 rounded-md px-3 py-1.5 text-sm text-teal-100 placeholder-slate-500 focus:bg-slate-700 focus:ring-1 focus:ring-teal-500 transition-all outline-none resize-none overflow-y-auto break-words h-[52px]"
				placeholder="General text field..."
				value={nodeData?.gen1 || ''}
				onwheel={stopWheel}
				oninput={(e) => gameState.updateNodeField(id, 'gen1', e.target.value)}
			></textarea>

			<textarea
				class="nodrag w-full bg-slate-700/50 rounded-md px-3 py-1.5 text-sm text-teal-100 placeholder-slate-500 focus:bg-slate-700 focus:ring-1 focus:ring-teal-500 transition-all outline-none resize-none overflow-y-auto break-words h-[52px]"
				placeholder="General text field..."
				value={nodeData?.gen2 || ''}
				onwheel={stopWheel}
				oninput={(e) => gameState.updateNodeField(id, 'gen2', e.target.value)}
			></textarea>

			<div class="flex gap-2 mt-1">
				<input
					type="text"
					class="nodrag flex-1 w-full bg-teal-900/40 rounded-md px-3 py-1 text-sm text-teal-300 font-semibold placeholder-teal-700 focus:bg-teal-900/60 focus:ring-1 focus:ring-teal-500 outline-none"
					placeholder="Actor"
					value={nodeData?.actor || ''}
					oninput={(e) => gameState.updateNodeField(id, 'actor', e.target.value)}
				/>
				<input
					type="text"
					class="nodrag flex-1 w-full bg-teal-900/40 rounded-md px-3 py-1 text-sm text-teal-300 font-semibold placeholder-teal-700 focus:bg-teal-900/60 focus:ring-1 focus:ring-teal-500 outline-none"
					placeholder="Location"
					value={nodeData?.location || ''}
					oninput={(e) => gameState.updateNodeField(id, 'location', e.target.value)}
				/>
			</div>
		</div>
	</div>

	<div
		class="p-4 flex flex-col gap-3 flex-1 overflow-y-auto nodrag nowheel custom-scrollbar"
		onwheel={stopWheel}
	>
		{#each lineIds as lineId, index (lineId)}
			{@const lineData = gameState.lines[lineId]}

			<div class="relative group">
				<Handle
					type="target"
					position={Position.Left}
					id={`target-${lineId}`}
					class="!w-5 !h-5 !bg-teal-400"
				/>

				<textarea
					use:autoResize
					rows="1"
					data-id={lineId}
					class="nodrag w-full bg-slate-700 rounded-lg px-4 py-2 text-sm text-slate-200 outline-none border border-transparent focus:border-teal-500/50 focus:bg-slate-700 transition-all placeholder-slate-500 resize-none overflow-hidden block break-words whitespace-pre-wrap"
					placeholder="Dialogue here..."
					value={lineData?.text || ''}
					oninput={(e) => handleLineInput(e, lineId, index)}
					onblur={handleBlur}
				></textarea>

				<Handle
					type="source"
					position={Position.Right}
					id={`source-${lineId}`}
					class="!w-5 !h-5 !bg-teal-400 border-none"
				/>
			</div>
		{/each}
	</div>
</div>

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 6px;
	}

	.custom-scrollbar::-webkit-scrollbar-track {
		background: #1e293b;
		border-radius: 4px;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background-color: #14b8a6;
		border-radius: 4px;
		border: 1px solid #0f766e;
	}

	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background-color: #2dd4bf;
	}
</style>
