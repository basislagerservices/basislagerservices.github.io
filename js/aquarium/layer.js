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

import { Logging } from './utils.js'

/**
 * Base class for animation layers.
 *
 * Public properties:
 * - canvas: Animation canvas
 * - ctx: Animation context
 *
 */
export class Layer extends Logging {
  constructor(canvas) {
    super()
    this.canvas = canvas
    this.ctx = this.canvas.getContext('2d')
  }

  /** Draw the current state onto the canvas. */
  animate() {}

  /**
   * Update the state when a posting arrives.
   *
   * A posting has at least the following fields:
   * - user: Name of the user as a string
   * - published: Time the posting was published as a `Date` object
   * - title: Headline of the posting
   * - message: Content of the message
   * - ticker_id: ID of the ticker where it was posted
   * - thread_id: ID of the thread where it was posted
   * - posting_id: ID of the posting
   * - parent_id: ID of the parent posting
   *
   * Some fields might be `null` or an empty string.
   */
  handlePosting(p) {}

  /**
   * Update the state when the canvas is resized.
   *
   * The arguments specify the width and height before and after the resize.
   * When this function is called, the canvas already has the new size.
   */
  resize(oldWidth, oldHeight, newWidth, newHeight) {}
}
