import { Asset } from 'expo-asset'

export default {
  audio: {
    'hit.m4a': Asset.fromModule(require(`../assets/sounds/hit.m4a`)),
    'break.m4a': Asset.fromModule(require(`../assets/sounds/break.m4a`)),
  },
  icons: {
    gold: Asset.fromModule(require(`../assets/icons/gold.png`)),
    stone: Asset.fromModule(require(`../assets/icons/stone.png`)),
    iron: Asset.fromModule(require(`../assets/icons/iron.png`)),
    wood: Asset.fromModule(require(`../assets/icons/wood.png`)),
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
  },
}
