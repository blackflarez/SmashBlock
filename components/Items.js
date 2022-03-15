export default [
  //Ores
  {
    name: 'Gold Ore',
    description: 'A precious metal.',
    health: 48,
    colour: 'darkgoldenrod',
    material: 'shiny',
    probability: 1,
    type: 'block',
    category: 'ore',
    output: 'Gold Ingot',
    model: 'rock',
    locations: ['Spooky_Cave'],
    tools: ['pickaxe', 'drill'],
    xpType: 'Mining',
    smeltLevel: 2,
    xpAmount: 45,
  },
  {
    name: 'Stone',
    description: 'A common material.',
    health: 24,
    colour: '#595959',
    material: 'matte',
    probability: 80,
    type: 'block',
    model: 'stone',
    locations: ['Spooky_Cave'],
    tools: ['pickaxe', 'drill'],
    xpType: 'Mining',
    xpAmount: 1,
  },
  {
    name: 'Iron Ore',
    description: 'A uncommon metal.',
    health: 36,
    colour: '#A4785D',
    material: 'shiny',
    probability: 20,
    type: 'block',
    category: 'ore',
    output: 'Iron Ingot',
    model: 'rock',
    locations: ['Spooky_Cave'],
    tools: ['pickaxe', 'drill'],
    xpType: 'Mining',
    smeltLevel: 1,
    xpAmount: 5,
  },
  {
    name: 'Copper Ore',
    description: 'An uncommon metal.',
    health: 30,
    colour: '#924A22',
    material: 'shiny',
    probability: 10,
    type: 'block',
    category: 'ore',
    output: 'Copper Ingot',
    model: 'rock',
    locations: ['Spooky_Cave'],
    tools: ['pickaxe', 'drill'],
    xpType: 'Mining',
    smeltLevel: 1,
    xpAmount: 5,
  },
  {
    name: 'Diamond',
    description: 'A very rare gem.',
    health: 80,
    colour: '#ACDDE7',
    material: 'glass',
    probability: 0.1,
    type: 'block',
    model: 'rock',
    locations: ['Spooky_Cave'],
    tools: ['pickaxe', 'drill'],
    xpType: 'Mining',
    xpAmount: 90,
  },
  {
    name: 'Wood',
    description: 'A common material.',
    health: 12,
    colour: '#5e4328',
    material: 'matte',
    probability: 60,
    type: 'block',
    model: 'wood',
    locations: ['Foggy_Forest'],
    tools: ['axe', 'chainsaw'],
    xpType: 'Woodcutting',
    xpAmount: 1,
  },
  {
    name: 'Coal',
    description: 'A common fuel.',
    health: 20,
    colour: '#252627',
    material: 'matte',
    probability: 30,
    type: 'block',
    category: 'fuel',
    model: 'rock',
    locations: ['Spooky_Cave'],
    tools: ['pickaxe', 'drill'],
    xpType: 'Mining',
    smeltLevel: 1,
    xpAmount: 5,
  },
  {
    name: 'Sand',
    description: 'A common material.',
    health: 8,
    colour: '#E7C496',
    material: 'matte',
    probability: 80,
    type: 'block',
    model: 'sand',
    locations: ['Sandy_Beach'],
    tools: ['shovel'],
    xpType: 'Excavation',
    xpAmount: 1,
  },
  //Tools
  {
    name: 'Wood Pickaxe',
    description: 'Mines stone fast.',
    recipe: { Stick: 2, Wood: 10 },
    strength: 1.5,
    efficiency: 2,
    durability: 20,
    type: 'tool',
    colour: '#4A4138',
    material: 'matte',
    category: 'pickaxe',
    skill: 'Mining',
    equipLevel: 1,
    craftLevel: 1,
    xpAmount: 10,
  },
  {
    name: 'Stone Pickaxe',
    description: 'Mines stone faster.',
    recipe: { Stick: 2, Stone: 10 },
    strength: 1.75,
    efficiency: 3,
    durability: 10,
    type: 'tool',
    colour: 'gray',
    material: 'matte',
    category: 'pickaxe',
    skill: 'Mining',
    equipLevel: 1,
    craftLevel: 1,
    xpAmount: 20,
  },
  {
    name: 'Iron Pickaxe',
    description: 'Mines stone even faster.',
    recipe: { Stick: 2, 'Iron Ingot': 10 },
    strength: 2,
    efficiency: 4,
    durability: 5,
    type: 'tool',
    colour: 'slategray',
    material: 'shiny',
    category: 'pickaxe',
    skill: 'Mining',
    equipLevel: 1,
    craftLevel: 2,
    xpAmount: 30,
  },
  {
    name: 'Gold Pickaxe',
    description: 'Mines stone super fast.',
    recipe: { Stick: 2, 'Gold Ingot': 10 },
    strength: 3,
    efficiency: 6,
    durability: 10,
    type: 'tool',
    colour: 'darkgoldenrod',
    material: 'shiny',
    category: 'pickaxe',
    skill: 'Mining',
    equipLevel: 1,
    craftLevel: 1,
    xpAmount: 40,
  },
  {
    name: 'Diamond Pickaxe',
    description: 'Mines stone very fast.',
    recipe: { Stick: 2, Diamond: 10 },
    strength: 5,
    efficiency: 8,
    durability: 1,
    type: 'tool',
    colour: '#ACDDE7',
    material: 'glass',
    category: 'pickaxe',
    skill: 'Mining',
    equipLevel: 1,
    craftLevel: 2,
    xpAmount: 50,
  },
  {
    name: 'Wood Axe',
    description: 'Gathers wood fast.',
    recipe: { Stick: 2, Wood: 7 },
    strength: 1.5,
    efficiency: 2,
    durability: 20,
    type: 'tool',
    colour: '#4A4138',
    material: 'matte',
    category: 'axe',
    skill: 'Woodcutting',
    equipLevel: 1,
    craftLevel: 1,
    xpAmount: 10,
  },
  {
    name: 'Stone Axe',
    description: 'Gathers wood faster.',
    recipe: { Stick: 2, Stone: 7 },
    strength: 1.75,
    efficiency: 3,
    durability: 10,
    type: 'tool',
    colour: 'gray',
    material: 'matte',
    category: 'axe',
    skill: 'Woodcutting',
    equipLevel: 1,
    craftLevel: 1,
    xpAmount: 20,
  },
  {
    name: 'Iron Axe',
    description: 'Gathers wood even faster.',
    recipe: { Stick: 2, 'Iron Ingot': 7 },
    strength: 2,
    efficiency: 4,
    durability: 5,
    type: 'tool',
    colour: 'slategray',
    material: 'shiny',
    category: 'axe',
    skill: 'Woodcutting',
    equipLevel: 1,
    craftLevel: 1,
    xpAmount: 30,
  },
  {
    name: 'Gold Axe',
    description: 'Gathers wood super fast.',
    recipe: { Stick: 2, 'Gold Ingot': 7 },
    strength: 3,
    efficiency: 6,
    durability: 10,
    type: 'tool',
    colour: 'darkgoldenrod',
    material: 'shiny',
    category: 'axe',
    skill: 'Woodcutting',
    equipLevel: 1,
    craftLevel: 1,
    xpAmount: 40,
  },
  {
    name: 'Diamond Axe',
    description: 'Gathers wood very fast.',
    recipe: { Stick: 2, Diamond: 7 },
    strength: 5,
    efficiency: 8,
    durability: 1,
    type: 'tool',
    colour: '#ACDDE7',
    material: 'glass',
    category: 'axe',
    skill: 'Woodcutting',
    equipLevel: 1,
    craftLevel: 2,
    xpAmount: 50,
  },
  {
    name: 'Drill',
    description: 'Powerful mining tool.',
    recipe: { 'Copper Wire': 5, 'Iron Ingot': 15 },
    strength: 4,
    efficiency: 2,
    durability: 1,
    speed: 100,
    type: 'tool',
    colour: 'grey',
    category: 'drill',
    skill: 'Mining',
    equipLevel: 1,
    craftLevel: 2,
    xpAmount: 50,
  },
  {
    name: 'Chainsaw',
    description: 'Powerful woodcutting tool.',
    recipe: { 'Copper Wire': 5, 'Iron Ingot': 15 },
    strength: 3,
    efficiency: 2,
    durability: 1,
    speed: 100,
    type: 'tool',
    colour: 'grey',
    category: 'chainsaw',
    skill: 'Woodcutting',
    equipLevel: 1,
    craftLevel: 2,
    xpAmount: 50,
  },

  {
    name: 'Shovel',
    description: 'Good for digging.',
    recipe: { Stick: 2, 'Iron Ingot': 7 },
    strength: 3,
    efficiency: 5,
    durability: 5,
    type: 'tool',
    colour: 'slategray',
    material: 'shiny',
    category: 'shovel',
    skill: 'Excavation',
    equipLevel: 1,
    craftLevel: 1,
    xpAmount: 30,
  },
  //Resources
  {
    name: 'Stick',
    description: 'Useful for crafting.',
    recipe: { Wood: 5 },
    type: 'resource',
    xpAmount: 1,
    craftLevel: 1,
  },
  {
    name: 'Copper Wire',
    description: 'Useful for electronics.',
    recipe: { 'Copper Ingot': 3, 'Iron Ingot': 2 },
    type: 'resource',
    xpAmount: 1,
    craftLevel: 1,
  },
  {
    name: 'Furnace',
    description: 'Primitive tool for smelting.',
    recipe: { Stone: 30 },
    type: 'resource',
    xpAmount: 5,
    craftLevel: 1,
  },
  {
    name: 'Gold Ingot',
    description: 'Pure bar of gold.',
    type: 'resource',
    xpAmount: 10,
  },
  {
    name: 'Iron Ingot',
    description: 'Pure bar of iron.',
    type: 'resource',
    xpAmount: 5,
  },
  {
    name: 'Copper Ingot',
    description: 'Pure bar of copper.',
    type: 'resource',
    xpAmount: 5,
  },
  //Locations
  { name: 'Foggy_Forest', skill: 'Woodcutting', unlockLevel: 1 },
  { name: 'Spooky_Cave', skill: 'Mining', unlockLevel: 1 },
  { name: 'Sandy_Beach', skill: 'Mining', unlockLevel: 10 },
]
