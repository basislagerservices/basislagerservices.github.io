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

/**
 * Animate snow falling in the canvas.
 */
export class SnowLayer extends Layer {
  constructor(canvas, flakeCount) {
    super(canvas)
    this.snowflakes = []
    this.#createSnowflakes(flakeCount)
  }

  animate() {
    for (const flake of this.snowflakes) {
      this.#drawSnowflake(flake)

      flake.y += flake.speedY
      flake.x += flake.speedX

      // Wrap when passing bottom
      if (flake.y > this.canvas.height + flake.size) {
        flake.y = -flake.size
        flake.x = Math.random() * this.canvas.width
      }
    }
  }

  resize(oldWidth, oldHeight, newWidth, newHeight) {
    const scaleX = newWidth / oldWidth
    const scaleY = newHeight / oldHeight

    for (const flake of this.snowflakes) {
      flake.x *= scaleX
      flake.y *= scaleY
    }
  }

  #createSnowflakes(count) {
    for (let i = 0; i < count; i++) {
      this.snowflakes.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 28 + 10, // emoji pixel size
        speedY: Math.random() * 1 + 0.5, // vertical speed
        speedX: Math.random() * 0.8 - 0.4, // horizontal drift
        emoji: '❄️',
      })
    }
  }

  #drawSnowflake(flake) {
    this.ctx.font = `${flake.size}px serif`
    this.ctx.fillText(flake.emoji, flake.x, flake.y)
  }
}
