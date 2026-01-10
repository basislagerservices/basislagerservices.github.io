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

import { retryFetch, sleep, Logging } from './utils.js'

/** Get the URL for the live ticker hub. */
function hubUrl(path) {
  path = path.startsWith('/') ? path : `/${path}`
  return new URL('https://live.derstandard.at/jetzt/signalr/hub' + path)
}

/** Get the URL for the regular ticker API. */
function apiUrl(path) {
  path = path.startsWith('/') ? path : `/${path}`
  return new URL('https://www.derstandard.at/jetzt/api' + path)
}

/** Connect to a ticker and monitor it. */
export class Ticker extends Logging {
  static #CONNECTION_TIMEOUT = 600 * 1000
  static #RECONNECT_JITTER = 0.5
  static #CONNECTION_POLL_INTERVAL = 30 * 1000
  static #INIT_POSTINGS_DELAY = 1000

  constructor(tickerId, { initPostings = 100, initThreads = 10, corsProxy = '', sessionId = null } = {}) {
    super()
    this.tickerId = tickerId
    this.webSocket = null
    this.initPostings = initPostings
    this.initThreads = initThreads
    this.corsProxy = corsProxy && !corsProxy.endsWith('/') ? `${corsProxy}/` : corsProxy
    this.lastActivity = Date.now()
    this.intervalId = null
    this.fetchConfig = { scale: 5000, fetchArgs: { headers: { 'Session-ID': sessionId } } }
  }

  /** Event handler for received postings. */
  onposting = null

  /** Event handler for vote updates. */
  onvoteupdate = null

  /**
   * Establish a connection to the ticker and start monitoring it.
   * This function also runs static initialization from existing postings.
   *
   * It should be safe to call this multiple times, in which case any existing
   * connection is closed.
   */
  async connect() {
    this.#closeWebSocket()
    await this.#connectWebSocket()
    await this.#initializePostings()

    if (this.intervalId === null)
      this.intervalId = setInterval(async () => this.#checkTimeout(), Ticker.#CONNECTION_POLL_INTERVAL)
  }

  async #checkTimeout() {
    const timeout = Ticker.#CONNECTION_TIMEOUT * (1 + Ticker.#RECONNECT_JITTER * Math.random())
    if (this.webSocket === null) {
      this.warn('Socket not connected. Connecting now...')
      await this.#connectWebSocket()
    } else if (Date.now() > this.lastActivity + timeout) {
      this.warn('Connection timed out. Closing...')
      this.#closeWebSocket()
    }
  }

  /** Establish a connection to the ticker websocket. */
  async #connectWebSocket() {
    const negUrl = this.corsProxy + hubUrl('/negotiate')
    const connResp = await retryFetch(negUrl, this.fetchConfig)
    const connData = await connResp.json()

    const payload = {
      transport: 'webSockets',
      clientProtocol: '1.5',
      lbid: this.tickerId,
      v: '1.0.8907.26570',
      connectionToken: connData.ConnectionToken,
      connectionData: '[{"name": "reporthub"}]',
      tid: '10',
    }
    let connUrl = hubUrl('/connect')
    connUrl.protocol = 'wss:'
    connUrl = connUrl + '?' + new URLSearchParams(payload)
    const ws = new WebSocket(connUrl)

    // Enable the web socket on the server side when it is connected.
    ws.onopen = async (_event) => {
      let startUrl = new URL(this.corsProxy + hubUrl('/start'))
      startUrl = startUrl + '?' + new URLSearchParams(payload)
      await retryFetch(startUrl, this.fetchConfig)
    }

    // Parse message and call appropriate handlers with sanitized messages.
    ws.onmessage = (event) => this.#handleLiveMessage(event)
    this.webSocket = ws
  }

  #closeWebSocket() {
    if (this.webSocket === null) return
    this.webSocket.close()
    this.webSocket.onmessage = null
    this.webSocket.onopen = null
    this.webSocket = null
  }

  #handleLiveMessage(event) {
    const data = JSON.parse(event.data)
    for (const ea of data.M || []) {
      if (ea.M === 'addPostings' || ea.M === 'updateVotes') {
        this.lastActivity = Date.now()
      }
      if (ea.M === 'addPostings' && this.onposting !== null) {
        for (const eb of ea.A || []) {
          for (const ec of eb) {
            this.#handlePosting(ec, 'live')
          }
        }
      } else if (ea.M === 'updateVotes' && this.onvoteupdate !== null) {
        for (const eb of ea.A || []) {
          for (const ec of eb) {
            this.#handleVoteUpdate(ec)
          }
        }
      }
    }
  }

  /** Get at most `initPostings` from the last `initThreads` threads. */
  async #initializePostings() {
    if (this.onposting === null || this.initPostings === 0 || this.initThreads === 0) {
      return
    }

    const threadUrl = this.corsProxy + apiUrl(`/redcontent?id=${this.tickerId}&ps=${this.initThreads}`)
    const threadResp = await retryFetch(threadUrl, this.fetchConfig)
    const threadData = await threadResp.json()

    let postingCount = 0
    for (const thread of threadData.rcs.slice(0, this.initThreads)) {
      const threadId = thread.id
      let postUrl = this.corsProxy + apiUrl(`/postings?objectId=${this.tickerId}&redContentId=${threadId}`)
      while (true) {
        const postResp = await retryFetch(postUrl, this.fetchConfig)
        const postings = (await postResp.json()).p
        postingCount += postings.length

        for (const p of postings) {
          this.#handlePosting(p, 'history')
        }

        if (postings.length === 0 || postingCount > this.initPostings) break

        const lastId = postings[postings.length - 1].pid
        postUrl =
          this.corsProxy +
          apiUrl(`/postings?objectId=${this.tickerId}&redContentId=${threadId}&skipToPostingId=${lastId}`)
        await sleep(Ticker.#INIT_POSTINGS_DELAY)
      }
      if (postingCount > this.initPostings) break
    }
  }

  #handlePosting(e, source) {
    const posting = {
      user_id: e.cid,
      user: e.cn,
      title: e.hl,
      message: e.tx,
      ticker_id: e.oid,
      thread_id: e.rid,
      posting_id: e.pid,
      parent_id: e.ppid,
      published: new Date(e.cd),
      source: source,
    }
    this.debug(posting)
    this.onposting(posting)
  }

  #handleVoteUpdate(e) {
    const update = {
      ticker_id: e.oid,
      thread_id: e.rid,
      posting_id: e.pid === undefined ? null : e.pid,
      positive: e.pvc,
      negative: e.nvc,
    }
    this.onvoteupdate(update)
  }
}
