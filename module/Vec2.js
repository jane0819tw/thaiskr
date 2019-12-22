export default class Vec2 {
  constructor(x, y) {
    this.x = x || 0
    this.y = y || 0
  }
  add(v) {
    return new Vec2(this.x + v.x, this.y + v.y)
  }
  sub(v) {
    return new Vec2(this.x - v.x, this.y - v.y)
  }
  set(x, y) {
    this.x = x
    this.y = y
  }
  move(x, y) {
    this.x += x
    this.y += y
  }
  equal(v) {
    return v.x === this.x && v.y === this.y
  }
  mul(l) {
    return new Vec2(this.x * l, this.y * l)
  }
  clone() {
    return new Vec2(this.x, this.y)
  }
  toString() {
    return `(x: ${this.x},y: ${this.y})`
  }
  get angle() {
    return Math.atan2(this.y / this.x)
  }
  get length() {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }
  get unit() {
    return this.mul(1 / this.length)
  }
  set length(l) {
    this.set(this.unit().mul(l).x, this.unit().mul(l).y)
  }
}