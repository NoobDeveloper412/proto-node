import { nanoid } from 'nanoid';

class GameStateManager {
	nodes = $state({});
	lines = $state({});
	nodeLineRelations = $state({});

	constructor() {}

	// --- CRUD ---

	createNodeData(id) {
		this.nodes[id] = {
			actor: '',
			location: '',
			avatar: 'Avatar',
			gen1: '',
			gen2: ''
		};

		const firstLineId = nanoid();
		this.lines[firstLineId] = { text: '', parentNodeId: id };
		this.nodeLineRelations[id] = [firstLineId];
	}

	updateNodeField(id, field, value) {
		if (this.nodes[id]) {
			this.nodes[id][field] = value;
		}
	}

	// --- Line Logic ---

	addLine(nodeId, text = '') {
		const newLineId = nanoid();
		this.lines[newLineId] = { text, parentNodeId: nodeId };

		const relations = this.nodeLineRelations[nodeId] || [];

		this.nodeLineRelations[nodeId] = [...relations, newLineId];

		console.log('Added Line:', newLineId);
		return newLineId;
	}

	updateLine(lineId, text) {
		if (this.lines[lineId]) {
			this.lines[lineId].text = text;
		}
	}

	cleanupLines(nodeId) {
		const lineIds = this.nodeLineRelations[nodeId] || [];
		if (lineIds.length <= 1) return;

		const newLineIds = [];
		let hasChanged = false;

		for (let i = 0; i < lineIds.length; i++) {
			const id = lineIds[i];
			const content = this.lines[id]?.text?.trim();
			const isLast = i === lineIds.length - 1;

			if ((content && content.length > 0) || isLast) {
				newLineIds.push(id);
			} else {
				delete this.lines[id]; 
				hasChanged = true;
			}
		}

		if (hasChanged) {
			this.nodeLineRelations[nodeId] = newLineIds;
		}
	}

	// --- Persistence ---

	exportData() {
		return JSON.stringify({
			nodes: this.nodes,
			lines: this.lines,
			relations: this.nodeLineRelations
		});
	}

	importData(jsonString) {
		try {
			const parsed = JSON.parse(jsonString);
			this.nodes = parsed.nodes;
			this.lines = parsed.lines;
			this.nodeLineRelations = parsed.relations;
		} catch (e) {
			console.error('Failed to import', e);
			alert('Invalid Save File');
		}
	}
}

export const gameState = new GameStateManager();
