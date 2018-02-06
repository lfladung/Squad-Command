/**
 * Handles renderings
 */
class WindowManager
{
	/**
	 * Constructs WindowManager object
	 * @param {*} state
	 *  Relevant state information
	 * @param {*} map
	 *  Current map to render
	 */
	constructor(state, map)
	{
		this.images = {}; // use this so we don't have to reload images at every frame
		this.state = state;
		this.ctx = state.canvas.getContext('2d');
		this.map = new Image();
		this.map.src = map;
		this.render = this.render.bind(this);
	}

	/**
	 * Zooms in for battle mode
	 */
	zoomIn()
	{
		this.state.magnification = MAX_ZOOM;
		this.ctx.translate(this.state.canvas.width / 2, this.state.canvas.height / 2);
		this.ctx.scale(this.state.magnification, this.state.magnification);
		this.ctx.translate(-this.state.canvas.width / 2, -this.state.canvas.height / 2);
	}

	/**
	 * Return to command mode
	 */
	zoomOut()
	{
		this.ctx.translate(this.state.canvas.width / 2, this.state.canvas.height / 2);
		this.ctx.scale(1 / this.state.magnification, 1 / this.state.magnification);
		this.ctx.translate(-this.state.canvas.width / 2, -this.state.canvas.height / 2);
		this.state.magnification = MIN_ZOOM;
	}

	renderDragBox(mouse)
	{
		let top = (mouse.y < this.state.dragStart.y) ? mouse.y : this.state.dragStart.y;
		let left = (mouse.x < this.state.dragStart.x) ? mouse.x : this.state.dragStart.x;

		let width = Math.abs(mouse.x - this.state.dragStart.x);
		let height = Math.abs(mouse.y - this.state.dragStart.y);

		this.ctx.strokeRect(left, top, width, height);
	}

	/**
	 * Render objects
	 * @param {*} objects
	 *  Specified objects to be rendered
	 */
	renderItems(objects, mouse)
	{
		this.ctx.clearRect(0, 0, 500, 500);
		var c = this.ctx;
		c.drawImage(this.map, this.state.center.x - this.state.canvas.width / 2,
			this.state.center.y - this.state.canvas.height / 2, this.state.canvas.width,
			this.state.canvas.height,
			0, 0, this.state.canvas.width, this.state.canvas.height);

		var self = this;
		if (this.state.mode == mode.BATTLE)
		{
			objects.troops.forEach(function(t)
			{
				if (t.ownerId == self.state.socket.id && t.isKing)
				{
					self.state.center.x = t.position.x;
					self.state.center.y = t.position.y;
				}
			});
		}

		objects.projectiles.forEach(this.render);
		objects.troops.forEach(this.render);
		objects.obstacles.forEach(this.render);
		objects.fire.forEach(this.render);

		if (this.state.dragBox)
			this.renderDragBox(mouse);

		this.ctx.restore();
	}

	/**
	 * Render health bars above units
	 * @param {*} o
	 *  Specified units
	 */
	renderHP(o)
	{
		var pos = {
			x: this.state.canvas.width / 2 - (this.state.center.x - o.position.x) - 5,
			y: this.state.canvas.height / 2 - (this.state.center.y - o.position.y)
		}
		this.ctx.fillStyle = "#000000";
		this.ctx.strokeRect(pos.x - o.hitbox.x / 2, pos.y - o.hitbox.y - 15 / 2, 10, 5);
		this.ctx.fillStyle = "#00FF00";
		this.ctx.fillRect(pos.x - o.hitbox.x / 2, pos.y - o.hitbox.y - 14 / 2, o.hp.current, 4);
		this.ctx.fillStyle = "#FF0000";
		this.ctx.fillRect(pos.x - o.hitbox.x / 2 + o.hp.current, pos.y - o.hitbox.y - 14 / 2, o.hp.max - o.hp.current, 4);

	}

	/**
	 * Render specific object
	 * @param {*} o
	 *  Specified object
	 */
	render(o)
	{
		var pos = {
			x: this.state.canvas.width / 2 - (this.state.center.x - o.position.x) - 2.5,
			y: this.state.canvas.height / 2 - (this.state.center.y - o.position.y)
		}

		if (o.image)
		{
			if (o.image == 'troop.png')
			{
				this.renderHP(o);
				o.image = (o.ownerId === this.state.socket.id) ? 'friendly.png' : 'enemy.png';
				if (o.image === 'friendly.png' && this.state.mode === mode.COMMAND && o.selected.value)
					o.image = 'selected.png';
			}
			if (!this.images[o.image])
			{
				this.images[o.image] = new Image();
				this.images[o.image].src = 'client/assets/' + o.image;
			}
			this.ctx.drawImage(this.images[o.image], pos.x - o.hitbox.x / 2, pos.y - o.hitbox.y / 2, o.hitbox.x, o.hitbox.y);
		}
		else
			this.ctx.fillRect(pos.x - o.hitbox.x / 2, pos.y - o.hitbox.y / 2, o.hitbox.x, o.hitbox.y);
	}
}
