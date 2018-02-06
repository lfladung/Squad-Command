class MapNode
{
	constructor(x, y)
	{
		this.position = new Vector(x, y);
		this.neighbors = [];
	}

	distance(n)
	{
		return this.position.distance(n.position);
	}

	inNeighbor(n)
	{
		for (let i = 0; i < this.neighbors.length; i++)
		{
			if (this.neighbors[i] === n)
				return true;
		}

		return false;
	}

	addNeighbor(n)
	{
		this.neighbors = this.neighbors.filter((node) => node != n);
		this.neighbors.push(n);
	}

	addNeighbors(arr)
	{
		let self = this;
		arr.forEach((n) => self.neighbors.push(n));
	}

	removeNeighbor(n)
	{
		this.neighbors = this.neighbors.filter((neighbor) => neighbor != n);
	}
}

class Triangle
{
	constructor(p1, p2, p3)
	{
		this.p1 = p1;
		this.p2 = p2;
		this.p3 = p3;

		this.neighbors = [];
	}

	addNeighbors(n)
	{
		this.neighbors.push(n);
	}
}

function genSubMat(matrix, ignoreCol)
{
	let r = [];
	for (let i = 0; i < matrix.length - 1; i++)
	{
		r.push([]);
		for (let j = 0; j < matrix[0].length; j++)
		{
			if (j != ignoreCol)
				r[i].push(matrix[i + 1][j]);
		}
	}

	return r;
}

function determinantSqMat(matrix)
{
	if (matrix.length != matrix[0].length) return false;

	if (matrix.length === 2) return matrix[0][0] * matrix[1][1] - matrix[1][0] * matrix[0][1];

	let det = 0;
	for (let i = 0; i < matrix.length; i++)
	{
		let r = genSubMat(matrix, i);
		let tmp = matrix[0][i] * determinantSqMat(r);
		if (i % 2 == 0)
			det += tmp;
		else
			det -= tmp;
	}

	return -det;
}

// if d is in the circle formed by points a, b, and c, return > 0
// d is on circle, return 0
// d is outside of circle, return < 0
function inCircle(a, b, c, d)
{
	let arr = [a, b, c, d];
	let mat = [
		[],
		[],
		[],
		[]
	];

	for (let i = 0; i < arr.length; i++)
	{
		mat[i][0] = 1;
		mat[i][1] = arr[i].position.x;
		mat[i][2] = arr[i].position.y;
		mat[i][3] = arr[i].position.x * arr[i].position.x + arr[i].position.y * arr[i].position.y;
	}
	return determinantSqMat(mat);
}

function walkable(from, to, hardnessMap)
{
	let diff = new Vector(to.x - from.x, to.y - from.y);
	if (Math.abs(diff.x) > Math.abs(diff.y)) diff.scale(Math.abs(1 / diff.x));
	else diff.scale(Math.abs(1 / diff.y));
	let current = new Vector(from.x + diff.x, from.y + diff.y);
	while (Math.round(current.x) != to.x || Math.round(current.y) != to.y)
	{
		if (hardnessMap[Math.floor(current.y)][Math.floor(current.x)] === 1)
			return false;
		current.x += diff.x;
		current.y += diff.y;
	}

	return true;
}

function getLowest(nodes)
{
	let lowest = nodes[0];
	for (let i = 1; i < nodes.length; i++)
	{
		if (nodes[i].position.y < lowest.position.y)
			lowest = nodes[i];
	}

	return lowest;
}

// returns the angle between 2 vectors, if cw is true, then return clockwise angle between,
// else return the ccw angle between. b is the "hinge" point
function angleBetween(a, b, c, cw)
{
	let ba = new Vector(a.position.x - b.position.x, a.position.y - b.position.y);
	let bc = new Vector(c.position.x - b.position.x, c.position.y - b.position.y);
	let v0 = new Vector(0, 1);

	let angleBA = v0.angleBetween(ba) * 180 / Math.PI;
	if (angleBA < 0) angleBA += 360;
	let angleBC = v0.angleBetween(bc) * 180 / Math.PI;
	if (angleBC < 0) angleBC += 360;

	let smallest = Math.min(angleBA, angleBC);
	let largest = Math.max(angleBA, angleBC);

	let angle = largest - smallest;

	return (cw) ? angle : 360 - angle;
}

