import Discord from "discord.js";
import dotenv from "dotenv";
import opggScrape from "opgg-scrape";
import encoding from "encoding-japanese";

dotenv.config();

const client = new Discord.Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async message => {
  const fullMessage = message.content.trim().split(/ |　/);

  if (message.author.bot)          {return false};
  if (fullMessage[0] !== ".quinn") {return false};

  if (fullMessage.length === 1) {

    checkUserAccount(message, encoding.urlEncode(message.author.username))
    .then(result => result ? generateAndSendRichEmbed(result, message) : null)
    .catch(console.error);

  } else {

    const summonerName = fullMessage.splice(1, fullMessage.length).join(" ");

    checkUserAccount(message, encoding.urlEncode(summonerName))
    .then(result => result ? generateAndSendRichEmbed(result, message) : null)
    .catch(console.error);

  };
});

async function checkUserAccount (message, summoner) {

  return await opggScrape.getStats(summoner, {region: 'jp', refresh: true})
  .catch(() => {
    message.channel.send("Could not find user.");
    return;
  });
};

async function generateAndSendRichEmbed (data, message) {
  console.log(data);
  const embed = new Discord.RichEmbed()
        .setAuthor (data.name, data.avatarURL, `https://jp.op.gg/summoner/userName=${encoding.urlEncode(data.name)}`)
        .addField ("Summoner level", data.level, true);

  if (data.rank !== "Unranked") {embed.addField ("Rank", `${message.guild.emojis.find(emoji => emoji.name === data.rank.trim().split(" ")[0].toLowerCase())} ${data.rank.trim().split(" ")[0]} ${data.rank.trim().split(" ").length > 1 ? data.rank[1].charAt(0).toUpperCase() + data.rank.split(" ")[1].slice(1) : ""} (${data.rankedLP.toUpperCase()})`, true)};
  if (data.KDARatio !== "")     {embed.addField ("KDA ratio", `${data.KDARatio} (Kill: ${data.KDA.kills}, Death: ${data.KDA.deaths}, Assists: ${data.KDA.assists})`, true)};

  message.channel.send(embed);
}

client.login(process.env.BOT_TOKEN);
client.on('error', console.error);
