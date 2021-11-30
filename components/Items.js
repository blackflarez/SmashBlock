export default [
  {
    name: 'Gold',
    description: 'A precious metal.',
    health: 24,
    colour: 'darkgoldenrod',
    metal: true,
    probability: 5,
    type: 'block',
  },
  {
    name: 'Stone',
    description: 'A common material.',
    health: 12,
    colour: 'gray',
    metal: false,
    probability: 80,
    type: 'block',
  },
  {
    name: 'Iron',
    description: 'A less common metal.',
    health: 18,
    colour: 'slategray',
    metal: true,
    probability: 50,
    type: 'block',
  },
  {
    name: 'Wood',
    description: 'A common material.',
    health: 6,
    colour: '#5e4328',
    metal: false,
    probability: 60,
    type: 'block',
  },

  {
    name: 'Stone Pickaxe',
    description: 'Mine blocks faster.',
    recipe: { Wood: 5, Stone: 10 },
    strength: 1,
    efficiency: 2,
    health: 100,
    type: 'tool',
    colour: 'gray',
    metal: false,
  },
  {
    name: 'Iron Pickaxe',
    description: 'Mine blocks even faster.',
    recipe: { Wood: 5, Iron: 10 },
    strength: 1.25,
    efficiency: 3,
    health: 200,
    type: 'tool',
    colour: 'slategray',
    metal: true,
  },
  {
    name: 'Gold Pickaxe',
    description: 'Mine blocks super fast.',
    recipe: { Wood: 5, Gold: 10 },
    strength: 1.95,
    efficiency: 6,
    health: 150,
    type: 'tool',
    colour: 'darkgoldenrod',
    metal: true,
  },
  {
    name: 'Diamond Pickaxe',
    description: 'Mine blocks very fast.',
    recipe: { Wood: 5, Diamond: 10 },
    strength: 16,
    efficiency: 1,
    health: 200,
    type: 'tool',
    colour: 'blue',
    metal: true,
  },
]
