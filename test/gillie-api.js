let MYPUBLIC_APIKEY = "f7adb454-31ad-4dcc-a2ac-f937ec016cdc";
let MYPRIVATE_APIKEY = "ffebe6bc-f8ea-493e-b349-b2ae7387b586"; 

let expect = require("chai").expect;
let GillieApi = require("../lib/index").GillieApi;
let api;
let nock = require('nock');

describe('Test gillie', function() {

  before(async function() {
    nock.cleanAll();
    nock('http://localhost')
    .persist()
    .post(/error/,function(res) {
      return res;
    })
    .reply(400, {error: "Some error"});
    nock('http://localhost')
        .persist()
        .post(/api/,function(res) {
          return res;
        })
        .reply(200, { person_id: "99"});

    nock('http://localhost')
        .persist()
        .get(/api/)
        .reply(200, function(url,body) {
          console.log("XX",url);
          expect(url).contain("apikey=");
          expect(url).contain("apisalt=");
          expect(url).contain("apihash=");
          return {url: url};
        });
   
  });
  it ("Create GillieApi instance", async function() {
      api = new GillieApi({privateKey: "12345", publicKey: "ddddd", host: "http://localhost"});
  });

  it ("Get", async function() {
    let resp = await api.get("/api/datapoints",{start_date: new Date(), measurement: ["yy","xx"]});
  //  console.log(resp);
    expect(resp.url).to.contain("measurement=yy&measurement=xx");
  });

  it ("Post", async function() {
    let resp = await api.post("/api/datapoints",{xx: "bodydata"},{start_date: new Date()});
    console.log(resp);
    expect(resp.person_id).to.equal("99");
  });

  it ("Check error return", async function() {
    let error = false;
    try {
      let resp = await api.post("/api/error",{xx: "bodydata"},{start_date: new Date()});
    } catch(err) {
      expect(err.response.data.error).to.equal("Some error");

      error = true;
    }
    expect(error).to.equal(true);
  });
});

