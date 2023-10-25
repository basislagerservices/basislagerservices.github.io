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


/**
 * Escape characters used in HTML and replace newlines with <br> tags.
 */
export function escapeHTML(text) {
  if (!text)
    return text;

  // The order here is important to avoid re-escaping characters.
  text = text.replaceAll("&", "&amp;");
  text = text.replaceAll("<", "&lt;");
  text = text.replaceAll(">", "&gt;");
  text = text.replaceAll("\"", "&quot;");
  text = text.replaceAll("\r\n", "<br>");
  text = text.replaceAll("\n", "<br>");

  return text;
};
