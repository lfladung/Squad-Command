class SpecController
{
	constructor(state)
	{
		this.mouse = {
			x: null,
			y: null
		};
		this.state = state;
		this.offset = state.canvas.getBoundingClientRect();
	}

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
}
