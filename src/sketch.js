import p5 from 'p5'
import 'p5/lib/addons/p5.play'

const sketch = (p) => {
  let gray = 0
  let circles
  let boxes
  let allSprites = []
  let bubblys
  let hero
  let suns
  let gravities
  let canControl = true
  let controtimeout
  let holes
  // let antigravities
  const SCENEW = 2560
  const SCENEH = 1440
  //初始化太阳
  let initSun = () => {
    suns = new p.Group()
    gravities = new p.Group()
    for (let i = 0; i < 3; i++) {
      let sun = p.createSprite(p.random(SCENEW / 6, SCENEW * 5 / 6), p.random(SCENEH / 6, SCENEH * 5 / 6))
      sun.addAnimation('glow', 'assets/sun1.png', 'assets/sun3.png')
      sun.mass = 50
      sun.setSpeed(p.random(0, 1), p.random(0, 360))
      sun.setCollider('circle', 0, 0, 70)
      sun.maxSpeed = 10
      let gravity = p.createSprite(sun.position.x, sun.position.y)
      gravity.draw = () => {
        gravity.position.x = sun.position.x
        gravity.position.y = sun.position.y
        gravity.setCollider('circle', 0, 0, 700 * sun.scale, 700 * sun.scale)
        if (sun.scale <= 0.1) {
          gravity.remove()
        }
      }
      suns.add(sun)
      gravities.add(gravity)
      allSprites.push(sun)
    }
  }
  let initHoles = () => {
    holes = new p.Group()
    // antigravities = new p.Group()
    for (let i = 0; i < 30; i++) {
      let hole = p.createSprite(p.random(0, SCENEW), p.random(0, SCENEH))
      hole.addAnimation('glow', 'assets/cloud_breathing0001.png', 'assets/cloud_breathing0009.png')
      hole.setSpeed(p.random(1, 2), p.random(0, 360))
      hole.scale = p.random(0.4, 1.3)
      hole.mass = hole.scale
      hole.maxSpeed = 5
      holes.add(hole)
      allSprites.push(hole)
    }
  }
  //初始化主角
  let initHero = () => {
    let heroface = p.loadImage('assets/face.png')
    hero = p.createSprite(p.width / 2, p.height / 2, 10, 10)
    hero.setCollider('circle', 0, 0, 50, 50)
    hero.scale = 0.9
    // hero.addAnimation('crazy', 'assets/sun1.png', 'assets/sun3.png')
    hero.draw = function() {
      p.fill(237, 205, 0)
      p.push()
      p.rotate(p.radians(this.getDirection()))
      p.ellipse(0, 0, 100 + this.getSpeed(), 100 - this.getSpeed() / 1.5)
      p.pop()
      p.image(heroface, this.deltaX * 2, this.deltaY * 2)
    }
    hero.maxSpeed = 15
  }
  //主角移动
  let heroUpdate = () => {
    hero.velocity.x = (p.camera.mouseX - hero.position.x) / 20
    hero.velocity.y = (p.camera.mouseY - hero.position.y) / 20
  }

  p.setup = () => {
    p.createCanvas(1440, 768)
    let border = p.createSprite(SCENEW / 2, SCENEH / 2)
    border.setCollider('rectangle', 0, 0, SCENEW + 150, SCENEH + 150)
    border.debug = true
    border.draw = () => {}
    circles = new p.Group()
    //添加圆形
    for (let i = 0; i < 80; i++) {
      let circle = p.createSprite(p.random(0, p.width), p.random(0, p.height))
      circle.addAnimation('normal', 'assets/asterisk_circle0006.png', 'assets/asterisk_circle0008.png')
      circle.setCollider('circle', -2, 2, 55)
      circle.setSpeed(p.random(1, 3), p.random(0, 360))
      circle.scale = p.random(0.1, 0.8)
      circle.mass = circle.scale
      circle.maxSpeed = 5
      circles.add(circle)
      allSprites.push(circle)
    }
    //添加方形
    boxes = new p.Group()

    for (let i = 0; i < 8; i++) {
      let box = p.createSprite(p.random(SCENEW / 10, SCENEW * 9 / 10), p.random(SCENEH / 10, SCENEH * 9 / 10))
      box.addAnimation('normal', 'assets/box0001.png', 'assets/box0003.png')
      box.immovable = true
      if (i % 2 == 0)
        box.rotation = 90
      boxes.add(box)
    }
    //添加加速泡泡
    bubblys = new p.Group()
    for (let i = 0; i < 8; i++) {
      let bubbly = p.createSprite(p.random(SCENEW / 10, SCENEW * 9 / 10), p.random(SCENEH / 10, SCENEH * 9 / 10))
      bubbly.addAnimation('normal', 'assets/bubbly0001.png', 'assets/bubbly0004.png')
      bubbly.setCollider('rectangle', 0, 0, 100, 200)
      bubblys.add(bubbly)
      if (i % 2 == 0)
        bubbly.rotation = 90
      allSprites.push(bubbly)
    }
    initSun()
    initHoles()
    initHero()
  }
  //游戏机制
  let bigEatSmall = (clctor, clcted) => {
    clcted.velocity.x += clctor.velocity.x / 10
    clcted.velocity.y += clctor.velocity.y / 10
    if (clctor.scale >= clcted.scale) {
      if (clctor.scale < 2) {
        clctor.scale += clcted.scale / 80 / clctor.scale
      }
      if (clcted.scale <= clctor.scale / 15 * clctor.scale) {
        clcted.scale -= clctor.scale / 15 * clctor.scale
        clcted.remove()
      } else {
        clcted.scale -= clctor.scale / 15 * clctor.scale
      }
    } else {
      if (clctor.scale <= clcted.scale / 15 * clcted.scale) {
        clctor.scale -= clcted.scale / 15 * clcted.scale
        clctor.remove()
      } else {
        clctor.scale -= clcted.scale / 15 * clcted.scale
      }
      if (clcted.scale < 2) {
        clcted.scale += clctor.scale / 80 / clcted.scale
      }
    }
  }

  let eateach = (clctor, clcted) => {
    if (clcted.scale <= clctor.scale / 5) {
      clcted.scale -= clctor.scale / 5
      clcted.remove()
    } else {
      clcted.scale -= clctor.scale / 5
    }
    if (clctor.scale <= clcted.scale / 5) {
      clctor.scale -= clcted.scale / 5
      clctor.remove()
    } else {
      clctor.scale -= clcted.scale / 5
    }
  }
  //太阳引力
  let gravityEffect = (clctor, clcted) => {
    clctor.velocity.x += (clcted.position.x - clctor.position.x) / 8000 * clcted.scale
    clctor.velocity.y += (clcted.position.y - clctor.position.y) / 8000 * clcted.scale
  }

  p.draw = () => {
    p.background(255, 255, 255)

    if (p.random(0, 100) <= 20) {
      let circle = p.createSprite(p.random(0, p.width), p.random(0, p.height))
      circle.addAnimation('normal', 'assets/asterisk_circle0006.png', 'assets/asterisk_circle0008.png')
      circle.setCollider('circle', -2, 2, 55)
      circle.setSpeed(p.random(2, 3), p.random(0, 360))
      circle.scale = p.random(0.2, 0.5)
      circle.mass = circle.scale
      circles.add(circle)
      allSprites.push(circle)
    }
    circles.overlap(circles, bigEatSmall)
    circles.bounce(boxes)
    // hero.overlap(bubblys, (clctor, clcted) => {
    //   clcted.rotation === 90
    //     ? hero.position.x += 200 / p.abs(hero.position.x / 5 - clcted.position.x / 5 + 15)
    //     : hero.position.y -= 200 / p.abs(hero.position.y / 5 - clcted.position.y / 5 + 15)
    // })
    circles.overlap(bubblys, (clctor, clcted) => {
      clcted.rotation === 90
        ? clctor.velocity.x += 0.6
        : clctor.velocity.y -= 0.6
    })
    bubblys.collide(boxes)
    boxes.collide(boxes)
    circles.overlap(suns)
    circles.overlap(gravities, gravityEffect)
    suns.displace(boxes)
    suns.overlap(bubblys, (clctor, clcted) => {
      clcted.rotation === 90
        ? clctor.velocity.x += 0.2
        : clctor.velocity.y -= 0.2
    })
    hero.collide(boxes)
    hero.displace(suns)
    hero.overlap(circles, bigEatSmall)
    suns.overlap(suns, bigEatSmall)
    suns.overlap(gravities, gravityEffect)
    holes.overlap(holes, bigEatSmall)
    holes.bounce(boxes)
    holes.overlap(bubblys, (clctor, clcted) => {
      clcted.rotation === 90
        ? clctor.velocity.x += 0.6
        : clctor.velocity.y -= 0.6
    })
    circles.overlap(holes, eateach)
    hero.overlap(holes, eateach)
    holes.overlap(gravities, gravityEffect)
    for (var i = 0; i < allSprites.length; i++) {
      var s = allSprites[i]
      if (s.position.x < 0) {
        s.position.x = 1
        s.velocity.x = p.abs(s.velocity.x)
      }

      if (s.position.x > SCENEW) {
        s.position.x = SCENEW - 1
        s.velocity.x = -p.abs(s.velocity.x)
      }

      if (s.position.y < 0) {
        s.position.y = 1
        s.velocity.y = p.abs(s.velocity.y)
      }

      if (s.position.y > SCENEH) {
        s.position.y = SCENEH - 1
        s.velocity.y = -p.abs(s.velocity.y)
      }
      s.velocity.x /= 1.005
      s.velocity.y /= 1.005
    }
    p.camera.position.x = hero.position.x
    p.camera.position.y = hero.position.y

    if (hero.position.x < 0)
      hero.position.x = 0
    if (hero.position.y < 0)
      hero.position.y = 0
    if (hero.position.x > SCENEW)
      hero.position.x = SCENEW
    if (hero.position.y > SCENEH)
      hero.position.y = SCENEH

    heroUpdate()
    if (!hero || hero.scale <= 0.01) {
      p.background(255, 255, 255, 50)
      p.textSize(100)
      p.fill(0, 102, 153)
      p.text('You Lose', p.camera.position.x - 200, p.camera.position.y - 200)
      // p.noLoop()
    }
    if (hero && hero.scale >= 1.98) {
      p.background(255, 255, 255, 50)
      p.textSize(100)
      p.fill(0, 102, 153)
      p.text('You Win!', p.camera.position.x - 200, p.camera.position.y - 200)
      // p.noLoop()
    }
    p.drawSprites()
  }

  p.mousePressed = () => {
    console.log(circles[0])
  }
}

new p5(sketch)
