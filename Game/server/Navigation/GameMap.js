const Heap = require('./Heap.js').Heap;
const Utilities = require('../Utilities/Utils.js');
const Vector = Utilities.Vector;
const Projectile = require('../GameObject/Projectile.js').Projectile;


/**
 * heuristic - the heuristic function for A* algorithm
 *
 * @param  {number} x      x coordinate
 * @param  {number} y      y coordinate
 * @param  {Vector} finish final coordinate
 * @return {number}        the heuristic return
 */
function heuristic(x, y, finish)
{
	return Math.sqrt((finish.x - x) * (finish.x - x) + (finish.y - y) * (finish.y - y));
}


/**
 * comparator - compares two Nodes by their f variable ascending
 *
 * @param  {PathNode} i first Node
 * @param  {PathNode} j second Node
 * @return {number}   returns < 0 if i comes before j
 *                            > 0 if j comes before i
 *                            = 0 if i is equal to j
 */
function comparator(i, j)
{
	return i.f - j.f;
}



/**
 * Class representing a Path Node for A*
 */
class PathNode
{

	/**
	 * Creates a new PathNode with the given data and position
	 *
	 * @param {Object} data the data that will be held by this Node
	 * @param {Vector} position the (x, y) coordinates of this node
	 */
	constructor(data, position)
	{
		this.position = position;
		this.data = data;
		this.from = null;
		this.g = Infinity;
		this.f = Infinity;
		this.visited = false;
		this.inHeap = false;
	}


	/**
	 * setFrom - sets the node that this node can be accessed form in the shortest distance
	 *
	 * @param {PathNode} from the node that this node is accessed from
	 */
	setFrom(from)
	{
		this.from = from;
	}


	/**
	 * setG - sets the G value for this node, g value is the shortest distance from
	 * this node to the start node
	 *
	 * @param {number} g the g value to be set
	 */
	setG(g)
	{
		this.g = g;
	}


	/**
	 * setF - sets the f value for this node, f value is this nodes g value + the
	 * heuristic calculation for this node
	 *
	 * @param {number} f the f value to be set
	 */
	setF(f)
	{
		this.f = f;
	}
}

const MAX_SMOOTHS = 4;
const SAMPLE_DIST = 10;


/**
 * Class representing the game map for item storage and pathfinding
 */
class GameMap
{

	/**
	 * Creates a new GameMap object
	 *
	 * @param {String} image image file name for this map
	 * @param {GameObject[]} obstacles array of GameObjects to be displayed and
	 *   avoided by the Units
	 * @param {number} size the x, y size of this GameMap
	 * @param {number[]} hardnessMap an array of 1's and 0's, with 1's representing
	 *   a portion of the map to be avoided
	 */
	constructor(image, obstacles, size, hardnessMap)
	{
		this.image = image;
		this.obstacles = obstacles;
		this.size = size;
		this.hardnessMap = hardnessMap; // x, y, hardness

		this.tileSize = this.size.x / hardnessMap[0].length;

		this.regionMap = [];
		this.regMapSize = this.tileSize * 5;
		for (let y = 0; y < this.size.y / this.regMapSize; y++)
		{
			this.regionMap.push(new Array());
			for (let x = 0; x < this.size.x / this.regMapSize; x++)
			{
				this.regionMap[y].push(new Array());
			}
		}

		this.pathToString = this.pathToString.bind(this);
	}


	/**
	 * insertObject - inserts a new GameObject into this map at the given coordinate region
	 *
	 * @param {GameObject} o the game object to be inserted
	 */
	insertObject(o)
	{
		let pos = this.convertToRegionMap(o.position);
		this.regionMap[pos.y][pos.x].push(o);
		o.mapPos = pos;
	}


	/**
	 * moveObject - moves an object from its last position's region to the new region
	 *  according to its updated position
	 *
	 * @param {Vector} from the position that the object is coming from
	 * @param {GameObject} o the GameObject that is being moved
	 */
	moveObject(from, o)
	{
		let f = this.convertToRegionMap(from);
		this.regionMap[f.y][f.x] = this.regionMap[f.y][f.x].filter((obj) => obj.id != o.id);
		this.insertObject(o);
	}


	/**
	 * removeObject - removes the given game object from this map
	 *
	 * @param {GameObject} o the game object to be removed from htis map
	 */
	removeObject(o)
	{
		let pos = this.convertToRegionMap(o.position);
		this.regionMap[pos.y][pos.x] = this.regionMap[pos.y][pos.x].filter((obj) => obj.id != o.id);
	}


	/**
	 * findObject - finds which region an object is
	 *
	 * @param {GameObject} o gameObject to find
	 * @return {Vector} region coordinates that the gameObject is in
	 */
	findObject(o)
	{
		for (let y = 0; y < this.regionMap.length; y++)
		{
			for (let x = 0; x < this.regionMap[0].length; x++)
			{
				for (let i = 0; i < this.regionMap[y][x].length; i++)
				{
					if (o.id === this.regionMap[y][x][i].id)
						return new Vector(x, y);
				}
			}
		}
	}


