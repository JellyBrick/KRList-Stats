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

import axios, { AxiosError } from "axios";
import { Argument, Command } from "discord-akairo";
import { Guild, Message, Util } from "discord.js";
import { KoreanlistEndPoints } from "../../lib/constants";
import Server from "../../lib/database/models/Server";
import convert from "../../lib/utils/convertRawToType";
import isInterface from "../../lib/utils/isInterface";
import KRLSEmbed from "../../lib/utils/KRLSEmbed";

export default class extends Command {
  constructor() {
    super("서버수집", {
      aliases: [
        "서버수집",
        "servercollect",
        "collectserver",
        "수집서버",
        "servertrack",
        "서버추적"
      ],
      description: {
        content: "해당 서버의 정보를 수집합니다.",
        usage: "<서버>"
      },
      args: [
        {
          id: "guildOrId",
          type: Argument.union("guild", "string"),
          prompt: { start: "서버를 입력해 주세요." }
        }
      ]
    });
  }

  public async exec(
    message: Message,
    { guildOrId }: { guildOrId: Guild | string }
  ) {
    const msg = await message.reply("잠시만 기다려주세요...");

    const id = guildOrId instanceof Guild ? guildOrId.id : guildOrId;

    await axios
      .get(KoreanlistEndPoints.API.server(id))
      .then(async ({ data }) => {
        const server = convert.server(data.data);

        const serverDB = await Server.findOneAndUpdate(
          { id: server.id },
          {},
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        if (serverDB.track)
          return msg.edit(
            `**${Util.escapeBold(
              server.name
            )}** 수집은 이미 시작되었습니다. 새로 등록하셨다면 1분을 기다려주세요.`
          );

        await serverDB.updateOne({ track: true });

        return msg.edit(
          `1분마다 **${Util.escapeBold(server.name)}** 수집이 시작됩니다.`
        );
      })
      .catch((e) => {
        if (isInterface<AxiosError>(e, "response")) {
          switch (e.response.status) {
            case 404:
              return msg.edit({
                content: null,
                embeds: [
                  new KRLSEmbed().setDescription(
                    `해당 서버를 찾을 수 없습니다. (입력: \`${Util.escapeInlineCode(
                      guildOrId.toString()
                    )}\`)\n${e}`
                  )
                ]
              });

            case 400:
              return msg.edit({
                content: null,
                embeds: [
                  new KRLSEmbed().setDescription(
                    `잘못된 입력입니다. 다시 시도해주세요. (입력: \`${Util.escapeInlineCode(
                      guildOrId.toString()
                    )}\`)\n${e}`
                  )
                ]
              });

            default:
              this.client.logger.warn(
                `FetchError: Error occurred while fetching server ${id}:\n${e.message}\n${e.stack}`
              );
              return msg.edit({
                content: null,
                embeds: [
                  new KRLSEmbed().setDescription(
                    `해당 서버를 가져오는 중에 에러가 발생하였습니다. (입력: \`${Util.escapeInlineCode(
                      guildOrId.toString()
                    )}\`)\n${e}`
                  )
                ]
              });
          }
        } else {
          this.client.logger.warn(
            `Error: Error occurred while fetching bot ${id}:\n${e.message}\n${e.stack}`
          );
          return msg.edit({
            content: null,
            embeds: [
              new KRLSEmbed().setDescription(
                `해당 서버를 가져오는 중에 에러가 발생하였습니다. (입력: \`${Util.escapeInlineCode(
                  guildOrId.toString()
                )}\`)\n${e}`
              )
            ]
          });
        }
      });
  }
}
