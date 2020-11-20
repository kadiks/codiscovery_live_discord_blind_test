// Get Discord token
// Connect to Discord
// Connect to voice channel
// Listen to all messages
// - Filter by channel
// - Filter by people vs. bot
// - Give special access to owner
// Load all music
// Clean output to be recognized by user

require("dotenv").config();

const Discord = require("discord.js");

const fetchTracks = require("./fetchTracks");
const { checkArtistName, checkTrackName } = require("./check");

const { DISCORD_TOKEN } = process.env;

const client = new Discord.Client();

let connection = null;
let dispatcher = null;
let hasDispatched = false;
let tracks = [];
let track = null;
let isGameStarted = false;
let canAnswerArtist = false;
let canAnswerTitle = false;
let waitingForNextSong = true;
let scores = {};

const onMessage = (message) => {
  const userMsg = message.content.trim();
  if (message.author.bot === true) {
    return;
  }
  if (message.channel.name !== "games") {
    return;
  }
  if (message.author.username === "jenaiccambre") {
    if (
      isGameStarted === true &&
      (canAnswerArtist === true || canAnswerTitle === true)
    ) {
      if (userMsg === "!next") {
        console.log("Next song by owner");
        //   connection.play(null);
        playNextSong(message);
      }
    }
  }

  if (isGameStarted === false) {
    if (userMsg.startsWith("!start") === true) {
      isGameStarted = true;
      //   console.log("!Start command");
      playNextSong(message);
    }
  } else {
    if (userMsg === "!score") {
      displayScore(message);
    }
    if (canAnswerArtist === true) {
      const artistName = track.artists[0];

      if (checkArtistName({ artistName, msg: userMsg }) === true) {
        canAnswerArtist = false;
        message.channel.send(
          `${message.author} a trouvé l'artiste : ${track.artists[0]}`
        );
        addScore(message.author.username, 1);
      }
    }
    if (canAnswerTitle === true) {
      const trackName = track.name;
      if (checkTrackName({ trackName, msg: userMsg }) === true) {
        canAnswerTitle = false;
        message.channel.send(
          `${message.author} a trouvé le titre : ${track.name}`
        );
        addScore(message.author.username, 3);
      }
    }

    if (
      canAnswerTitle === false &&
      canAnswerArtist === false &&
      waitingForNextSong === false
    ) {
      waitingForNextSong = true;
      playNextSong(message);
    }
  }
};

const onReady = async () => {
  console.log(`Logged in as ${client.user.tag}`);

  tracks = await fetchTracks();
  console.log("Tracks have been loaded");
  //   console.log("tracks", tracks);
  //   console.log("client.channels", client.channels.cache);

  let voiceChannel = null;

  client.channels.cache.forEach((channel) => {
    // console.log("channel", channel);
    if (channel.type === "voice" && channel.name === "General") {
      voiceChannel = channel;
    }
  });

  if (voiceChannel === null) {
    console.log("This channel does not exist");
    return;
  }

  voiceChannel
    .join()
    .then((connect) => {
      console.log("Connected to voice channel");
      connection = connect;
      //   connect.play(
      //     "https://p.scdn.co/mp3-preview/bf0eafb574172ad8548430e9052f935062b7fb99?cid=7b1fc9ad7b5d4197a17901f7b62677e0"
      //   );
    })
    .catch((e) => {
      console.log("ERROR:", e);
    });
};

const addScore = (username, points) => {
  if (scores.hasOwnProperty(username) === false) {
    scores[username] = 0;
  }
  scores[username] += points;
};

const giveAnswer = (message) => {
  canAnswerArtist = false;
  canAnswerTitle = false;
  waitingForNextSong = true;
  playNextSong(message);
};

const playNextSong = (message) => {
  message.channel.send(
    "La prochaine va démarrer dans le voice channel dans 5 secondes"
  );
  const randIndex = Math.floor(Math.random() * tracks.length);
  console.log("randIndex", randIndex);
  track = tracks[randIndex];

  console.log("track", track);
  setTimeout(() => {
    canAnswerArtist = true;
    canAnswerTitle = true;
    waitingForNextSong = false;
    dispatcher = connection.play(track.preview_url);
    if (hasDispatched === false) {
      dispatcher.on("finish", () => {
        console.log("Song has finished");
        giveAnswer(message);
      });
    }
  }, 5000);
};

const displayScore = (message) => {
  /**
   * {
   *   jenaiccambre: 34,
   *   roni: 422
   * }
   *
   * [
   *      ['jenaiccambre', 34],
   *      ['roni', 422],
   * ]
   *
   *
   * * [
   *      ['roni', 422],
   *      ['jenaiccambre', 34],
   * ]
   *
   */

  const users = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const embed = {
    title: "Les scores du moment",
    fields: users.map((u) => ({
      name: u[0],
      value: u[1],
      inline: false,
    })),
  };

  message.channel.send({ embed });
};

client.on("ready", onReady);
client.on("message", onMessage);

client.login(DISCORD_TOKEN);
