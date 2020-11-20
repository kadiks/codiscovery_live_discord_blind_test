const axios = require("axios");

const fetchTracks = async () => {
  const { data } = await axios.get("http://localhost:3001");

  return data;
};

module.exports = fetchTracks;
