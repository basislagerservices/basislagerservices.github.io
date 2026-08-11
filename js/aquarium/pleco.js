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

const MARGIN = 55

/**
 * A decorative pleco stuck to the glass, gently sliding along the screen.
 * Its sucker mouth pulses in a continuous licking animation.
 */
export class PlecoLayer extends Layer {
  constructor(canvas) {
    super(canvas)
    this.pleco = {
      x: canvas.width * 0.7,
      y: canvas.height * 0.5,
      angle: Math.random() * Math.PI * 2,
      speed: 0.12,
      timer: 0,
      interval: 200 + Math.random() * 400,
      target: null,
    }

    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect()
      this.pleco.target = {
        x: Math.max(MARGIN, Math.min(this.canvas.width - MARGIN, e.clientX - rect.left)),
        y: Math.max(MARGIN, Math.min(this.canvas.height - MARGIN, e.clientY - rect.top)),
      }
    })
  }

  animate() {
    const p = this.pleco

    if (p.target) {
      const dx = p.target.x - p.x
      const dy = p.target.y - p.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < 4) {
        p.target = null
      } else {
        const targetAngle = Math.atan2(dy, dx)
        let angleDiff = targetAngle - p.angle
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2
        p.angle += angleDiff * 0.04
        p.speed = Math.max(0.12, Math.min(0.6, 0.06 + dist * 0.003))
        p.x += Math.cos(p.angle) * p.speed
        p.y += Math.sin(p.angle) * p.speed
        p.timer = 0
      }
    } else {
      p.x += Math.cos(p.angle) * p.speed
      p.y += Math.sin(p.angle) * p.speed

      p.timer++
      if (p.timer > p.interval) {
        p.timer = 0
        p.interval = 200 + Math.random() * 500
        p.angle += (Math.random() - 0.5) * Math.PI * 0.6
        p.speed = 0.05 + Math.random() * 0.15
      }
    }

    if (p.x < MARGIN) { p.x = MARGIN; this.#bounce(p) }
    if (p.x > this.canvas.width - MARGIN) { p.x = this.canvas.width - MARGIN; this.#bounce(p) }
    if (p.y < MARGIN) { p.y = MARGIN; this.#bounce(p) }
    if (p.y > this.canvas.height - MARGIN) { p.y = this.canvas.height - MARGIN; this.#bounce(p) }

    this.#draw(p)
  }

  resize(oldWidth, oldHeight, newWidth, newHeight) {
    this.pleco.x *= newWidth / oldWidth
    this.pleco.y *= newHeight / oldHeight
    if (this.pleco.target) {
      this.pleco.target.x *= newWidth / oldWidth
      this.pleco.target.y *= newHeight / oldHeight
    }
  }

  #bounce(p) {
    p.angle = Math.random() * Math.PI * 2
    p.speed = 0.05 + Math.random() * 0.15
  }

  #draw(p) {
    const mouthPhase = Date.now() / 800
    this.ctx.save()
    this.ctx.translate(p.x, p.y)

    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.35)'
    this.ctx.shadowBlur = 12
    this.ctx.shadowOffsetX = 3
    this.ctx.shadowOffsetY = 3

    this.ctx.fillStyle = '#5C4535'
    this.ctx.beginPath()
    this.ctx.moveTo(0, -36)
    this.ctx.quadraticCurveTo(42, -30, 42, -4)
    this.ctx.quadraticCurveTo(42, 16, 16, 36)
    this.ctx.quadraticCurveTo(0, 40, -16, 36)
    this.ctx.quadraticCurveTo(-42, 16, -42, -4)
    this.ctx.quadraticCurveTo(-42, -30, 0, -36)
    this.ctx.fill()

    this.ctx.shadowColor = 'transparent'

    this.ctx.fillStyle = '#7B6B58'
    this.ctx.beginPath()
    this.ctx.moveTo(0, -24)
    this.ctx.quadraticCurveTo(22, -20, 24, -2)
    this.ctx.quadraticCurveTo(26, 10, 10, 26)
    this.ctx.quadraticCurveTo(0, 30, -10, 26)
    this.ctx.quadraticCurveTo(-26, 10, -24, -2)
    this.ctx.quadraticCurveTo(-22, -20, 0, -24)
    this.ctx.fill()

    this.ctx.fillStyle = '#483828'
    for (const [sx, sy] of [[-13,-14],[10,-10],[-6,-2],[8,4],[-10,10],[14,14],[-12,20],[6,22]]) {
      this.ctx.beginPath()
      this.ctx.ellipse(sx, sy, 3, 2.5, 0, 0, Math.PI * 2)
      this.ctx.fill()
    }

    this.ctx.fillStyle = '#5C4A38'
    this.ctx.beginPath()
    this.ctx.moveTo(-42, -2)
    this.ctx.quadraticCurveTo(-56, 8, -50, 18)
    this.ctx.quadraticCurveTo(-44, 10, -42, -2)
    this.ctx.fill()
    this.ctx.beginPath()
    this.ctx.moveTo(42, -2)
    this.ctx.quadraticCurveTo(56, 8, 50, 18)
    this.ctx.quadraticCurveTo(44, 10, 42, -2)
    this.ctx.fill()

    this.ctx.fillStyle = '#4A3525'
    this.ctx.beginPath()
    this.ctx.moveTo(-12, 35)
    this.ctx.quadraticCurveTo(0, 60, 12, 35)
    this.ctx.quadraticCurveTo(0, 48, -12, 35)
    this.ctx.fill()

    this.ctx.strokeStyle = '#3A2A1A'
    this.ctx.lineWidth = 0.7
    for (const rx of [-6, -2, 2, 6]) {
      this.ctx.beginPath()
      this.ctx.moveTo(rx * 0.5, 38)
      this.ctx.quadraticCurveTo(rx * 0.2, 52, rx * 0.8, 58)
      this.ctx.stroke()
    }

    this.#drawEye(-13, -18)
    this.#drawEye(13, -18)

    const mouthY = 9
    const baseW = 16
    const baseH = baseW * 0.6
    const pulse = Math.sin(mouthPhase) * 3
    const mw = baseW + pulse
    const mh = baseH + pulse * 0.6

    this.ctx.strokeStyle = '#C4A882'
    this.ctx.lineWidth = 2.5
    this.ctx.beginPath()
    this.ctx.ellipse(0, mouthY, mw, mh, 0, 0, Math.PI * 2)
    this.ctx.stroke()

    this.ctx.fillStyle = '#E0CCB0'
    this.ctx.beginPath()
    this.ctx.ellipse(0, mouthY, mw - 5, mh - 3, 0, 0, Math.PI * 2)
    this.ctx.fill()

    this.ctx.fillStyle = '#7B5B4B'
    this.ctx.beginPath()
    this.ctx.ellipse(0, mouthY, mw - 9, mh - 6, 0, 0, Math.PI * 2)
    this.ctx.fill()

    this.ctx.strokeStyle = '#8B7B6B'
    this.ctx.lineWidth = 1.2
    this.ctx.beginPath()
    this.ctx.moveTo(-14, 3)
    this.ctx.quadraticCurveTo(-22, 12, -18, 18)
    this.ctx.stroke()
    this.ctx.beginPath()
    this.ctx.moveTo(-11, 7)
    this.ctx.quadraticCurveTo(-17, 14, -14, 20)
    this.ctx.stroke()
    this.ctx.beginPath()
    this.ctx.moveTo(14, 3)
    this.ctx.quadraticCurveTo(22, 12, 18, 18)
    this.ctx.stroke()
    this.ctx.beginPath()
    this.ctx.moveTo(11, 7)
    this.ctx.quadraticCurveTo(17, 14, 14, 20)
    this.ctx.stroke()

    this.ctx.restore()
  }

  #drawEye(x, y) {
    this.ctx.fillStyle = '#F8F8F0'
    this.ctx.beginPath()
    this.ctx.ellipse(x, y, 9, 11, 0, 0, Math.PI * 2)
    this.ctx.fill()

    this.ctx.strokeStyle = '#332211'
    this.ctx.lineWidth = 1
    this.ctx.stroke()

    this.ctx.fillStyle = '#111'
    this.ctx.beginPath()
    this.ctx.arc(x, y + 2, 5, 0, Math.PI * 2)
    this.ctx.fill()

    this.ctx.fillStyle = 'white'
    this.ctx.beginPath()
    this.ctx.arc(x - 2, y - 3, 2.5, 0, Math.PI * 2)
    this.ctx.fill()
  }
}
