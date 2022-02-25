// Join URL: https://discord.com/oauth2/authorize?client_id=946856049661599784&permissions=532576455744&scope=bot

const { Client, Intents } = require('discord.js');
require('dotenv').config()

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });

const WORDLE_REGEX = /Wordle \d+ \d\/\d\*?/g;
const WORDLE_EXTRACT_DAY = / \d+ /;

function sendWelcomeMessage(thread, userId) {
  thread.send(`Welcome and congrats <@${userId}>!`);
}

// When the client is ready, run this code (only once)
client.once('ready', () => {
  console.log('Ready!');
  client.on('messageCreate', message => {
    if (message.author.bot) return;

    const match = message.content.match(WORDLE_REGEX);
    if (match) {
      const matchingScore = match[0];
      try {
        const day = matchingScore.match(WORDLE_EXTRACT_DAY)[0].trim();
        const threadName = `Wordle Solvers ${day}`;
        const canCreatePrivateThreads = message.guild.premiumTier.valueOf() >= 2;
        const threadType = canCreatePrivateThreads ? 'GUILD_PRIVATE_THREAD' : 'GUILD_PUBLIC_THREAD';

        if (message.channel.threads) {
          message.channel.threads.fetchActive().then(threads => {
            const threadEntry = threads.threads.find((thread) => thread.name === threadName);
            if (!threadEntry) {
              message.channel.threads.create({
                name: threadName,
                autoArchiveDuration: 1440,
                type: threadType,
                reason: `Welcome winners of Worlde ${day}`
              }).then(threadChannel => {
                sendWelcomeMessage(threadChannel, message.author.id);
              });
            } else {
              sendWelcomeMessage(threadEntry, message.author.id);
            }
          });
        }
      } catch (e) {
        console.error("Crashed extracting: " + e);
      }
    }
  });
});

// Login to Discord with your client's token
client.login(process.env.DISCORD_BOT_TOKEN);