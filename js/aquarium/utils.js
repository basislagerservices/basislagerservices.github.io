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

/** Sleep for `ms` milliseconds. */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Retry fetch with exponential backoff: scale * base**n * (1 + jitter * RANDOM) */
export async function retryFetch(url, { maxRetries = 10, base = 2, scale = 1000, jitter = 0.2, fetchArgs = {} } = {}) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await fetch(url, fetchArgs)
      if (result.ok) return result
    } catch (err) {
      console.error(err)
    }

    let delay = scale * base ** i * (1 + jitter * Math.random())
    console.warn(`Request failed. Retrying in ${delay} ms...`)
    await sleep(delay)
  }

  throw new Error('Request failed')
}

/** Check some properties to determine if we are in a debug session. */
export function isDebugSession() {
  return (
    location.hostname == '0.0.0.0' ||
    location.hostname == '127.0.0.1' ||
    location.hostname == 'localhost' ||
    location.hostname == '::1'
  )
}

/** Create a random session ID string. */
export function createSessionId() {
  return parseInt(2 ** 32 * Math.random())
    .toString(16)
    .padStart(8, '0')
}

/** Get a random element from an array. */
export function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)]
}