function sortSmallestAngle(a, b, list, cw)
{
	list.sort((m, n) =>
	{
		let vab = new Vector(a.position.x - b.position.x, a.position.y - b.position.y);
		let vmb = new Vector(m.position.x - b.position.x, m.position.y - b.position.y);
		let vnb = new Vector(n.position.x - b.position.x, n.position.y - b.position.y);

		if (cw)
			return vab.angleBetween(vmb, cw) - vab.angleBetween(vnb, cw);
		else
			return vab.angleBetween(vnb, cw) - vab.angleBetween(vmb, cw);
	});
}

// a is in list, b is in the other list
function getPotential(a, b, list, cw)
{
	sortSmallestAngle(b, a, list, cw);
	for (let i = 0; i < list.length - 1; i++)
	{
		let angle = angleBetween(b, a, list[i], cw);
		if (angle > 180) return false;
		else if (inCircle(a, b, list[i], list[i + 1]) <= 0)
			return list[i];
		else
		{
			a.removeNeighbor(list[i]);
			list[i].removeNeighbor(a);
		}
	}

	let potential = list[list.length - 1];
	if (potential)
	{
		let angle = angleBetween(a, b, potential, cw);
		if (angle > 180) return false;
		return potential;
	}
	return false;
}

function merge(leftNodes, rightNodes, leftBase, rightBase, hardnessMap)
{
	leftBase.addNeighbor(rightBase);
	rightBase.addNeighbor(leftBase);

	let newLeft = leftNodes.filter((n) => n != leftBase);
	let newRight = rightNodes.filter((n) => n != rightBase);

	let potentialLeft = getPotential(leftBase, rightBase, newLeft, false);
	let potentialRight = getPotential(rightBase, leftBase, newRight, true);

	if (!potentialLeft && !potentialRight) return;
	else if (potentialLeft && !potentialRight)
		merge(newLeft, newRight, potentialLeft, rightBase, hardnessMap);
	else if (potentialRight && !potentialLeft)
		merge(newLeft, newRight, leftBase, potentialRight, hardnessMap);
	else
	{
		if (inCircle(leftBase, rightBase, potentialLeft, potentialRight) <= 0)
			merge(newLeft, newRight, potentialLeft, rightBase, hardnessMap);
		if (inCircle(leftBase, rightBase, potentialRight, potentialLeft) <= 0)
			merge(newLeft, newRight, leftBase, potentialRight, hardnessMap);
	}
}

// divide and conquer algorithm
function delaunay(nodes, hardnessMap)
{
	if (nodes.length <= 3)
	{
		for (let i = 0; i < nodes.length; i++)
			for (let j = 0; j < nodes.length; j++)
				if (i != j)
					nodes[i].addNeighbor(nodes[j]);

		return nodes;
	}
	else
	{
		nodes.sort((a, b) =>
		{
			let tmp = a.position.x - b.position.x;
			if (tmp === 0) return b.position.y - a.position.y;
			return tmp;
		});

		let l = nodes.length;

		let leftNodes;
		let rightNodes;

		if (l === 4)
		{
			leftNodes = delaunay(nodes.slice(0, 3), hardnessMap);
			rightNodes = delaunay(nodes.slice(3, 4), hardnessMap);
		}
		else
		{
			leftNodes = delaunay(nodes.slice(0, Math.floor(nodes.length / 2)), hardnessMap);
			rightNodes = delaunay(nodes.slice(Math.floor(nodes.length / 2), nodes.length), hardnessMap);
		}
		let leftBase = getLowest(leftNodes);
		let rightBase = getLowest(rightNodes);

		merge(leftNodes, rightNodes, leftBase, rightBase, hardnessMap);

		console.log("=============================MergeComplete================================");
		return nodes;
	}
}
