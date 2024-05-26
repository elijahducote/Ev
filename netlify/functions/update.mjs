import axios from "axios";
import "dotenv/config";

var payload = [],
poplus = [],
stats,
albums,
sorted,
json,
leng,
i,
cur,
sha,
msgcode,
fyl,
token,
NTH;

exports.handler = async function (event, context) {
try {
await axios.get("https://api.github.com/repos/elijahducote/EV-Website/contents/automation.json",{headers:{"Accept":"application/vnd.github+json","Authorization":`Bearer ${process.env.TOKEN}`,"X-GitHub-Api-Version":"2022-11-28"}})
 .then(response => {
    if (response.status === 200) {
      json = JSON.parse(atob(response.data.content));
      sha = response.data.sha;
    }
    else throw new Error("Uh, oh! " + response.status);
 });
}
catch (error) {
  console.log("Failed fetch",error)
    return {
      statusCode:400,
      headers: {
        "Content-Type": "text/html"
      },
      body: "There was a problem with the GET request: " + error,
    };
}

try {
await axios.post("https://accounts.spotify.com/api/token",`grant_type=refresh_token&refresh_token=${process.env.REFRESH_TOKEN}`,{headers:{"Content-Type":"application/x-www-form-urlencoded","Authorization":"Basic " + (Buffer.from(process.env.CLIENT_ID + ":" + process.env.CLIENT_SECRET).toString("base64"))}})
 .then(response => {
    if (response.status === 200) token = response.data.access_token;
    else throw new Error("Uh, oh! " + response.status);
 });
}
catch (error) {
  console.log("Failed POST",error);
    return {
      statusCode:400,
      headers: {
        "Content-Type": "text/html"
      },
      body:"There was a problem with the POST request: " + error,
    };
}

try {
await axios.get("https://api.spotify.com/v1/artists/5hTbr7Q7inWI4pYOcOPsH0/top-tracks?country=US",{headers:{"Authorization": `Bearer ${token}`}})
 .then(response => {
    if (response.status === 200) stats = response.data.tracks;
    else throw new Error("Uh, oh! " + response.status);
});
leng = stats.length;
for (i = leng;i;--i) {
cur = leng - i;
poplus[cur] = {name:stats[cur].name,url:stats[cur].external_urls.spotify,album:stats[cur].album.name,date:stats[cur].album.release_date,photo:stats[cur].album.images[0].url};
}
await axios.get("https://api.spotify.com/v1/artists/5hTbr7Q7inWI4pYOcOPsH0/albums?include_groups=album&limit=50",{headers:{"Authorization": `Bearer ${token}`}})
 .then(response => {
    if (response.status === 200) albums = response.data.items;
    else throw new Error("Uh, oh! " + response.status);
 });
}
catch (error) {
    return {
      statusCode:400,
      headers: {
        "Content-Type": "text/html"
      },
      body:"There was a problem with the GET request: " + error,
    };
}

try {
sorted = albums.sort((a, b) => {
      const dateA = new Date(a.release_date);
      const dateB = new Date(b.release_date);
      return dateB - dateA;
});
var arrlen = albums.length;
for (NTH = arrlen;NTH;--NTH) {
  payload.push({name:sorted[arrlen - NTH].name,url:sorted[arrlen - NTH].external_urls.spotify,cover:sorted[arrlen - NTH].images[0].url,date:sorted[arrlen - NTH].release_date,id:sorted[arrlen - NTH].id});
}
json.discography = payload;
json.tracks = poplus;
fyl = JSON.stringify(json);

await axios.put("https://api.github.com/repos/elijahducote/Ev-Website/contents/automation.json",{"message":"update file","sha":sha,"content":Buffer.from(fyl).toString("base64")},{headers:{"Accept":"application/vnd.github+json","Authorization":`Bearer ${process.env.TOKEN}`,"X-GitHub-Api-Version":"2022-11-28"}}).then(response => {
    if (response.status === 200) {
      msgcode = response.data.commit.sha;
    }
    else throw new Error("Uh, oh! " + response.status);
 });
 return {
      statusCode:400,
      headers: {
        "Content-Type": "text/html"
      },
      body: `Success! (#${msgcode})`,
 };
}
catch (error) {
  return {
      statusCode:400,
      headers: {
        "Content-Type": "text/html"
      },
      body: "There was a problem with the PUT request: " + error,
 };
}
}