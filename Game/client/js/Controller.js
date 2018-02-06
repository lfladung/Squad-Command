/**
 * Controller portion of MVC framework
 */
class Controller
{
	/**
	 * Constructor for our Conroller
	 * @param state
	 * 		State of the controller
	 */
	constructor(state)
	{
		this.mouse = {
			x: 0,
			y: 0
		};
		this.keys = {
			up: false,
			right: false,
			down: false,
			left: false
		};
		this.state = state;
		this.offset = state.canvas.getBoundingClientRect();
	}

	/**
	 * Detects and updates mouse moved
	 * @param {*} mouse
	 * 	mouse position
	 */
	mouseMoved(mouse)
	{
		this.mouse.x = (mouse.clientX - this.offset.x > 0) ? mouse.clientX - this.offset.x : 0;
		this.mouse.y = (mouse.clientY - this.offset.y > 0) ? mouse.clientY - this.offset.y : 0;
	}

	/**
	 * Verifies mouse within current game window
	 */
	checkMouseToWindow()
	{
		if (this.state.mode == mode.COMMAND)
		{
			let leftBorder = this.state.center.x - this.state.canvas.width / 2;
			let rightBorder = this.state.center.x + this.state.canvas.width / 2;
			let topBorder = this.state.center.y - this.state.canvas.height / 2;
			let bottomBorder = this.state.center.y + this.state.canvas.height / 2;

			let dist = this.mouse.x - this.state.canvas.width / 2;
			if (Math.abs(dist) > 100)
			{
				if (dist < 0 && leftBorder > 0)
					this.state.center.x--;
				else if (rightBorder < 500)
					this.state.center.x++;

				this.state.center.x = Math.floor(this.state.center.x);
			}

			dist = this.mouse.y - this.state.canvas.height / 2;
			if (Math.abs(dist) > 100)
			{
				if (dist < 0 && topBorder > 0)
					this.state.center.y--;
				else if (bottomBorder < 500)
					this.state.center.y++;

				this.state.center.y = Math.floor(this.state.center.y);
			}
		}
	}

	/**
	 * Redirects information of click and specifies what needs to be done
	 * @param {*} e
	 * 		Click information
	 */
	click(e)
	{
		let which = (e.which == 3) ? 'right' : 'left';
		let diff = {
			x: this.mouse.x - this.state.canvas.width / 2,
			y: this.mouse.y - this.state.canvas.height / 2
		};

		diff.x /= this.state.magnification;
		diff.y /= this.state.magnification;
		let mouse = {
			x: this.state.center.x + diff.x,
			y: this.state.center.y + diff.y
		};

		this.state.notify(which + ' click',
		{
			mouse: mouse
		});
	}

	select(mouse)
	{
		let box = {
			top: (this.mouse.y < this.state.dragStart.y) ? this.mouse.y : this.state.dragStart.y,
			left: (this.mouse.x < this.state.dragStart.x) ? this.mouse.x : this.state.dragStart.x,
			right: (this.mouse.x < this.state.dragStart.x) ? this.state.dragStart.x : this.mouse.x,
			bottom: (this.mouse.y < this.state.dragStart.y) ? this.state.dragStart.y : this.mouse.y
		}

		this.state.notify('selection box',
		{
			box: box
		});
	}

	/**
	 * Notifies servers with specified key change
	 */
	notifyServer()
	{
		this.state.notify("key change",
		{
			keys: this.keys
		});
	}

	/**
	 * Relays keychange information
	 * @param {*} e
	 * 	Relevant Key change information on key press
	 */
	keyDown(e)
	{
		if (e.keyCode != 32 && e.keyCode != 70 && e.keyCode != 71 && e.keyCode != 72)
		{
			switch (e.keyCode)
			{
				case 87:
					this.keys.up = true;
					break;
				case 68:
					this.keys.right = true;
					break;
				case 83:
					this.keys.down = true;
					break;
				case 65:
					this.keys.left = true;
					break;
			}

			this.notifyServer();
		}
		else if (e.keyCode == 70)
		{
			let diff = {
				x: this.mouse.x - this.state.canvas.width / 2,
				y: this.mouse.y - this.state.canvas.height / 2
			};

			diff.x /= this.state.magnification;
			diff.y /= this.state.magnification;
			let mouse = {
				x: this.state.center.x + diff.x,
				y: this.state.center.y + diff.y
			};

			this.state.notify('flamewall',
			{
				mouse: mouse
			});
		}
		else if (e.keyCode == 71)
		{
			this.state.notify("stomp start");
		}
		else if (e.keyCode == 72)
		{
			this.state.notify("heal");
		}
		else
			this.state.notify("toggle mode");
	}

	/**
	 * Relays proper information on key release
	 * @param {*} e
	 */
	keyUp(e)
	{
		if (e.keyCode != 71)
		{
			switch (e.keyCode)
			{
				case 87:
					this.keys.up = false;
					break;
				case 68:
					this.keys.right = false;
					break;
				case 83:
					this.keys.down = false;
					break;
				case 65:
					this.keys.left = false;
					break;
			}
		}
		else if (e.keyCode == 71)
		{
			this.state.notify("stomp end");
		}

		this.notifyServer();
	}
}
