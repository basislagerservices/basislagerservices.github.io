/*
 * Copyright 2023 Basislager Services
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

import * as utils from './utils.js'
import * as P from './posting.js'

// HTML elements that are added to the main container.
const postleHTML = `
  <!-- Posting -->
  <div id="postle-posting"></div>

  <!-- Guesses -->
  <div>
    <div class="row justify-content-center">
      <div class="fw-bold">
        <div id="postle-guesses"></div>
        <div class="row">
          <div class="col row pe-3 w-100">
            <input type="text" class="form-control" id="postle-user-input" placeholder="Wer hat das geschrieben?">
          </div>
          <div class="col-3 row">
            <button type="button" class="btn btn-primary" id="postle-user-input-submit">Rate</button>
          </div>
        </div>
      </div>
    </div>
  </div>`

const NUMBER_OF_GUESSES = 6
const STORAGE_KEY_GAMES = 'postle.games'
// Used to invalidate the storage if something changes.
const STORAGE_VERSION = '0'
const STORAGE_KEY_VERSION = 'postle.version'

// Populate the empty posting field and create the input field and empty
// guesses.
function setupUI(container, posting, users) {
  // Add basic elements to the main container.
  container.innerHTML = postleHTML

  // Render the posting.
  P.renderPosting(document.getElementById('postle-posting'), posting)

  // Dynamically create fields for tries to avoid hardcoding everything.
  let guesses = document.getElementById('postle-guesses')
  for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
    let entry = `<div class="row row-guess my-2 py-2 ps-3 bg-guess rounded" id="postle-guess-${i}"></div>`
    guesses.insertAdjacentHTML('beforeend', entry)
  }

  // Setup autocomplete for user input.
  let userInput = document.getElementById('postle-user-input')
  var autocomplete = new Awesomplete(userInput, {
    list: users.map((u) => [utils.escapeHTML(u), u]),
    maxItems: 15,

    // See:
    // https://github.com/LeaVerou/awesomplete/issues/17071#issuecomment-507955204
    container: function (input) {
      input.parentNode.className = input.parentNode.className + ' awesomplete'
      input.parentNode.style.display = 'block'
      return input.parentNode
    },
  })
}

function GameState(posting) {
  this.guesses = []
  this.solved = false
  this.max_guesses = NUMBER_OF_GUESSES
  this.solution = posting
}

function renderState(state) {
  // Set guesses.
  for (let i = 0; i < state.guesses.length; i++) {
    let element = document.getElementById('postle-guess-' + i)
    element.innerHTML = state.guesses[i]
  }
  // Set state of the input field.
  let userInput = document.getElementById('postle-user-input')
  if (state.solved) {
    userInput.disabled = true
    userInput.placeholder = ''
    userInput.classList.add('bg-success')
    userInput.value = 'Lösung: ' + state.solution.user
    userInput.classList.add('fw-bold', 'text-muted')
  } else if (state.guesses.length === state.max_guesses) {
    userInput.disabled = true
    userInput.placeholder = ''
    userInput.classList.add('bg-danger')
    userInput.value = 'Lösung: ' + state.solution.user
    userInput.classList.add('fw-bold', 'text-muted')
  }
}

export function Postle(container, postings, users) {
  let date = new Date().toISOString().split('T')[0]
  let posting = postings[date]

  setupUI(container, posting, users)

  // Setup the game dictionary. This contains all games in storage.
  let storageVersion = localStorage.getItem(STORAGE_KEY_VERSION)
  if (storageVersion != STORAGE_VERSION) localStorage.removeItem(STORAGE_KEY_GAMES)
  localStorage.setItem(STORAGE_KEY_VERSION, STORAGE_VERSION)

  let games = {}
  let storage = localStorage.getItem(STORAGE_KEY_GAMES)
  if (storage == null) {
    localStorage.setItem(STORAGE_KEY_GAMES, JSON.stringify({}))
  } else {
    games = JSON.parse(storage)
  }

  if (!(date in games)) games[date] = new GameState(posting)
  renderState(games[date])

  // Handle submissions in the user input field and the button clicks.
  let userInput = document.getElementById('postle-user-input')
  let userSubmit = document.getElementById('postle-user-input-submit')

  function submitGuess() {
    let guess = userInput.value
    let g = games[date]
    if (users.includes(guess) && !g.solved && g.guesses.length < g.max_guesses) {
      userInput.value = ''
      games[date].guesses.push(guess)
      if (posting.user == guess) games[date].solved = true

      localStorage.setItem(STORAGE_KEY_GAMES, JSON.stringify(games))
      renderState(games[date])
    }
  }
  userInput.onkeypress = function (e) {
    if (e.key === 'Enter') submitGuess()
  }
  userSubmit.onclick = submitGuess
}
