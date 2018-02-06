const GameObject = require('./GameObject.js').GameObject;

class SuperAttack extends GameObject
{
  constructor(king)
  {
    super();
  }

  update()
  {
    return false;
  }

  execute()
  {

  }
}

exports.SuperAttack = SuperAttack;
