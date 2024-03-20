/*
 * Copyright 2023-2024 Basislager Services
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

import * as utils from './utils.js';


// Template for a full or partial posting.
const postingHTML = `
  <div class="row justify-content-center mt-2 position-relative">
    <div class="p-3 bg-posting rounded text-start">
      <div class="row">
        <div class="col fw-bold text-start posting-username small"></div>
        <div class="col text-end posting-rating small"></div>
      </div>
      <div class="row">
        <div class="col text-start posting-status small"></div>
      </div>
      <div class="row">
        <div class="col text-muted text-start posting-published small"></div>
      </div>
      <hr>
      <div class="row">
        <div class="col fw-bold text-start posting-title"></div>
      </div>
      <div class="row">
        <div class="col posting-message"></div>
      </div>
    </div>
    <a class="stretched-link posting-link" target="_blank"></a>
  </div>
`

/** Create a permalink for a ticker posting. */
export function createTickerLink(tickerID, threadID, postingID) {
  return 'https://derstandard.at/jetzt/livebericht/' + tickerID + '/' + threadID + '/' + postingID;
}

/** Create a permalink for a forum posting. */
export function createForumLink(articleID, postingID) {
  return 'https://www.derstandard.at/story/' + articleID + '#posting-' + postingID;
}

/**
 * Render a posting inside a container. The content of the container is replaced.
 *
 * The `posting` argument can contain the following fields:
 * - username: Name of the user
 * - status: Status message of the user
 * - published: Date the posting was published
 * - upvotes: Number of upvotes
 * - downvotes: Number of downvotes
 * - title: Title of the posting
 * - message: Message of the posting
 */
export function renderPosting(container, posting, hide) {
  container.innerHTML = postingHTML;

  if ('href' in posting)
    container.getElementsByClassName('posting-link')[0].href = posting["href"];

  if ('username' in posting)
    container.getElementsByClassName('posting-username')[0].innerHTML = posting['username'];

  if ('status' in posting)
    container.getElementsByClassName('posting-status')[0].innerHTML = posting['status'];

  if ('published' in posting)
    container.getElementsByClassName('posting-published')[0].innerHTML = posting['published'];

  if ('upvotes' in posting || 'downvotes' in posting) {
    let rating = (posting['downvotes'] || 0) + ' 🟥 🟩 ' + (posting['upvotes'] || 0);
    container.getElementsByClassName('posting-rating')[0].innerHTML = rating;
  }

  if ('title' in posting)
    container.getElementsByClassName('posting-title')[0].innerHTML = utils.escapeHTML(posting['title']);

  if ('message' in posting)
    container.getElementsByClassName('posting-message')[0].innerHTML = utils.escapeHTML(posting['message']);
}
