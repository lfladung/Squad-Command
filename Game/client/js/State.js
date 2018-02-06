/**
 * Mode specifications for player
 */
mode = {
	BATTLE: 0,
	COMMAND: 1
}
MAX_ZOOM = 2;
MIN_ZOOM = 1;

/**
 * State represents socket and canvas information
 */
class State
{
	/**
	 * Construct state with reference to current socket (Player)
	 * and canvas information
	 * @param {*} socket
	 * 	This players communication tunnel
	 * @param {*} canvas
	 * 	Current game dimension and rendering information
	 */
	constructor(socket, canvas)
	{
		this.mode = mode.COMMAND;
		this.canvas = canvas;
		this.magnification = MIN_ZOOM;
		this.socket = socket;
		this.center = {
			x: canvas.width / 2,
			y: canvas.height / 2
		}; // relative center to the map

		this.dragStart = {
			x: undefined,
			y: undefined
		};
		this.mousedown = false;
		this.dragBox = false;
	}

	/**
	 * Notifies the server
	 * @param {*} message
	 * 	Message to server
	 * @param {*} obj
	 * 	Object specific information
	 */
	notify(message, obj)
	{
		if (obj != undefined) this.socket.emit(message, obj);
		else this.socket.emit(message);
	}
}
