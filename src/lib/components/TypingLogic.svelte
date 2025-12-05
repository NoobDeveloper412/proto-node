<script>
	import { useSvelteFlow } from '@xyflow/svelte';
	import { nanoid } from 'nanoid';
	import { gameState } from '$lib/store/gameStore.svelte.js';

	let { nodes = $bindable(), inputBuffer = $bindable() } = $props();

	const { screenToFlowPosition } = useSvelteFlow();

	let lastMouseX = 0;
	let lastMouseY = 0;

	function handleMouseMove(e) {
		lastMouseX = e.clientX;
		lastMouseY = e.clientY;
	}

	$effect(() => {
		window.addEventListener('mousemove', handleMouseMove);
		return () => window.removeEventListener('mousemove', handleMouseMove);
	});

	$effect(() => {
		if (inputBuffer.length >= 3) {
			spawnNode(inputBuffer);
			inputBuffer = ''; 
		}
	});

	function spawnNode(text) {
		const newNodeId = nanoid();

		gameState.createNodeData(newNodeId);
		const relations = gameState.nodeLineRelations[newNodeId];
		const firstLineId = relations[0];

		gameState.updateLine(firstLineId, text);

		const position = screenToFlowPosition({ x: lastMouseX, y: lastMouseY });

		const newNode = {
			id: newNodeId,
			type: 'dialogue',
			position: { x: position.x - 200, y: position.y - 50 },
			data: { label: 'New Node' }
		};

		nodes = [...nodes, newNode];

		setTimeout(() => {
			const textarea = document.querySelector(`textarea[data-id="${firstLineId}"]`);

			if (textarea) {
				textarea.focus();
				const len = textarea.value.length;
				textarea.setSelectionRange(len, len);
			}
		}, 50); 
	}
</script>
