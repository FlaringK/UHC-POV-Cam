let toPageString = pageNumber => pageNumber < 10000 ? `00${pageNumber}` : `0${pageNumber}`

module.exports = {
  title: "Homestuck POV Cam Port", 
  author: "<a href='https://github.com/madman-bob/Homestuck-POV-Cam'>madman-bob</a>, ported by <a href='https://flaringk.github.io/Portfolio/'>FlaringK</a>",
  modVersion: "0.5",

  summary: "A port of madman-bob's Homestuck POV Cam Chrome extension",
  description: "A port of <a href='https://github.com/madman-bob/Homestuck-POV-Cam'>madman-bob</a>'s Homestuck POV Cam Chrome extension to the UHC. <a href='https://github.com/FlaringK/UHC-POV-Cam'>Github</a><h3>Changing the below options will require a full reload [ctrl + r]</h3>",

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

    // Array of next page indexes
    let nextPageArray = {}

    // Fill nextPageArray
    // Do this before edit due to some links not having pages
    for (const [pagenum, linkData] of Object.entries(povData.timelines)) {
      let nextpages = []

      for (let i = 0; i < linkData.length; i++) {
        // Account for missing page indexs 
        if (linkData[i][4][0]) nextpages.push(toPageString(linkData[i][4][0][0]))
        //`00${linkData[i][4][0][0]}`)
        else nextpages.push(undefined)
      }

      nextPageArray[toPageString(pagenum)] = nextpages

    }
    
    return {

      
      styles: [
        {
          // Set collide & act 7 style manually
          source: api.store.get("disableHover") ? "./collideact7_nohover.css" : "./collideact7.css"
        },
        {
          source: "./povmap.css"
        }
      ],

      edit(archive) {

        // For each page in homestuck
        for (let i = 1901; i < 10028; i++) {
          const pageString = toPageString(i)
          // if the page exists (prevents certain errors)
          if (archive.mspa.story[pageString] && nextPageArray[pageString]) {

            // Check if page numbers are valid
            var validNextPages = []
            var validNextIndex = []
            for (let i = 0; i < nextPageArray[pageString].length; i++) {
              if (nextPageArray[pageString][i]) {
                validNextPages.push(true)
                validNextIndex.push(nextPageArray[pageString][i])
              } else {
                validNextPages.push(false)
                validNextIndex.push(pageString)
              }
            }

            // Add new next pages to 
            archive.mspa.story[pageString].next = archive.mspa.story[pageString].next.concat(validNextIndex)

            // Create style for links
            const timelinePage = povData.timelines[String(i)]

            let LinkStyle = ""

            // Loop throught array backwards to avoid styling the original links 
            for (let i = timelinePage.length - 1; i >= 0; i--) {
              let linkData = timelinePage[timelinePage.length - i - 1]
              let linkIndex = archive.mspa.story[pageString].next.length - i
              let isEndofTimeline = !validNextPages[timelinePage.length - i - 1]

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
              }
              div[data-pageid*="${pageString}"] .nextArrow div:nth-child(${linkIndex}) a {
                color: ${povData.colours[linkData[1]]} !important; 
                ${povData.colours[linkData[1]] == "#FFFFFF" ? "text-shadow: 1px 1px 0px black;" : ""}
                ${isEndofTimeline ? "display: none;" : ""}
              } 
              div[data-pageid*="${pageString}"] .nextArrow div:nth-child(${linkIndex}) p::Before { 
                content: url("assets://images/${povData.images[linkData[2]]}");
                display: inline-block;
                transform: translateY(5px); 
              }
              div[data-pageid*="${pageString}"] .nextArrow div:nth-child(${linkIndex}) p::After {
                ${isEndofTimeline ? `content: "End of ${povData.peoplenames[linkData[0]]}'s Timeline.";` : ""}
                color: ${povData.colours[linkData[1]]}; 
                ${povData.colours[linkData[1]] == "#FFFFFF" ? "text-shadow: 1px 1px 0px black;" : ""}
              }
              `

            }

            archive.mspa.story[pageString].content += `\n<style>${LinkStyle}</style>`

          }
        }

        archive.tweaks.modHomeRowItems.push({
          href: "/povmap",
          thumbsrc: "https://file.garden/X8UcPOa95myVypAH/fic/plagiarism/wordle.png",
          title: 'Homestuck POV Cam Map',
          description: `<p>Test</p>`
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
        <p data-v-74e43957 data-v-4a4152c6 class="prattle text bold" style="font-size: 1em; line-height: 1.15;">
        Under contruction
        </p>
        
        <nav data-v-c8c019be data-v-4a4152c6 class="pageNavigation">
        <div data-v-c8c019be class="nextArrow">
        
        <!-- Beta kids -->
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/john.png">
        <img src="assets://images/rose.png">
        <img src="assets://images/dave.png">
        <img src="assets://images/jade.png">
        &gt; <a data-v-c8c019be href="/mspa/003790" class="nextArrowLink">==></a></p></div>
        
        <!-- Beta Guardians -->
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/nanna.png">
        <img src="assets://images/mom.png">
        <img src="assets://images/bro.png">
        <img src="assets://images/grandpa.png">
        &gt; <a data-v-c8c019be href="/mspa/003787" class="nextArrowLink">==></a></p></div>

        <!-- Trolls -->
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/aradia.png">
        &gt; <a data-v-c8c019be href="/mspa/005479" class="nextArrowLink">==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/tavros.png">
        &gt; <a data-v-c8c019be href="/mspa/005479" class="nextArrowLink">==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/sollux.png">
        &gt; <a data-v-c8c019be href="/mspa/005479" class="nextArrowLink">==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/karkat.png">
        &gt; <a data-v-c8c019be href="/mspa/005479" class="nextArrowLink">==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/nepeta.png">
        &gt; <a data-v-c8c019be href="/mspa/005479" class="nextArrowLink">==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/kanaya.png">
        &gt; <a data-v-c8c019be href="/mspa/005479" class="nextArrowLink">==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/terezi.png">
        &gt; <a data-v-c8c019be href="/mspa/005479" class="nextArrowLink">==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/vriska.png">
        &gt; <a data-v-c8c019be href="/mspa/005479" class="nextArrowLink">==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/equius.png">
        &gt; <a data-v-c8c019be href="/mspa/005479" class="nextArrowLink">==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/gamzee.png">
        &gt; <a data-v-c8c019be href="/mspa/005479" class="nextArrowLink">==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/eridan.png">
        &gt; <a data-v-c8c019be href="/mspa/005479" class="nextArrowLink">==></a></p></div>
        <div data-v-c8c019be><p data-v-c8c019be> 
        <img src="assets://images/feferi.png">
        &gt; <a data-v-c8c019be href="/mspa/005479" class="nextArrowLink">==></a></p></div>
        
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