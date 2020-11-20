const diacritics = require("diacritics").remove;
const FuzzySet = require("fuzzyset.js");

const checkArtistName = ({ artistName, msg }) => {
  // if (artistName === msg) {
  //     return true;
  // }
  // return false;

  let checkA = cleanInput(artistName);
  let checkU = cleanInput(msg);

  const ref = FuzzySet([checkA]);
  const refResult = ref.get(checkU);
  if (!refResult || !refResult[0] || !refResult[0][0]) {
    return false;
  }
  const probability = refResult[0][0];

  //   console.log("probability", probability);

  return probability >= 0.9;
  //   return checkA === checkU;
};

// const checkArtistName = ({ artistName, msg }) => {
//   const ref = FuzzySet([artistName]);
//   const probability = ref.get(msg)[0][0];

//   console.log("probability", probability);

//   return probability >= 0.9;
// };

const checkTrackName = ({ trackName, msg }) => {
  let checkT = cleanInput(trackName);
  let checkU = cleanInput(msg);

  const ref = FuzzySet([checkT]);
  const refResult = ref.get(checkU);
  if (!refResult || !refResult[0] || !refResult[0][0]) {
    return false;
  }
  const probability = refResult[0][0];

  //   console.log("probability", probability);

  return probability >= 0.9;
  return checkT === checkU;
};

// const checkTrackName = ({ trackName, msg }) => {
//     const ref = FuzzySet([trackName]);
//     const probability = ref.get(msg)[0][0];
//   console.log("probability", probability);
//     return probability >= 0.9;
// };

const cleanInput = (str) => {
  str = str.toLowerCase().trim();
  str = str.replace(/\s{2,}/g, " ");

  str = str.replace(/(\'|\.)/g, " ");

  str = diacritics(str);

  str = str.trim();

  return str;
};

// console.log(cleanInput("Spring Rollin"));
// console.log(cleanInput("Harris  Heller"));
// console.log(cleanInput("   Harris  Heller  "));
// console.log(cleanInput("Claude François"));

// console.log(
//   "check",
//   checkArtistName({ artistName: "Harris Heller", msg: "harris heller" })
// );
// console.log(
//   "check",
//   checkArtistName({ artistName: "Harris Heller", msg: "harris    heller  " })
// );
// console.log(
//   "check",
//   checkArtistName({ artistName: "Harris Heller", msg: "harris héller" })
// );
// console.log(
//   "check",
//   checkArtistName({ artistName: "Harris Heller", msg: "je m'adventurais" })
// );

// console.log(
//   "check",
//   checkTrackName({ trackName: "Harris Heller", msg: "celine dion" })
// );

module.exports = {
  checkArtistName,
  checkTrackName,
};
