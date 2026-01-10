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

import { Ticker } from './ticker.js'
import { createSessionId } from './utils.js'

/**
 * Class to encapsulate animation and ticker connection logic.
 *
 * Layers are drawn onto a canvas and their appropriate posting handlers are called
 * when a new posting is published in the ticker.
 */
export class TickerAnimation {
  constructor(canvas, tickerId, layers, { corsProxy = '', initPostings = 100, initThreads = 2 } = {}) {
    this.canvas = canvas
    this.layers = layers
    this.ctx = this.canvas.getContext('2d')

    this.canvasWidth = canvas.width
    this.canvasHeight = canvas.height

    this.ticker = new Ticker(tickerId, {
      initPostings: initPostings,
      initThreads: initThreads,
      corsProxy: corsProxy,
      sessionId: createSessionId(),
    })
    this.ticker.onposting = (p) => this.#handlePosting(p)

    window.addEventListener('resize', () => this.#resize())
    this.#resize()
  }

  /** Connect to the ticker and start animation loop. */
  async start() {
    this.#animate()
    await this.ticker.connect()
  }

  #handlePosting(p) {
    for (const layer of this.layers) {
      layer.handlePosting(p)
    }
  }

  #animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    for (const layer of this.layers) {
      layer.animate()
    }
    requestAnimationFrame(() => this.#animate())
  }

  #resize() {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
    for (const layer of this.layers) {
      layer.resize(this.canvasWidth, this.canvasHeight, this.canvas.width, this.canvas.height)
    }
    this.canvasWidth = this.canvas.width
    this.canvasHeight = this.canvas.height
  }
}
