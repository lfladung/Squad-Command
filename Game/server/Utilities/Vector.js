class Vector
{
	constructor(x, y)
	{
		this.x = x;
		this.y = y;
	}

	magnitude()
	{
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}
	distance(v)
	{
		return Math.sqrt(Math.abs((this.x - v.x) * (this.x - v.x) + (this.y - v.y) * (this.y - v.y)));
	}
	normalize()
	{
		var mag = this.magnitude();
		if (mag == 0) return 0;
		this.x /= mag;
		this.y /= mag;

		return this;
	}
	scale(s)
	{
		this.x *= s;
		this.y *= s;

		return this;
	}
	subtract(v)
	{
		this.x -= v.x;
		this.y -= v.y;

		return this;
	}
	add(v)
	{
		this.x += v.x;
		this.y += v.y;

		return this;
	}
	equals(v)
	{
		return this.x === v.x && this.y === v.y;
	}
	dotProduct(v)
	{
		return (this.x * v.x + this.y * v.y);
	}
	crossProduct(v)
	{
		return (this.x * v.y - this.y * v.x);
	}
	angleBetween(v)
	{
		return Math.acos(Math.min(this.dotProduct(v) / ((this.magnitude() * v.magnitude())), 1));
	}
	angleBetweenTwoVectors(v1, v2)
	{
		return Math.acos(v1.dotProduct(v2)/((Math.sqrt(v1.x*v1.x + v1.y*v1.y))*(Math.sqrt(v2.x*v2.x + v2.y*v2.y))));
	}
	toString()
	{
		return this.x + ', ' + this.y;
	}
	rotate(dir)
	{
		let mag = this.magnitude();
		this.x = dir.x;
		this.y = dir.y;
		this.normalize();
		this.scale(mag);
		return this;
	}
}

Vector.clone = function(v)
{
	return new Vector(v.x, v.y);
}

exports.Vector = Vector;