	/**
	 * checkRegion - checks to see if an object has moved from its last region,
	 *  if it has then update its region in this map
	 *
	 * @param {Vector} lastPos the last position of the object
	 * @param {GameObject} obj object to check if the region must change
	 */
	checkRegion(lastPos, obj)
	{
		if (Math.floor(lastPos.x / this.regMapSize) != Math.floor(obj.position.x / this.regMapSize) ||
			Math.floor(lastPos.y / this.regMapSize) != Math.floor(obj.position.y / this.regMapSize))
			this.moveObject(lastPos, obj);
	}


	/**
	 * convertToRegionMap - converts an x, y coordinate into the regionMap coords (scales)
	 *
	 * @param {Vector} pos veector to convert
	 * @return {Object} x and y coordinate of the region
	 */
	convertToRegionMap(pos)
	{
		let obj = {
			x: Math.floor(pos.x / this.regMapSize),
			y: Math.floor(pos.y / this.regMapSize)
		};
		return obj;
	}

	getNearby(o, condition, radius)
	{
		let nearby = [];
		let pos = this.convertToRegionMap(o.position);

		if (radius === undefined)
		{
			let startX = Math.max(0, pos.x - 1);
			let startY = Math.max(0, pos.y - 1);
			let endX = Math.min(this.regionMap[0].length - 1, pos.x + 1);
			let endY = Math.min(this.regionMap.length - 1, pos.y + 1);

			for (let x = startX; x <= endX; x++)
			{
				for (let y = startY; y <= endY; y++)
				{
					this.regionMap[y][x].forEach((obj) =>
					{
						if (o != obj)
						{
							if (condition != undefined && condition(obj))
								nearby.push(obj);
							else if (condition === undefined)
								nearby.push(obj);
						}
					});
				}
			}
		}
		else
		{
			let boundDist = Math.ceil(radius / this.regMapSize);

			let startX = Math.max(0, pos.x - boundDist);
			let startY = Math.max(0, pos.y - boundDist);
			let endX = Math.min(this.regionMap[0].length - 1, pos.x + boundDist);
			let endY = Math.min(this.regionMap.length - 1, pos.y + boundDist);

			for (let x = startX; x <= endX; x++)
			{
				for (let y = startY; y <= endY; y++)
				{
					// if this cell is within the radius, then check it
					let diffX = pos.x - x;
					let diffY = pos.y - y;
					if (diffX * diffX + diffY * diffY <= radius * radius)
					{
						this.regionMap[y][x].forEach((obj) =>
						{
							if (o != obj && o.position.distance(obj.position) <= radius)
							{
								if (condition != undefined && condition(obj))
									nearby.push(obj);
								else if (condition === undefined)
									nearby.push(obj);
							}
						});
					}
				}
			}
		}
		return nearby;
	}


	/**
	 * aStar - performs an A* algorithm from position s to position f and returns
	 *  the shortest path
	 *
	 * @param {Vector} s start position for the algorithm
	 * @param {Vector} f finish position for the algorithm
	 * @return {Vector[]} the shortestpath with the end point at index 0
	 */
	aStar(s, f)
	{
		let start = new Vector(Math.ceil(s.x / this.tileSize),
			Math.ceil(s.y / this.tileSize));
		let finish = new Vector(Math.ceil(f.x / this.tileSize),
			Math.ceil(f.y / this.tileSize));

		// Didn't feel this would have a significant impact, but this allows 
		// for troops to walk along the border, wheras before they would just 
		// stay in their old position
		if (this.walkable(start, finish))
			return [f];

		if (isNaN(finish.y) || isNaN(finish.x) || this.hardnessMap[finish.y] === undefined ||
			this.hardnessMap[finish.y][finish.x] === undefined ||
			finish.x < 0 || finish.y < 0 ||
			this.hardnessMap[finish.y][finish.x] === 1)
			return [];

		// if (this.walkable(start, finish))
		// 	return [f];

		var heap = new Heap(comparator);

		let pathNodes = []; //2d array of PathNodes, representing each position in grid
		for (let y = 0; y < this.hardnessMap.length; y++)
		{
			pathNodes.push([]);
			for (let x = 0; x < this.hardnessMap[0].length; x++)
			{
				pathNodes[y].push(new PathNode(this.hardnessMap[y][x],
				{
					x: x,
					y: y
				}));
			}
		}

		pathNodes[start.y][start.x].setG(0);
		pathNodes[start.y][start.x].setF(heuristic(start.x, start.y, finish));
		heap.insert(pathNodes[start.y][start.x]);
		pathNodes[start.y][start.x].inHeap = true;
		let n;
		while (n = heap.pop())
		{
			if (n.position.x == finish.x && n.position.y == finish.y)
				return this.constructPath(n, f);

			n.visited = true;

			let startX = (n.position.x - 1 >= 0) ? n.position.x - 1 : 0;
			let startY = (n.position.y - 1 >= 0) ? n.position.y - 1 : 0;
			let endX = (n.position.x + 1 < this.hardnessMap[0].length) ?
				n.position.x + 1 : this.hardnessMap[0].length - 1;
			let endY = (n.position.y + 1 < this.hardnessMap.length) ?
				n.position.y + 1 : this.hardnessMap.length - 1;

			for (let y = startY; y <= endY; y++)
			{
				for (let x = startX; x <= endX; x++)
				{
					let neighbor = pathNodes[y][x];
					if (!neighbor.visited && (neighbor.data != 1))
					{
						if (!neighbor.inHeap)
						{
							heap.insert(neighbor);
							neighbor.inHeap = true;
						}

						let cost;

						// if the neighbor is diagonal, it will cost more (root(2))
						if (neighbor.x != n.x && neighbor.y != n.y)
							cost = Math.sqrt(2);
						else
							cost = 1;

						let score = n.g + cost;
						if (score < neighbor.g)
						{
							neighbor.setFrom(n);
							neighbor.setG(score);
							neighbor.setF(score + heuristic(x, y, finish));
							heap.promote(neighbor);
						}
					}
				}
			}
		}

		return [];
	}


