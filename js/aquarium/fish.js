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

import { randomElement } from './utils.js'
import { Layer } from './layer.js'

// prettier-ignore
export const DEFAULT_FACES = [
  '🐨', '🐭', '🐮', '🐯', '🐰', '🐱', '🐵', '🐶', '🐷', '🐸', '🐹', '🐺', '🐻', '🐻‍❄️', '🐼',
  '😸', '😹', '😺', '😻', '😼', '😽', '🦁', '🦊',
]

/**
 * Animate fish with faces onto the canvas when a posting is published.
 */
export class FishLayer extends Layer {
  constructor(canvas, { inactivityLimit = 3600 * 1000, faces = DEFAULT_FACES } = {}) {
    super(canvas)

    this.inactivityLimit = inactivityLimit
    this.faces = faces
    this.activeUsers = {}
  }

  animate() {
    const now = Date.now()
    for (const [name, fish] of Object.entries(this.activeUsers)) {
      const inactive = now - fish.lastActive > this.inactivityLimit
      if (inactive) {
        // Swim off-screen slowly
        fish.x += fish.direction * 1.5
        if (fish.x < -60 || fish.x > this.canvas.width + 60) {
          delete this.activeUsers[name]
          continue
        }
      } else {
        // Swim pattern
        fish.x += fish.direction * fish.speed
        fish.y += Math.sin(Date.now() / 700 + fish.offset) * 0.5

        // Bounce off walls
        if (fish.x < 30) fish.direction = 1
        if (fish.x > this.canvas.width - 30) fish.direction = -1

        fish.y = Math.min(Math.max(30, fish.y), this.canvas.height - 30)
      }

      // At 60 fps, it takes 10 minutes for the entire spectrum.
      if (fish.name === 'WS+') {
        fish.color = (fish.color + 1.0) % 360
      } else {
        fish.color = (fish.color + 0.01) % 360
      }

      this.#drawFish(fish)
    }
  }

  handlePosting(p) {
    if (!this.activeUsers[p.user]) {
      this.activeUsers[p.user] = {
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        direction: Math.random() < 0.5 ? 1 : -1,
        color: Math.random() * 360,
        offset: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 0.5,
        lastActive: p.published.getTime(),
        name: p.user,
        face: randomElement(this.faces),
      }
    } else {
      this.activeUsers[p.user].lastActive = Math.max(p.published.getTime(), this.activeUsers[p.user].lastActive)
    }
  }

  resize(oldWidth, oldHeight, newWidth, newHeight) {
    // Scale fish positions to new size
    const scaleX = newWidth / oldWidth
    const scaleY = newHeight / oldHeight

    for (const fish of Object.values(this.activeUsers)) {
      fish.x *= scaleX
      fish.y *= scaleY
    }
  }

  #drawFish(fish) {
    const color = `hsl(${fish.color}, 70%, 60%)`
    this.ctx.save()
    this.ctx.translate(fish.x, fish.y)
    this.ctx.scale(fish.direction, 1)

    // Draw body
    this.ctx.fillStyle = color
    this.ctx.beginPath()
    this.ctx.ellipse(0, 0, 20, 10, 0, 0, Math.PI * 2)
    this.ctx.fill()

    // Tail
    this.ctx.beginPath()
    this.ctx.moveTo(-20, 0)
    this.ctx.lineTo(-30, -10)
    this.ctx.lineTo(-30, 10)
    this.ctx.closePath()
    this.ctx.fill()

    // Optional glow for recent activity
    const glowStrength = Math.max(0, 1 - (Date.now() - fish.lastActive) / 5000)
    if (glowStrength > 0) {
      this.ctx.shadowColor = color
      this.ctx.shadowBlur = 15 * glowStrength
      this.ctx.beginPath()
      this.ctx.arc(0, 0, 10 + 10 * glowStrength, 0, Math.PI * 2)
      this.ctx.fill()
      this.ctx.shadowBlur = 0
    }

    this.ctx.restore()

    // Add the face.
    this.ctx.font = '28px sans-serif'
    this.ctx.textAlign = 'center'
    this.ctx.fillStyle = 'rgba(255, 255, 255, 1.00)'
    this.ctx.fillText(fish.face, fish.x + fish.direction * 25, fish.y + 8)

    // --- Draw username label ---
    this.ctx.font = '14px sans-serif'
    this.ctx.textAlign = 'center'
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
    this.ctx.fillText(fish.name, fish.x, fish.y - 18) // draw above the fish
  }
}
