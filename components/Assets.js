import { Asset } from 'expo-asset'

export default {
  audio: {
    'hit.m4a': Asset.fromModule(require(`../assets/sounds/hit.m4a`)),
    'break.m4a': Asset.fromModule(require(`../assets/sounds/break.m4a`)),
  },
  icons: {
    'Gold Ore': Asset.fromModule(require(`../assets/icons/gold.png`)),
    Stone: Asset.fromModule(require(`../assets/icons/stone.png`)),
    'Iron Ore': Asset.fromModule(require(`../assets/icons/iron.png`)),
    Diamond: Asset.fromModule(require(`../assets/icons/diamond.png`)),
    Wood: Asset.fromModule(require(`../assets/icons/wood.png`)),
    Coal: Asset.fromModule(require(`../assets/icons/coal.png`)),
    'Gold Pickaxe': Asset.fromModule(
      require(`../assets/icons/goldpickaxe.png`)
    ),
    'Stone Pickaxe': Asset.fromModule(
      require(`../assets/icons/stonepickaxe.png`)
    ),
    'Iron Pickaxe': Asset.fromModule(
      require(`../assets/icons/ironpickaxe.png`)
    ),
    'Diamond Pickaxe': Asset.fromModule(
      require(`../assets/icons/diamondpickaxe.png`)
    ),
    'Wood Pickaxe': Asset.fromModule(
      require(`../assets/icons/woodpickaxe.png`)
    ),
    Stick: Asset.fromModule(require(`../assets/icons/stick.png`)),
    'Gold Ingot': Asset.fromModule(require(`../assets/icons/goldingot.png`)),
    'Iron Ingot': Asset.fromModule(require(`../assets/icons/ironingot.png`)),
  },
}
