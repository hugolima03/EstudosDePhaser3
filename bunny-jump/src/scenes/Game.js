import Phaser from "../lib/phaser.js";
import Carrot from "../game/Carrot.js";

export default class Game extends Phaser.Scene {
  /** @type {Phaser.Physics.Arcade.Sprite} */
  /** @type {Phaser.Types.input.keyboard.CursorKeys} */
  carrotsCollected = 0;
  carrotsCollectedText;
  cursors;
  player;
  platforms;

  constructor() {
    super("game");
  }
  preload() {
    this.load.image("background", "assets/Background/bg_layer1.png");
    this.load.image("platform", "assets/Environment/ground_grass.png");
    this.load.image("bunny-stand", "assets/Players/bunny1_stand.png");
    this.load.image('carrot', '../assets/Items/carrot.png');

    this.cursors = this.input.keyboard.createCursorKeys();
  }

  create() {
    this.add.image(240, 320, "background").setScrollFactor(1, 0);

    this.platforms = this.physics.add.staticGroup();

    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(80, 400);
      const y = 150 * i;

      /** @type {Phaser.Physics.Arcade.Sprite} */
      const platform = this.platforms.create(x, y, "platform");
      platform.scale = 0.5;

      /** @type {Phaser.Physics.Arcade.StaticBody} */
      const body = platform.body;
      body.updateFromGameObject();
    }

    this.player = this.physics.add
      .sprite(240, 320, "bunny-stand")
      .setScale(0.5);
    this.physics.add.collider(this.platforms, this.player);

    this.player.body.checkCollision.up = false;
    this.player.body.checkCollision.left = false;
    this.player.body.checkCollision.right = false;

    this.cameras.main.startFollow(this.player);
    this.cameras.main.setDeadzone(this.scale.width * 1.5);

    this.carrots = this.physics.add.group({
      classType: Carrot
    });

    this.physics.add.collider(this.platforms, this.carrots);

    this.physics.add.overlap(
      this.player,
      this.carrots,
      this.handleCollectCarrot,
      undefined,
      this
    );

    const style = { color:'#000', fontSize: 24, fontFamily: 'monospace'};
    this.carrotsCollectedText = this.add.text(240, 10, 'Carrots: 0', style)
      .setScrollFactor(0)
      .setOrigin(0.5, 0);
  }

  update(t, dt) {
    this.platforms.children.iterate((child) => {
      /** @type {Phaser.Physics.Arcade.Sprite} */
      const platform = child;

      const scrollY = this.cameras.main.scrollY;

      if (platform.y >= scrollY + 700) {
        platform.y = scrollY - Phaser.Math.Between(50, 100);
        platform.body.updateFromGameObject();

        // Create a carrot above the platform being reused
        this.addCarrotAbove(platform);
      }
    });

    const touchingDown = this.player.body.touching.down;

    if (touchingDown) {
      this.player.setVelocityY(-500);
    }

    if (this.cursors.left.isDown && !touchingDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown && !touchingDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }
    this.horizontalWrap(this.player);

    this.horizontalWrap(this.player);
  }
  /** @param {Phaser.GameObjects.Sprite} sprite*/

  horizontalWrap(sprite) {
    const halfWidth = sprite.displayWidth * 0.5;
    const gameWidth = this.scale.width;
    if (sprite.x < -halfWidth) {
      sprite.x = gameWidth + halfWidth;
    } else if (sprite.x > gameWidth + halfWidth) {
      sprite.x = -halfWidth;
    }
  }

  addCarrotAbove(sprite) {
    const y = sprite.y - sprite.displayHeight;

    const carrot = this.carrots.get(sprite.x, y, 'carrot');
    
    carrot.body.checkCollision.up = false;

    carrot.setActive(true);
    carrot.setVisible(true);

    this.add.existing(carrot);

    carrot.body.setSize(carrot.width, carrot.height);

    this.physics.world.enable(carrot);

    return carrot
  }

  handleCollectCarrot(player, carrot) {
    this.carrots.killAndHide(carrot);

    this.physics.world.disableBody(carrot.body);

    this.carrotsCollected++

    const value = `Carrots: ${this.carrotsCollected}`
    this.carrotsCollectedText.text = value;
  }
}
