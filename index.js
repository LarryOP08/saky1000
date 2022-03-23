const Discord = require("discord.js")
const client = new Discord.Client({
    intents: ["GUILD_VOICE_STATES", "GUILD_MEMBERS", "GUILD_MESSAGES", "GUILDS"]
})

client.login(process.emv.Token)

client.on("ready", () => {
    console.log("BotONLINE")
})

client.on('ready', () => {
    client.user.setActivity('°dj help', { type: 'WATCHING' });
client.user.setStatus('online') 
})

client.on("messageCreate", message =>{
    if(message.content == "°dj help")
    var embed = new Discord.MessageEmbed()
    .setTitle("Ecco a te la lista dei comandi di DjLarryino:")
    .setDescription(`__°play__= fai partire una canzone.
    __°pause__= stoppa la canzone in riproduzione.
    __°resume__= riattiva la canzone stoppata.
    __°queue__= riproduci una playlist.
    __°skip__= salta una canzone in coda.
    __°previous__= canzone della coda precedente.
    __°stop queue__= stoppa la playlist.`)
    .setColor("PURPLE")
    message.channel.send({embeds:[embed]})
})

const { DisTube } = require("distube")
const { SpotifyPlugin } = require("@distube/spotify")
const { SoundCloudPlugin } = require("@distube/soundcloud")

const distube = new DisTube(client, {
    youtubeDL: false,
    plugins: [new SpotifyPlugin(), new SoundCloudPlugin()],
    leaveOnEmpty: true,
    leaveOnStop: true
})

