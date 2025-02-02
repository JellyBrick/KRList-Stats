/**
 * Copyright (C) 2021 despenser08
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { Command } from "discord-akairo";
import { Message } from "discord.js";

export default class extends Command {
  constructor() {
    super("독도", {
      aliases: [
        "독도",
        "dokdo",
        "dok",
        "evaluate",
        "eval",
        "이발",
        "execute",
        "exec",
        "실행"
      ],
      fullDescription: {
        content: "wonderlandpark님이 개발하신 디스코드 봇 디버깅 툴"
      },
      ownerOnly: true
    });
  }

  public async exec(message: Message) {
    this.client.dokdo.options.prefix = message.util.parsed.prefix;
    return this.client.dokdo.run(message);
  }
}
