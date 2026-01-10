/*
 * Copyright 2025-2026 Basislager Services
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import { Layer } from './layer.js'

const GRAVITY = 2000 // Pixels per second^2
const HORIZONTAL_SPEED = 300 // Base horizontal speed (randomized)
const JUMP_HEIGHT = 300 // Base jump height (randomized)

/**
 * A Snowman layer: whenever a posting arrives, a snowman jumps.
 */
export class SnowmanLayer extends Layer {
  constructor(canvas) {
    super(canvas)

    // Jump state
    this.vx = 0 // horizontal velocity
    this.vy = 0 // vertical velocity
    this.isJumping = false
    this.lastTime = performance.now()

    // Emoji size measurement
    this.fontSize = 64
    this.snowman = '⛄️'

    // Position: bottom middle of the canvas
    this.x = this.canvas.width / 2
    this.y = this.canvas.height - this.fontSize / 2

    this.ctx.font = `${this.fontSize}px sans-serif`
    this.textMetrics = this.ctx.measureText(this.snowman)
  }

  /** Trigger a jump when a new posting arrives. */
  handlePosting(p) {
    if (p.source === 'history') return
    this.#startJump()
  }

  /** Trigger a jump when a new vote update arrives. */
  handleVoteUpdate(u) {
    if (u.source === 'history') return
    this.#startJump()
  }

  #startJump() {
    // Randomize direction: left (-1) or right (+1)
    let dir = Math.random() < 0.5 ? -1 : 1

    // Random horizontal speed
    const vxRand = HORIZONTAL_SPEED * (0 + Math.random() * 1.0)

    // Random jump height
    const jumpHeight = JUMP_HEIGHT * (0.7 + Math.random() * 0.6)

    // Physics: vy such that max height ≈ jumpHeight
    // vy^2 = 2*g*h
    const vy0 = -Math.sqrt(2 * GRAVITY * jumpHeight)

    this.vx = dir * vxRand
    this.vy = vy0

    this.isJumping = true
  }

  /**
   * Animate the snowman (called every frame).
   */
  animate() {
    const now = performance.now()
    const dt = (now - this.lastTime) / 1000 // seconds since last frame
    this.lastTime = now

    if (this.isJumping) {
      // Update physics
      this.x += this.vx * dt
      this.vy += GRAVITY * dt
      this.y += this.vy * dt

      // Collide with ground
      const ground = this.canvas.height - this.fontSize / 2
      if (this.y >= ground) {
        this.y = ground
        this.isJumping = false
        this.vx = 0
        this.vy = 0
      }

      // Keep within bounds horizontally
      this.x = Math.max(this.x, this.fontSize)
      this.x = Math.min(this.x, this.canvas.width - this.fontSize)

      // Clamp X and change on borders.
      if (this.x <= this.fontSize) {
        this.x = this.fontSize
        this.vx = -this.vx
      } else if (this.x >= this.canvas.width - this.fontSize) {
        this.x = this.canvas.width - this.fontSize
        this.vx = -this.vx
      }
    }

    // Draw snowman at position
    this.ctx.font = `${this.fontSize}px sans-serif`
    this.ctx.textBaseline = 'middle'
    this.ctx.textAlign = 'center'
    this.ctx.fillText(this.snowman, this.x, this.y)
  }

  /** Recompute position on resize. */
  resize(oldWidth, oldHeight, newWidth, newHeight) {
    // Re-center horizontally, keep ground alignment
    const ratioX = newWidth / oldWidth
    const ratioY = newHeight / oldHeight

    this.x *= ratioX
    this.y = newHeight - this.fontSize / 2
  }
}