client.on("messageCreate", message => {
    if (message.content.startsWith("°play")) {
        const voiceChannel = message.member.voice.channel
        if (!voiceChannel) {
            return message.channel.send("**Devi entrare in un canale vocale.**")
        }

        const voiceChannelBot = message.guild.channels.cache.find(x => x.type == "GUILD_VOICE" && x.members.has(client.user.id))
        if (voiceChannelBot && voiceChannel.id != voiceChannelBot.id) {
            return message.channel.send("**Qualun'altro sta già ascoltando della musica.**")
        }

        let args = message.content.split(/\s+/)
        let query = args.slice(1).join(" ")

        if (!query) {
            return message.channel.send("**Inserisci la canzone che vuoi ascoltare.**")
        }

        distube.play(voiceChannelBot || voiceChannel, query, {
            member: message.member,
            textChannel: message.channel,
            message: message
        })
    }

    if (message.content == "°pause") {
        const voiceChannel = message.member.voice.channel
        if (!voiceChannel) {
            return message.channel.send("**Devi essere in un canale vocale.**")
        }

        const voiceChannelBot = message.guild.channels.cache.find(x => x.type == "GUILD_VOICE" && x.members.has(client.user.id))
        if (voiceChannelBot && voiceChannel.id != voiceChannelBot.id) {
            return message.channel.send("**Qualun'altro sta già ascoltando della musica.**")
        }

        try {
            distube.pause(message)
        } catch {
            return message.channel.send("**Nessuna canzone in riproduzione o canzone già in pausa.**")
        }

        message.channel.send("**Song paused.**")
    }

    if (message.content == "°resume") {
        const voiceChannel = message.member.voice.channel
        if (!voiceChannel) {
            return message.channel.send("**Devi essere in un canale vocale.**")
        }

        const voiceChannelBot = message.guild.channels.cache.find(x => x.type == "GUILD_VOICE" && x.members.has(client.user.id))
        if (voiceChannelBot && voiceChannel.id != voiceChannelBot.id) {
            return message.channel.send("**Qualun'altro sta già ascoltando della musica.**")
        }

        try {
            distube.resume(message)
        } catch {
            return message.channel.send("**Nessuna canzone in riproduzione o canzone già in riproduzione.**")
        }

        message.channel.send("**Song resumed.**")
    }

        if (message.content == "°queue") {
            const voiceChannel = message.member.voice.channel
            if (!voiceChannel) {
    return message.channel.send("**Devi essere in un canale vocale.**")
  }
  const voiceChannelBot = message.guild.channels.cache.find(x => x.type == "GUILD_VOICE" && x.members.has(client.user.id))
  if (voiceChannelBot && voiceChannel.id != voiceChannelBot.id) {
      return message.channel.send("**Qualun'altro sta già ascoltando della musica.**")
  }

  let queue = distube.getQueue(message)

  if (!queue) return message.channel.send("**Coda vuota.**")

  let totPage = Math.ceil(queue.songs.length / 10)
  let page = 1

  let songsList = ""
  for (let i = 10 * (page - 1); i < 10 * page; i++) {
      if (queue.songs[i]) {
          songsList += `${i + 1}. **${queue.songs[i].name.length <= 100 ? queue.songs[i].name : `${queue.songs[i].name.slice(0, 100)}...`}** - ${queue.songs[i].formattedDuration}\r`
      }
  }

  let embed = new Discord.MessageEmbed()
      .addField("Queue", songsList)
      .setFooter({ text: `Page ${page}/${totPage}` })
      .setColor("RANDOM")

  let button1 = new Discord.MessageButton()
      .setLabel("Indietro")
      .setStyle("PRIMARY")
      .setCustomId("indietro")
      .setColor("RANDOM")

  let button2 = new Discord.MessageButton()
      .setLabel("Avanti")
      .setStyle("PRIMARY")
      .setCustomId("avanti")
      .setColor("RANDOM")

  if (page == 1) button1.setDisabled()
  if (page == totPage) button2.setDisabled()

  let row = new Discord.MessageActionRow()
      .addComponents(button1)
      .addComponents(button2)
      .setColor("RANDOM")

  message.channel.send({ embeds: [embed], components: [row] })
      .then(msg => {
          const collector = msg.createMessageComponentCollector()

          collector.on("collect", i => {
              i.deferUpdate()

              if (i.user.id != message.author.id) return i.reply({ content: "**Questo bottone non è tuo.**", ephemeral: true })

              if (i.customId == "indietro") {
                  page--
                  if (page < 1) page = 1
              }
              if (i.customId == "avanti") {
                  page++
                  if (page > totPage) page = totPage
              }

              let songsList = ""
              for (let i = 10 * (page - 1); i < 10 * page; i++) {
                  if (queue.songs[i]) {
                      songsList += `${i + 1}. **${queue.songs[i].name.length <= 100 ? queue.songs[i].name : `${queue.songs[i].name.slice(0, 100)}...`}** - ${queue.songs[i].formattedDuration}\r`
                  }
              }

              let embed = new Discord.MessageEmbed()
                  .addField("Queue", songsList)
                  .setFooter({ text: `Page ${page}/${totPage}` })
                  .setColor("RANDOM")

              let button1 = new Discord.MessageButton()
                  .setLabel("Indietro")
                  .setStyle("PRIMARY")
                  .setCustomId("indietro")
                  .setColor("RANDOM")

              let button2 = new Discord.MessageButton()
                  .setLabel("Avanti")
                  .setStyle("PRIMARY")
                  .setCustomId("avanti")
                  .setColor("RANDOM")

              if (page == 1) button1.setDisabled()
              if (page == totPage) button2.setDisabled()

              let row = new Discord.MessageActionRow()
                  .addComponents(button1)
                  .addComponents(button2)
                  .setColor("RANDOM")

              msg.edit({ embeds: [embed], components: [row] })
          })
      })
}
if (message.content == "°skip") {
    const voiceChannel = message.member.voice.channel
    if (!voiceChannel) {
        return message.channel.send("**Devi essere in un canale vocale.**")
    }

    const voiceChannelBot = message.guild.channels.cache.find(x => x.type == "GUILD_VOICE" && x.members.has(client.user.id))
    if (voiceChannelBot && voiceChannel.id != voiceChannelBot.id) {
        return message.channel.send("**Qualun'altro sta già ascoltando della musica.**")
    }

    try {
        distube.skip(message)
            .catch(() => { return message.channel.send("**Nessuna canzone in riproduzione o canzone successiva non presente.**") })
    } catch {
        return message.channel.send("**Nessuna canzone in riproduzione o canzone successiva non presente.**")
    }

    message.channel.send("**Song skipped.**")
}

if (message.content == "°previous") {
    const voiceChannel = message.member.voice.channel
    if (!voiceChannel) {
        return message.channel.send("**Devi essere in un canale vocale.**")
    }

    const voiceChannelBot = message.guild.channels.cache.find(x => x.type == "GUILD_VOICE" && x.members.has(client.user.id))
    if (voiceChannelBot && voiceChannel.id != voiceChannelBot.id) {
        return message.channel.send("**Qualun'altro sta già ascoltando della musica.**")
    }

    try {
        distube.previous(message)
            .catch(() => { return message.channel.send("**Nessuna canzone in riproduzione o canzone precedente non presente.**") })
    } catch {
        return message.channel.send("**Nessuna canzone in riproduzione o canzone precedente non presente.**")
    }

    message.channel.send("**Previous song.**")
}

if (message.content == "°stop queue") {
    const voiceChannel = message.member.voice.channel
    if (!voiceChannel) {
        return message.channel.send("**Devi essere in un canale vocale.**")
    }

    const voiceChannelBot = message.guild.channels.cache.find(x => x.type == "GUILD_VOICE" && x.members.has(client.user.id))
    if (voiceChannelBot && voiceChannel.id != voiceChannelBot.id) {
        return message.channel.send("**Qualun'altro sta già ascoltando della musica.**")
    }

    try {
        distube.stop(message)
            .catch(() => { return message.channel.send("**Nessuna canzone in riproduzione.**") })
    } catch {
        return message.channel.send("**Nessuna canzone in riproduzione.**")
    }

    message.channel.send("**Queue stopped.**")
}
    })


distube.on("addSong", (queue, song) => {
    let embed = new Discord.MessageEmbed()
        .setTitle("Song added")
        .addField("Song", song.name)
        .setColor("RANDOM")

    queue.textChannel.send({ embeds: [embed] })
})

distube.on("playSong", (queue, song) => {
    let embed = new Discord.MessageEmbed()
        .setTitle("Playing song...")
        .addField("Song", song.name)
        .addField("Requested by", song.user.toString())
        .setColor("RANDOM")

    queue.textChannel.send({ embeds: [embed] })
})

distube.on("searchNoResult", (message, query) => {
    message.channel.send("**Canzone non trovata.**")
})