	/**
	 * constructPath - constructs a path starting at node and going to start
	 *
	 * @param {PathNode} node node to start from
	 * @param {Vector} finish the final position the unit should be in
	 * @return {Vector[]} the path constructed
	 */
	constructPath(node, finish)
	{
		var path = [];
		while (node.from)
		{
			path.push(new Vector(node.position.x, node.position.y));
			node = node.from;
		}

		for (let i = 0, before = 10, after = 0; i < MAX_SMOOTHS && Math.abs(before - after) > 2; i++)
			this.smooth(path);
		var that = this;
		path.forEach((p) =>
		{
			p.x *= that.tileSize;
			p.y *= that.tileSize;
		});

		path[0] = finish;
		return path;
	}


	/**
	 * smooth - smooths the given a path
	 *
	 * @param {Vector[]} path the path that should be smoothed
	 */
	smooth(path)
	{
		for (let i = 0, j = 2; j < path.length; i++, j++)
		{
			let from = path[i];
			let to = path[j];

			if (this.walkable(from, to))
				path.splice(i + 1, 1);
		}
	}


	/**
	 * walkable - decides if a there are any objects between from and to regions
	 *
	 * @param {Vector} from the region from
	 * @param {Vector} to the region to
	 * @return {boolean} returns true if there is no obstacle in between from and to, false otherwise
	 */
	walkable(from, to)
	{
		let diff = new Vector(to.x - from.x, to.y - from.y);
		if (Math.abs(diff.x) > Math.abs(diff.y)) diff.scale(Math.abs(1 / diff.x));
		else diff.scale(Math.abs(1 / diff.y));
		let current = new Vector(from.x, from.y);
		while (Math.round(current.x) != to.x || Math.round(current.y) != to.y)
		{
			// Drew added this cuz it would be undefined if units walked along the south border... 
			if (this.hardnessMap[Math.floor(current.y)] !== undefined)
				if (this.hardnessMap[Math.floor(current.y)][Math.floor(current.x)] === 1)
					return false;
			current.x += diff.x;
			current.y += diff.y;
		}

		return true;
	}


	/**
	 * pathToString - returns the given path as a string
	 *
	 * @param {Vecotr[]} path the path to be stringified
	 *
	 */
	pathToString(path)
	{
		let arr = [];
		for (let y = 0; y < this.hardnessMap.length; y++)
		{
			arr.push([]);
			for (let x = 0; x < this.hardnessMap[0].length; x++)
				arr[y].push(this.hardnessMap[y][x]);
		}

		for (let i = 0; i < path.length; i++)
		{
			let n = path[i];
			arr[n.position.y][n.position.x] = '#';
		}

		let str = '';
		for (let y = 0; y < arr.length; y++)
		{
			for (let x = 0; x < arr[0].length; x++)
			{
				str += arr[y][x] + " ";
			}

			str += '\n';
		}

		console.log(str);
	}


	/**
	 * printRegMapSize - prints the amount of objects in this map	
	 */
	printRegMapSize()
	{
		let size = 0;
		for (let y = 0; y < this.regionMap.length; y++)
			for (let x = 0; x < this.regionMap[0].length; x++)
				size += this.regionMap[y][x].length;

		console.log(size);
	}
}
exports.GameMap = GameMap;
