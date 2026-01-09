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

// prettier-ignore
export const DEFAULT_FACES = [
  '🐨', '🐭', '🐮', '🐯', '🐰', '🐱', '🐵', '🐶', '🐷', '🐸', '🐹', '🐺', '🐻', '🐻‍❄️', '🐼',
  '😸', '😹', '😺', '😻', '😼', '😽', '🦁', '🦊',
]

export class Aquarium {
  constructor(
    canvas,
    tickerId,
    { inactivityLimit = 3600, snowflakeCount = 50, faces = DEFAULT_FACES, corsProxy = '' } = {}
  ) {
    this.ticker = new Ticker(tickerId, {
      initPostings: 300,
      initThreads: 2,
      corsProxy: corsProxy,
      sessionId: createSessionId(),
    })
    this.ticker.onposting = console.log
  }

  async start() {
    await this.ticker.connect()
  }
}
