<script>
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import '@xyflow/svelte/dist/style.css';
	// import { ModeWatcher } from "mode-watcher";

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<!-- <ModeWatcher /> -->
{@render children()}
