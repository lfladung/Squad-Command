/**
 * Class represents a Heap
 */
class Heap
{

	/**
	 * Creates a Heap with the given comparator
	 *
	 * @param {function} comparator function to compare nodes in the heap
	 */
	constructor(comparator)
	{
		this.heap = [];
		this.comparator = comparator;
	}


	/**
	 * size - Returns the size of this heap
	 *
	 * @return {number} size of this heap
	 */
	size()
	{
		return this.heap.length;
	}


	/**
	 * percUp - moves the node with index i up, recurivesly moves up if the smallest
	 *  is not the parent
	 *
	 * @param {number} i index of node to move up
	 */
	percUp(i)
	{
		let parent = this.parent(i);
		if (parent == undefined)
			return false;

		let left = this.leftChild(parent);
		let right = this.rightChild(parent);

		let smallest = parent;
		if (left && this.comparator(this.heap[left], this.heap[parent]) < 0)
			smallest = left;
		if (right && this.comparator(this.heap[right], this.heap[smallest]) < 0)
			smallest = right;
		if (smallest != parent)
		{
			this.swap(parent, smallest);
			this.percUp(parent);
		}
	}


	/**
	 * percDown - moves the node with index i downwards while it is not the smallest
	 *
	 * @param {number} i index of node to move down
	 */
	percDown(i)
	{
		let left = this.leftChild(i);
		let right = this.rightChild(i);
		let smallest = i;
		if (left && this.comparator(this.heap[left], this.heap[i]) < 0)
			smallest = left;
		if (right && this.comparator(this.heap[right], this.heap[smallest]) < 0)
			smallest = right;
		if (smallest != i)
		{
			this.swap(i, smallest);
			this.percDown(smallest);
		}
	}


	/**
	 * swap - Swaps two nodes
	 *
	 * @param {number} i index 1 to swap
	 * @param {number} j index 2 to swap
	 */
	swap(i, j)
	{
		let tmp = this.heap[i];
		this.heap[i] = this.heap[j];
		this.heap[j] = tmp;
	}


	/**
	 * promote - moves a node up using percUp
	 *
	 * @param {Object} node node to move up
	 */
	promote(node)
	{
		let pos = undefined;
		for (let i = 0; i < this.heap.length; i++)
			if (node === this.heap[i])
				pos = i;

		if (pos === undefined)
			return false;

		this.percUp(pos);
	}


	/**
	 * insert - inserts a new node into the heap, causes a restructure according to the new
	 * node
	 *
	 * @param {Object} item new node to be added
	 */
	insert(item)
	{
		this.heap.push(item);
		if (this.heap.length > 1) this.percUp(this.heap.length - 1);
	}


	/**
	 * peek - returns the top node of this heap
	 *
	 * @return {Object} first node in this heap
	 */
	peek()
	{
		return this.heap[0];
	}


	/**
	 * pop - removes and returns the top node in this heap
	 *
	 * @return {Object} top node in this heap
	 */
	pop()
	{
		if (this.heap.length === 0)
			return false;
		this.swap(0, this.heap.length - 1);
		let min = this.heap[this.heap.length - 1];
		this.heap = this.heap.slice(0, this.heap.length - 1);
		this.percDown(0);
		return min;
	}


	/**
	 * isLeft - Decides if the node with index i is a left child
	 *
	 * @return {boolean} true if node at index i is a left node, false otherwise
	 */
	isLeft(i)
	{
		return i % 2 !== 0;
	}


	/**
	 * isRight - Decides if the node with index i is a right child
	 *
	 * @return {boolean} true if node at index i is a right node, false otherwise
	 */
	isRight(i)
	{
		return i % 2 === 0;
	}


	/**
	 * leftChild - Returns the left child of the node at index i
	 *
	 * @return {*} false if there is no left node, the index of the left node otherwise
	 */
	leftChild(i)
	{
		let childInd = 2 * i + 1;
		if (childInd >= this.heap.length)
			return false;
		return childInd;
	}


	/**
	 * rightChild - Returns the right child of the node at index i
	 *
	 * @return {*} false if there is no right node, the index of the right node otherwise
	 */
	rightChild(i)
	{
		let childInd = 2 * i + 2;
		if (childInd >= this.heap.length)
			return false;
		return childInd;
	}


	/**
	 * parent - Returns the parend of the node at index i
	 *
	 * @return {*} undefined if there is not parent, otherwise the index of the child
	 */
	parent(i)
	{
		if (i == 0) return undefined;
		return Math.floor((i - 1) / 2)
	}
}

exports.Heap = Heap;
