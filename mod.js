let toPageString = pageNumber => pageNumber < 10000 ? `00${pageNumber}` : `0${pageNumber}`

module.exports = {
  title: "Homestuck POV Cam Port", 
  author: "<a href='https://github.com/madman-bob/Homestuck-POV-Cam'>madman-bob</a>, ported by <a href='https://flaringk.github.io/Portfolio/'>FlaringK</a>",
  modVersion: "0.6",

  summary: "A port of madman-bob's Homestuck POV Cam Chrome extension",
  description: `A port of <a href='https://github.com/madman-bob/Homestuck-POV-Cam'>madman-bob</a>'s Homestuck POV Cam Chrome extension to the UHC. <a href='https://github.com/FlaringK/UHC-POV-Cam'>Github</a><br />
  <br />
  You can check out the beginnings of all the timelines here: <a href='/povmap'>Homestuck POV Timeline Map</a><br />
  <b>Warning! Some part of the map will contain spoilers if you have not read all of Homestuck.</b><br />
  <h3>Changing the below options will require a full reload [ctrl + r]</h3>`,

  // Add images to UHC
  trees: {
    './icons/': 'assets://images/'
  },

  // Turn on and off each page group
  settings: {
    boolean: [
    {
      model: "disableHover",
      label: "Always display character names",
      desc: "Always display each timeline's character name instead of viewing them by hovering with your mouse."
    },{
      model: "Kids",
      label: "Disable Beta Kids timelines",
    },
    {
      model: "Kids' Guardians",
      label: "Disable Beta Kids' Guardians timelines",
    },
    {
      model: "Kids' Sprites",
      label: "Disable Beta Kids' Sprites timelines",
    },
    {
      model: "The Felt",
      label: "Disable The Felt timelines",
    },
    {
      model: "Kids' Exiles",
      label: "Disable Beta Kids' Exiles timelines",
    },
    {
      model: "Kids' Agents",
      label: "Disable Beta Kids' Agents timelines",
    },
    {
      model: "Midnight Crew",
      label: "Disable Midnight Crew timelines",
    },
    {
      model: "Trolls",
      label: "Disable Trolls timelines",
    },
    {
      model: "Trolls' Ancestors",
      label: "Disable Trolls' Ancestors timelines",
    },
    {
      model: "Alpha Kids",
      label: "Disable Alpha Kids timelines",
    },
    {
      model: "Alpha Kids' Sprites",
      label: "Disable Alpha Kids' Sprites timelines",
    },
    {
      model: "Alpha Kids' Agents",
      label: "Disable Alpha Kids' Agents timelines",
    },
    {
      model: "Alpha Trolls",
      label: "Disable Alpha Trolls timelines",
    },
    {
      model: "Cherubs",
      label: "Disable Cherubs timelines",
    }],
  },

  edit: true,

  computed(api) {
    // Load Json
    const povData = api.readJson('./timelines.json')
    api.logger.info(povData)
    
    return {
      
      styles: [
        {
          // Set collide & act 7 style manually
          body: api.store.get("collideAct7Style", "") // mod must be restarted twice to update
        },
        {
          source: "./povmap.css"
        }
      ],

      edit(archive) {

        let collideStyle = ""
        let act7Style = ""

        // For each page in homestuck
        for (let i = 1901; i < 10028; i++) {
          const pageString = toPageString(i)
          // if the page exists (prevents certain errors)
          if (archive.mspa.story[pageString] && povData.timelines[String(i)]) {

            let pageLinkDataList = povData.timelines[String(i)]
            let LinkStyle = ""

            let x2ComboLeftPage = ((pageString >= 7688) && (pageString <= 7825)) && (pageString % 2) == 0
            let x2ComboRightPage = ((pageString >= 7688) && (pageString <= 7825)) && (pageString % 2) == 1
            let x2Combo = x2ComboRightPage || x2ComboLeftPage

            let collide = pageString == 9987
            let act7 = pageString == 10027

            // Each Character data
            for (let j = 0; j < pageLinkDataList.length; j++) {
              let linkData = pageLinkDataList[j]

              // Add in missing pageNext
              if (!linkData[4][0]) linkData[4][0] = [parseInt(pageString)]

              for (let k = 0; k < linkData[4].length; k++) {
                archive.mspa.story[pageString].next.push(toPageString(linkData[4][k][0]))
                let linkIndex = archive.mspa.story[pageString].next.length

                if (!x2Combo && !collide && !act7) {
                  LinkStyle += `
                    div[data-pageid*="${pageString}"] .nextArrow div:nth-child(${linkIndex}) {
                      ${api.store.get(povData.groups[linkData[3]]) ? "display: none;" : ""}
                      position: relative;
                    }
                    div[data-pageid*="${pageString}"] .nextArrow div:nth-child(${linkIndex})${api.store.get("disableHover") ? "" : ":hover"}:before {
                      content: "${povData.peoplenames[linkData[0]]}";
                      position: absolute;
                          top: 10px;
                      right: calc(100% + 5px);
                      background: white;
                      border: solid black 1px;
                      font-size: 12px;
                      padding: 2px;
                      white-space: nowrap;
                      color: black;
                    }
                    div[data-pageid*="${pageString}"] .nextArrow div:nth-child(${linkIndex}) a {
                      color: ${povData.colours[linkData[1]]} !important;
                      ${povData.colours[linkData[1]] == "#FFFFFF" ? "text-shadow: 1px 1px 0px black;" : ""}
                      ${linkData[4][k][0] == pageString ? "display: none;" : ""}
                    }
                    div[data-pageid*="${pageString}"] .nextArrow div:nth-child(${linkIndex}) p::Before {
                      content: url("assets://images/${povData.images[linkData[2]]}");
                      display: inline-block;
                      transform: translateY(5px);
                    }
                    div[data-pageid*="${pageString}"] .nextArrow div:nth-child(${linkIndex}) p::After {
                      ${linkData[4][k][0] == pageString ? `content: "End of ${povData.peoplenames[linkData[0]]}'s Timeline.";` : ""}
                      color: ${povData.colours[linkData[1]]};
                      ${povData.colours[linkData[1]] == "#FFFFFF" ? "text-shadow: 1px 1px 0px black;" : ""}
                    }
                  `
                } else if (x2ComboLeftPage) {
                  LinkStyle += `
                    div .leftPage .nextArrow div:nth-child(${linkIndex}) {
                      ${api.store.get(povData.groups[linkData[3]]) ? "display: none;" : ""}
                    }
                    div .leftPage .nextArrow div:nth-child(${linkIndex}) div${api.store.get("disableHover") ? "" : ":hover"}:before {
                      content: "${povData.peoplenames[linkData[0]]}";
                      position: absolute;
                      top: 10px;
                      right: calc(100% + 5px);
                      background: white;
                      border: solid black 1px;
                      font-size: 12px;
                      padding: 2px;
                      white-space: nowrap;
                      color: black;
                    }
                    div .leftPage .nextArrow div:nth-child(${linkIndex}) a {
                      color: ${povData.colours[linkData[1]]} !important;
                      ${povData.colours[linkData[1]] == "#FFFFFF" ? "text-shadow: 1px 1px 0px black;" : ""}
                      ${linkData[4][k][0] == pageString ? "display: none;" : ""}
                    }
                    div .leftPage .nextArrow div:nth-child(${linkIndex}) p::Before {
                      content: url("assets://images/${povData.images[linkData[2]]}");
                      display: inline-block;
                      transform: translateY(5px);
                    }
                  `
                } else if (x2ComboRightPage) {
                  LinkStyle += `
                    div .rightPage .nextArrow div:nth-child(${linkIndex}) {
                      ${api.store.get(povData.groups[linkData[3]]) ? "display: none;" : ""}
                      position: relative;
                    }
                    div .rightPage .nextArrow div:nth-child(${linkIndex})${api.store.get("disableHover") ? "" : ":hover"}:before {
                      content: "${povData.peoplenames[linkData[0]]}";
                      position: absolute;
                      top: 10px;
                      right: calc(100% + 5px);
                      background: white;
                      border: solid black 1px;
                      font-size: 12px;
                      padding: 2px;
                      white-space: nowrap;
                      color: black;
                    }
                    div .rightPage .nextArrow div:nth-child(${linkIndex}) a {
                      color: ${povData.colours[linkData[1]]} !important;
                      ${povData.colours[linkData[1]] == "#FFFFFF" ? "text-shadow: 1px 1px 0px black;" : ""}
                      ${linkData[4][k][0] == pageString ? "display: none;" : ""}
                    }
                    div .rightPage .nextArrow div:nth-child(${linkIndex}) p::Before {
                      content: url("assets://images/${povData.images[linkData[2]]}");
                      display: inline-block;
                      transform: translateY(5px);
                    }
                    div .rightPage .nextArrow div:nth-child(${linkIndex}) p::After {
                      ${linkData[4][k][0] == pageString ? `content: "End of ${povData.peoplenames[linkData[0]]}'s Timeline.";` : ""}
                      color: ${povData.colours[linkData[1]]};
                      ${povData.colours[linkData[1]] == "#FFFFFF" ? "text-shadow: 1px 1px 0px black;" : ""}
                    }
                  `
                } else if (collide) {
                  collideStyle += `
                    /* Collide */
                    div[data-pageid*="009987"] .nextArrow div:nth-child(${linkIndex}) {
                      ${api.store.get(povData.groups[linkData[3]]) ? "display: none;" : ""}
                      position: relative;
                    }
                    div[data-pageid*="009987"] .nextArrow div:nth-child(${linkIndex})${api.store.get("disableHover") ? "" : ":hover"}:before {
                      content: "${povData.peoplenames[linkData[0]]}";
                      position: absolute;
                      top: 10px;
                      right: calc(100% + 5px);
                      background: white;
                      border: solid black 1px;
                      font-size: 12px;
                      padding: 2px;
                      white-space: nowrap;
                      color: black;
                    }
                    div[data-pageid*="009987"] .nextArrow div:nth-child(${linkIndex}) a {
                      color: ${povData.colours[linkData[1]]} !important;
                      ${povData.colours[linkData[1]] == "#FFFFFF" ? "text-shadow: 1px 1px 0px black;" : ""}
                      ${linkData[4][k][0] == "009987" ? "display: none;" : ""}
                    }
                    div[data-pageid*="009987"] .nextArrow div:nth-child(${linkIndex}) p::Before {
                      content: url("assets://images/${povData.images[linkData[2]]}");
                      display: inline-block;
                      transform: translateY(5px);
                    }
                    div[data-pageid*="009987"] .nextArrow div:nth-child(${linkIndex}) p::After {
                      ${linkData[4][k][0] == "009987" ? `content: "End of ${povData.peoplenames[linkData[0]]}'s Timeline.";` : ""}
                      color: ${povData.colours[linkData[1]]};
                      ${povData.colours[linkData[1]] == "#FFFFFF" ? "text-shadow: 1px 1px 0px black;" : ""}
                    }
                  `
                } else if (act7) {
                  act7Style += `
                    /* Act 7 */
                    div[data-pageid*="010027"] .nextArrow div:first-child {
                      margin-bottom: 20px;
                    }
                    div[data-pageid*="010027"] .nextArrow div + div {
                      font-size: x-large !important;
                    }
                    div[data-pageid*="010027"] .nextArrow div:nth-child(${linkIndex}) {
                      ${api.store.get(povData.groups[linkData[3]]) ? "display: none;" : ""}
                      position: relative;
                    }
                    div[data-pageid*="010027"] .nextArrow div:nth-child(${linkIndex})${api.store.get("disableHover") ? "" : ":hover"}:before {
                      content: "${povData.peoplenames[linkData[0]]}";
                      position: absolute;
                      top: 10px;
                      right: calc(100% + 5px);
                      background: white;
                      border: solid black 1px;
                      font-size: 12px;
                      padding: 2px;
                      white-space: nowrap;
                      /* color: black; */
                    }
                    div[data-pageid*="010027"] .nextArrow div:nth-child(${linkIndex}) a {
                      color: ${povData.colours[linkData[1]]} !important;
                      ${povData.colours[linkData[1]] == "#FFFFFF" ? "text-shadow: 1px 1px 0px black;" : ""}
                      ${linkData[4][k][0] == "010027" ? "display: none;" : ""}
                    }
                    div[data-pageid*="010027"] .nextArrow div:nth-child(${linkIndex}) p::Before {
                      content: url("assets://images/${povData.images[linkData[2]]}");
                      display: inline-block;
                      transform: translateY(5px);
                    }
                    div[data-pageid*="010027"] .nextArrow div:nth-child(${linkIndex}) p::After {
                      ${linkData[4][k][0] == "010027" ? `content: "End of ${povData.peoplenames[linkData[0]]}'s Timeline.";` : ""}
                      color: ${povData.colours[linkData[1]]};
                      ${povData.colours[linkData[1]] == "#FFFFFF" ? "text-shadow: 1px 1px 0px black;" : ""}
                    }
                      `
                }
              }
            }

            archive.mspa.story[pageString].content += `\n<style>${LinkStyle}</style>`

          }
        }

        // Store collide and act 7 style to be used on next start
        api.store.set("collideAct7Style", collideStyle + act7Style)

        archive.tweaks.modHomeRowItems.push({
          href: "/povmap",
          thumbsrc: "assets://images/davepetasprite2.png",
          title: 'Homestuck POV Timeline Map',
          description: `<p>SPOILERS AHEAD!<br /> A list of the beginnings of each Character's point of view</p>`
        });

      },

    }
  },

  // Add POV map
  browserPages: {
    // UNFINISHED
    "POVMAP": {
      component: {
        title: () => "Timeline Map",
        template: `
        <div data-v-4a4152c6 data-v-f1fcf218 class="pageBody customStyles pixelated theme-Denizenthemes-0 povmap"><nav data-v-1e24ec16 data-v-4a4152c6 class="navBanner customNavBanner pixelated"><div data-v-1e24ec16 class="navList"><ul data-v-1e24ec16 class="nav1"><li data-v-1e24ec16><a data-v-1e24ec16 href="/">HOMESTUCK COLLECTION</a></li></ul><div data-v-1e24ec16 class="candyCorn"></div><ul data-v-1e24ec16 class="nav2"><li data-v-1e24ec16><a data-v-1e24ec16 href="/help">HELP</a></li></ul><div data-v-1e24ec16 class="candyCorn"></div><ul data-v-1e24ec16 class="nav3"><li data-v-1e24ec16><a data-v-1e24ec16 href="/map">MAP</a></li><li data-v-1e24ec16><a data-v-1e24ec16 href="/log">LOG</a></li><li data-v-1e24ec16><a data-v-1e24ec16 href="/search">SEARCH</a></li></ul><div data-v-1e24ec16 class="candyCorn"></div><ul data-v-1e24ec16 class="nav4"><li data-v-1e24ec16><a data-v-1e24ec16 href="/news">NEWS</a></li><li data-v-1e24ec16><a data-v-1e24ec16 href="/music">MUSIC</a></li></ul><div data-v-1e24ec16 class="candyCorn"></div><ul data-v-1e24ec16 class="nav5"><li data-v-1e24ec16><a data-v-1e24ec16 href="/evenmore">MORE</a></li><li data-v-1e24ec16><a data-v-1e24ec16 href="/settings">SETTINGS</a></li><li data-v-1e24ec16><a data-v-1e24ec16 href="/credits">CREDITS</a></li></ul></div></nav>
        
        <div data-v-4a4152c6 class="pageFrame">
        <div data-v-4a4152c6 class="pageContent">

        <div data-v-4a4152c6 class="mediaContent">
        <h2 data-v-4a4152c6 class="pageTitle">Homestuck POV Timeline Map</h2>
        <div data-v-4a4152c6 class="media"><img data-v-5ff78e9b data-v-4a4152c6 src="assets://storyfiles/hs2/02546_2.gif" alt class="panel"></div>
        </div>

        <div data-v-4a4152c6 class="textContent">

          <div data-v-74e43957 data-v-4a4152c6 class="log">
            <!---->
            <p data-v-74e43957 class="logContent text bold" style="font-size: 1em; line-height: 1.15;">
                <span style="color: #a10000;">ARADIA: hi there stranger</span><br />
                <span style="color: #a10000;">ARADIA: you dont need to introduce yourself</span><br />
                <span style="color: #a10000;">ARADIA: i know who you are :)</span><br />
                <span style="color: #a10000;">ARADIA: and i know that not all of us can be </span><br />
                <span style="color: #a10000;">ARADIA: made</span><br />
                <span style="color: #a10000;">ARADIA: of time </span><br />
                <span style="color: #a10000;">ARADIA: so a friend of mine ported over work done by <a href='https://github.com/madman-bob/Homestuck-POV-Cam'>madman-bob</a> to get all of our timelines in order </span><br />
                <span style="color: #a10000;">ARADIA: it reminds me of trollian in a way</span><br />
                <span style="color: #a10000;">ARADIA: somewhat nostalgic</span><br />
                <span style="color: #a10000;">ARADIA: but thats enough of me getting into memories on my own</span><br />
                <span style="color: #a10000;">ARADIA: poke around on the options below to view the start of anyones timeline</span><br />
                <span style="color: #a10000;">ARADIA: and feel what its like to be me for a change</span><br />
                <span style="color: #a10000;">ARADIA: see you at the end of it all</span><br />
                <span style="color: #a10000;">ARADIA: :D</span><br />
            </p>
            <!---->
        </div>
        
        <nav data-v-c8c019be data-v-4a4152c6 class="pageNavigation">
        <div data-v-c8c019be class="nextArrow">
        
        <!-- Beta kids -->
        <div data-v-c8c019be class="beta"><p data-v-c8c019be> 
        <img src="assets://images/john.png">
        <img src="assets://images/rose.png">
        <img src="assets://images/dave.png">
        <img src="assets://images/jade.png">
        &gt; <a data-v-c8c019be href="/mspa/003790" class="nextArrowLink"><c>Beta</c><c> Pla</c><c>yers</c><c> ==></c></a></p></div>
        
        <!-- Beta Guardians -->
        <div data-v-c8c019be class="alpha"><p data-v-c8c019be> 
        <img src="assets://images/nanna.png">
        <img src="assets://images/mom.png">
        <img src="assets://images/bro.png">
        <img src="assets://images/grandpa.png">
        &gt; <a data-v-c8c019be href="/mspa/003787" class="nextArrowLink"><c>Alph</c><c>a Pl</c><c>ayer</c><c>s ==></c></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/jane.png">
        <img src="assets://images/roxy.png">
        <img src="assets://images/dirk.png">
        <img src="assets://images/jake.png"></p></div>

        <div class="flex">
        <div>

        <div data-v-c8c019be><p data-v-c8c019be class="dad"> 
        <img src="assets://images/dad.png">
        &gt; <a data-v-c8c019be href="/mspa/003766" class="nextArrowLink">Dad ==></a></p></div>

        </div>
        <div>

        <div data-v-c8c019be><p data-v-c8c019be class="bec"> 
        <img src="assets://images/becquerel.png">
        &gt; <a data-v-c8c019be href="/mspa/003840" class="nextArrowLink">Becquerel ==></a></p></div>

        </div>
        </div>

        =-=-=-=-=

        <!-- Trolls -->
        <div class="trolls flex">
        <div class="post">

        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/aradia.png">
        &gt; <a data-v-c8c019be href="/mspa/005479" class="nextArrowLink">Aradia ==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/tavros.png">
        &gt; <a data-v-c8c019be href="/mspa/004067" class="nextArrowLink">Tavros ==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/sollux.png">
        &gt; <a data-v-c8c019be href="/mspa/005490" class="nextArrowLink">Sollux ==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/karkat.png">
        &gt; <a data-v-c8c019be href="/mspa/004077" class="nextArrowLink">Karkat ==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/nepeta.png">
        &gt; <a data-v-c8c019be href="/mspa/003955" class="nextArrowLink">Nepeta ==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/kanaya.png">
        &gt; <a data-v-c8c019be href="/mspa/005220" class="nextArrowLink">Kanaya ==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/terezi.png">
        &gt; <a data-v-c8c019be href="/mspa/004138" class="nextArrowLink">Terezi ==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/vriska.png">
        &gt; <a data-v-c8c019be href="/mspa/005374" class="nextArrowLink">Vriska ==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/equius.png">
        &gt; <a data-v-c8c019be href="/mspa/004108" class="nextArrowLink">Equius ==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/gamzee.png">
        &gt; <a data-v-c8c019be href="/mspa/003910" class="nextArrowLink">Gamzee ==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/eridan.png">
        &gt; <a data-v-c8c019be href="/mspa/003966" class="nextArrowLink">Eridan ==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/feferi.png">
        &gt; <a data-v-c8c019be href="/mspa/004080" class="nextArrowLink">Feferi ==></a></p></div>

        </div>
        <div class="pre">

        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/aradia.png">
        &gt; <a data-v-c8c019be href="/mspa/006892" class="nextArrowLink">Damara ==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/tavros.png">
        &gt; <a data-v-c8c019be href="/mspa/006892" class="nextArrowLink">Rufioh ==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/sollux.png">
        &gt; <a data-v-c8c019be href="/mspa/006892" class="nextArrowLink">Mituna ==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/karkat.png">
        &gt; <a data-v-c8c019be href="/mspa/006892" class="nextArrowLink">Kankri ==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/nepeta.png">
        &gt; <a data-v-c8c019be href="/mspa/006892" class="nextArrowLink">Meulin ==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/kanaya.png">
        &gt; <a data-v-c8c019be href="/mspa/006892" class="nextArrowLink">Porrim ==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/terezi.png">
        &gt; <a data-v-c8c019be href="/mspa/006892" class="nextArrowLink">Latula ==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/vriska.png">
        &gt; <a data-v-c8c019be href="/mspa/006480" class="nextArrowLink">Aranea ==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/equius.png">
        &gt; <a data-v-c8c019be href="/mspa/006892" class="nextArrowLink">Horuss ==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/gamzee.png">
        &gt; <a data-v-c8c019be href="/mspa/006892" class="nextArrowLink">Kurloz ==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/eridan.png">
        &gt; <a data-v-c8c019be href="/mspa/006892" class="nextArrowLink">Cronus ==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/feferi.png">
        &gt; <a data-v-c8c019be href="/mspa/006537" class="nextArrowLink">Meenah ==></a></p></div>

        </div>
        </div>

        <div data-v-c8c019be class="hic"><p data-v-c8c019be> 
        <img src="assets://images/feferi.png">
        &gt; <a data-v-c8c019be href="/mspa/005963" class="nextArrowLink">Her Imperious Condescension ==></a></p></div>

        =-=-=-=-=

        <!-- Cherubs -->
        <div class="cherubs flex">
        <div class=left>

        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/calliope.png">
        &gt; <a data-v-c8c019be href="/mspa/007874" class="nextArrowLink">Calliope ==></a></p></div>

        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/caliborn.png">
        &gt; <a data-v-c8c019be href="/mspa/007874" class="nextArrowLink">Caliborn ==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/ballcue.png">
        &gt; <a data-v-c8c019be href="/mspa/005513" class="nextArrowLink">Doc Scratch ==></a></p></div>

        </div>
        <div class=right>

        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/calliope.png">
        &gt; <a data-v-c8c019be href="/mspa/009496" class="nextArrowLink">Alt Calliope ==></a></p></div>

        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/lilcal.png">
        &gt; <a data-v-c8c019be href="/mspa/005931" class="nextArrowLink">Lil' Cal ==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/lordenglish.png">
        &gt; <a data-v-c8c019be href="/mspa/006011" class="nextArrowLink">Lord English ==></a></p></div>

        </div>
        </div>

        =-=-=-=-=

        <!-- Cariparians -->
        <div class="carp flex">
        <div>

        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/dersite.png">
        &gt; <a data-v-c8c019be href="/mspa/003700" class="nextArrowLink">WV ==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/dersite.png">
        &gt; <a data-v-c8c019be href="/mspa/003355" class="nextArrowLink">AR ==></a></p></div>

        </div>
        <div>

        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/prospitian.png">
        &gt; <a data-v-c8c019be href="/mspa/002933" class="nextArrowLink">PM ==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/prospitian.png">
        &gt; <a data-v-c8c019be href="/mspa/003512" class="nextArrowLink">WQ ==></a></p></div>

        </div>
        </div>

        =-=-=-=-=

        <!-- Agents -->
        <div class="agents">

        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/hearts.png">
        &gt; <a data-v-c8c019be href="/mspa/004448" class="nextArrowLink">Hearts Boxcars ==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/diamonds.png">
        &gt; <a data-v-c8c019be href="/mspa/004478" class="nextArrowLink">Diamonds Droog ==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/clubs.png">
        &gt; <a data-v-c8c019be href="/mspa/004207" class="nextArrowLink">Clubs Deuce ==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/spades.png">
        &gt; <a data-v-c8c019be href="/mspa/004198" class="nextArrowLink">Spades Slick ==></a></p></div>

        </div>
        <div class="agents">

        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/hearts.png">
        &gt; <a data-v-c8c019be href="/mspa/002857" class="nextArrowLink">Hegemonic Brute ==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/diamonds.png">
        &gt; <a data-v-c8c019be href="/mspa/003432" class="nextArrowLink">Draconian Dignitary ==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/clubs.png">
        &gt; <a data-v-c8c019be href="/mspa/003681" class="nextArrowLink">Courtyard Droll ==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/spades.png">
        &gt; <a data-v-c8c019be href="/mspa/002790" class="nextArrowLink">Jack Noir ==></a></p></div>

        </div>

        <div data-v-c8c019be><p data-v-c8c019be class="jackeng"> 
        <img src="assets://images/spades.png">
        &gt; <a data-v-c8c019be href="/mspa/006294" class="nextArrowLink">Jack English ==></a></p></div>

        =-=-=-=-=

        <!-- Sprites -->
        <div class="sprites flex">
        <div class=left>

        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/nannasprite.png">
        &gt; <a data-v-c8c019be href="/mspa/002184" class="nextArrowLink">Nannasprite ==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/calsprite.png">
        &gt; <a data-v-c8c019be href="/mspa/003541" class="nextArrowLink">Calsprite ==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/jadesprite.png">
        &gt; <a data-v-c8c019be href="/mspa/005112" class="nextArrowLink">Jadesprite ==></a></p></div>

        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/tavrosprite.png">
        &gt; <a data-v-c8c019be href="/mspa/009349" class="nextArrowLink">Tavrosprite ==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/fefetasprite.png">
        &gt; <a data-v-c8c019be href="/mspa/007419" class="nextArrowLink">Fefetasprite ==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/erisolsprite.png">
        &gt; <a data-v-c8c019be href="/mspa/007412" class="nextArrowLink">Erisolsprite ==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/arquiusprite.png">
        &gt; <a data-v-c8c019be href="/mspa/007547" class="nextArrowLink">ARquiusprite ==></a></p></div>

        </div>
        <div class=right>

        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/jaspersprite.png">
        &gt; <a data-v-c8c019be href="/mspa/003049" class="nextArrowLink">Jaspersprite ==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/davesprite.png">
        &gt; <a data-v-c8c019be href="/mspa/003541" class="nextArrowLink">Davesprite ==></a></p></div>

        <div data-v-c8c019be><p data-v-c8c019be><img src="assets://images/davesprite.png" style="opacity: 0"></p></div>

        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/tavrisprite.png">
        &gt; <a data-v-c8c019be href="/mspa/006734" class="nextArrowLink">Tavrisprite ==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/rosesprite.png">
        &gt; <a data-v-c8c019be href="/mspa/009404" class="nextArrowLink">Rosesprite ==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/nepetasprite.png">
        &gt; <a data-v-c8c019be href="/mspa/009720" class="nextArrowLink">Nepetasprite ==></a></p></div>

        </div>
        </div>

        <div data-v-c8c019be><p data-v-c8c019be class="jr2"> 
        <img src="assets://images/jasprosesprite2.png">
        &gt; <a data-v-c8c019be href="/mspa/009490" class="nextArrowLink"><c>Jasprosesprite</c><c>^2 ==></c></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be class="dp2"> 
        <img src="assets://images/davepetasprite2.png">
        &gt; <a data-v-c8c019be href="/mspa/009778" class="nextArrowLink"><c>Davepetasprite</c><c>^2 ==></c></a></p></div>

        =-=-=-=-=

        <!-- The Felt -->
        <div data-v-c8c019be class="snowman"><p data-v-c8c019be> 
        <img src="assets://images/ball08.png">
        &gt; <a data-v-c8c019be href="/mspa/004207" class="nextArrowLink">Snowman ==></a></p></div>

        <div class="felt flex">
        <div class="left">

        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/ball01.png">
        &gt; <a data-v-c8c019be href="/mspa/007839" class="nextArrowLink">Itchy ==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/ball02.png">
        &gt; <a data-v-c8c019be href="/mspa/007839" class="nextArrowLink">Doze ==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/ball03.png">
        &gt; <a data-v-c8c019be href="/mspa/007846" class="nextArrowLink">Trace ==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/ball04.png">
        &gt; <a data-v-c8c019be href="/mspa/007846" class="nextArrowLink">Clover ==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/ball05.png">
        &gt; <a data-v-c8c019be href="/mspa/007922" class="nextArrowLink">Fin ==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/ball06.png">
        &gt; <a data-v-c8c019be href="/mspa/007922" class="nextArrowLink">Die ==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/ball07.png">
        &gt; <a data-v-c8c019be href="/mspa/007922" class="nextArrowLink">Crowbar ==></a></p></div>

        </div>
        <div class="right">

        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/ball09.png">
        &gt; <a data-v-c8c019be href="/mspa/007965" class="nextArrowLink">Stitch ==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/ball10.png">
        &gt; <a data-v-c8c019be href="/mspa/007965" class="nextArrowLink">Sawbuck ==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/ball11.png">
        &gt; <a data-v-c8c019be href="/mspa/007965" class="nextArrowLink">Matchsticks ==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/ball12.png">
        &gt; <a data-v-c8c019be href="/mspa/008011" class="nextArrowLink">Eggs ==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/ball13.png">
        &gt; <a data-v-c8c019be href="/mspa/008011" class="nextArrowLink">Biscuits ==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/ball14.png">
        &gt; <a data-v-c8c019be href="/mspa/008092" class="nextArrowLink">Quarters ==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/ball15.png">
        &gt; <a data-v-c8c019be href="/mspa/008092" class="nextArrowLink">Cans ==></a></p></div>

        </div>
        </div>

        =-=-=-=-=

        <div data-v-c8c019be class="hic"><p data-v-c8c019be> 
        <img src="assets://images/feferi.png">
        &gt; <a data-v-c8c019be href="/mspa/006589" class="nextArrowLink">Doomed Feferi ==></a></p></div>
        
        </div>
        </nav>
        </div>

        </div>
        </div>

        <div data-v-61a86b91 data-v-4a4152c6 class="footer theme-Denizenthemes-0 pixelated" style="width: 950px;"><img data-v-5ff78e9b data-v-61a86b91 src="assets://images/mspalogo_mspa.png" alt draggable="false" class="bannerImage left"><img data-v-5ff78e9b data-v-61a86b91 src="assets://images/mspalogo_mspa.png" alt draggable="false" class="bannerImage right"></div>
        </div>
        `,
        scss: ``
      }
    }
  }

}
