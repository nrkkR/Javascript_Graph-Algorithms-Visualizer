const graphContainer = document.getElementById('graph-container');
const addNodeButton = document.getElementById('addNode');
const addEdgeButton = document.getElementById('addEdge');
const dfsButton = document.getElementById('dfs');
const bfsButton = document.getElementById('bfs');
const dijkstraButton = document.getElementById('dijkstra');
const primButton = document.getElementById('prim');
const clearButton = document.getElementById('clear');

let nodes = [];
let edges = [];
let isAddingEdge = false;
let selectedNode = null;

class Node {
    constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.edges = [];
    }

    addEdge(node, weight = 1) {
        this.edges.push({ node, weight });
    }
}

class Edge {
    constructor(node1, node2, weight) {
        this.node1 = node1;
        this.node2 = node2;
        this.weight = weight;
    }

    draw() {
        const x1 = this.node1.x + 15;
        const y1 = this.node1.y + 15;
        const x2 = this.node2.x + 15;
        const y2 = this.node2.y + 15;
        const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

        const edgeElement = document.createElement('div');
        edgeElement.classList.add('edge');
        edgeElement.style.width = `${length}px`;
        edgeElement.style.transform = `rotate(${angle}deg)`;
        edgeElement.style.left = `${x1}px`;
        edgeElement.style.top = `${y1}px`;

        graphContainer.appendChild(edgeElement);
    }
}

addNodeButton.addEventListener('click', () => {
    graphContainer.addEventListener('click', addNode);
});

addEdgeButton.addEventListener('click', () => {
    isAddingEdge = true;
});

dfsButton.addEventListener('click', async () => {
    await dfs(nodes[0]);
});

bfsButton.addEventListener('click', async () => {
    await bfs(nodes[0]);
});

dijkstraButton.addEventListener('click', async () => {
    await dijkstra(nodes[0]);
});

primButton.addEventListener('click', async () => {
    await primMST(nodes[0]);
});

clearButton.addEventListener('click', clearGraph);

function addNode(event) {
    const id = nodes.length;
    const x = event.offsetX - 15;
    const y = event.offsetY - 15;

    const node = new Node(id, x, y);
    nodes.push(node);

    const nodeElement = document.createElement('div');
    nodeElement.classList.add('node');
    nodeElement.style.left = `${x}px`;
    nodeElement.style.top = `${y}px`;
    nodeElement.textContent = id;
    nodeElement.id = `node-${id}`;
    nodeElement.addEventListener('click', () => selectNode(node));

    graphContainer.appendChild(nodeElement);

    graphContainer.removeEventListener('click', addNode);
}

function selectNode(node) {
    if (isAddingEdge) {
        if (selectedNode) {
            const weight = prompt('Enter edge weight:', '1');
            if (weight !== null) {
                selectedNode.addEdge(node, parseInt(weight));
                node.addEdge(selectedNode, parseInt(weight));
                const edge = new Edge(selectedNode, node, parseInt(weight));
                edges.push(edge);
                edge.draw();
            }
            selectedNode = null;
            isAddingEdge = false;
        } else {
            selectedNode = node;
        }
    }
}

async function dfs(startNode) {
    const visited = new Set();
    async function visit(node) {
        if (visited.has(node)) return;
        visited.add(node);
        document.getElementById(`node-${node.id}`).classList.add('visited');
        await sleep(500);
        for (const edge of node.edges) {
            await visit(edge.node);
        }
    }
    await visit(startNode);
}

async function bfs(startNode) {
    const queue = [startNode];
    const visited = new Set();

    while (queue.length > 0) {
        const node = queue.shift();
        if (visited.has(node)) continue;
        visited.add(node);
        document.getElementById(`node-${node.id}`).classList.add('visited');
        await sleep(500);
        for (const edge of node.edges) {
            if (!visited.has(edge.node)) {
                queue.push(edge.node);
            }
        }
    }
}

async function dijkstra(startNode) {
    const distances = new Map(nodes.map(node => [node, Infinity]));
    distances.set(startNode, 0);
    const visited = new Set();
    const priorityQueue = [startNode];

    while (priorityQueue.length > 0) {
        priorityQueue.sort((a, b) => distances.get(a) - distances.get(b));
        const node = priorityQueue.shift();
        if (visited.has(node)) continue;
        visited.add(node);
        document.getElementById(`node-${node.id}`).classList.add('visited');
        await sleep(500);
        for (const { node: neighbor, weight } of node.edges) {
            const newDist = distances.get(node) + weight;
            if (newDist < distances.get(neighbor)) {
                distances.set(neighbor, newDist);
                priorityQueue.push(neighbor);
            }
        }
    }
}

async function primMST(startNode) {
    const mstNodes = new Set([startNode]);
    const edges = [...startNode.edges];
    while (edges.length > 0) {
        edges.sort((a, b) => a.weight - b.weight);
        const { node: nextNode, weight } = edges.shift();
        if (!mstNodes.has(nextNode)) {
            mstNodes.add(nextNode);
            const edge = new Edge(startNode, nextNode, weight);
            edge.draw();
            startNode.addEdge(nextNode, weight);
            nextNode.addEdge(startNode, weight);
            document.getElementById(`node-${nextNode.id}`).classList.add('visited');
            await sleep(500);
            edges.push(...nextNode.edges);
        }
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function clearGraph() {
    nodes = [];
    edges = [];
    selectedNode = null;
    graphContainer.innerHTML = '';
}
