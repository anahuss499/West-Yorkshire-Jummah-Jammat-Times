/* ==========================================================
   EDIT THIS FILE TO UPDATE THE WEBSITE  (no other file needed)

   1. CONFIG  – change the date, season and contact details.
   2. AREAS   – each area has a name and a list of masjids.

   A masjid row looks like:
     ["Name", "Address", ["1st", "2nd", "3rd"], "flags"]

   - Times: list only the jama'ats that exist, e.g. ["1:30"] or ["1:30","2:30"].
   - Add "+" after a time for a LATE jummah jama'at (shown green): "4:00+"
   - flags (optional text): "L" = facilities for ladies (pink),
                            "U" = updated jama'at times (purple)
   - To add an area, copy a { area: ..., masjids: [...] } block.
   ========================================================== */

const CONFIG = {
  season: "Summer",                 // Summer / Winter
  date: "2026-10-16",               // YYYY-MM-DD (must be a Friday)
  title: "West Yorkshire",
  subtitle: "Jummah Jama'at Times",
  tagline: "Covering whole of West Yorkshire · Updated weekly · Please share & tag",
  phone: "07921 510020",
  email: "wyjjt@outlook.com",
  monthlyTimetableUrl: "https://whatsapp.com/channel/0029VaywcUS11ulHTpTJZa2g",
  // Socials + QR codes. Change a url and its QR code updates automatically.
  // label = text under the QR, color/bg = QR colours. Delete a line to remove it.
  social: [
    { name: "Instagram", label: "Scan", icon: "fa-brands fa-instagram", color: "#c13584", url: "https://www.instagram.com/westyorkshirejummahjammattimes/profilecard?r=nametag" },
    { name: "WhatsApp", label: "Share", icon: "fa-brands fa-whatsapp", color: "#1f8f3a", url: "https://whatsapp.com/channel/0029VaCjolbKmCPI6qJmWh0Z" },
    { name: "Facebook", label: "Join", icon: "fa-brands fa-facebook-f", color: "#1266c8", url: "https://www.facebook.com/WestYorkshireJummahJamaatTimes" },
    { name: "TikTok", label: "Follow", icon: "fa-brands fa-tiktok", color: "#000000", url: "https://vm.tiktok.com/ZNRbyKWWa/" },
    { name: "Snapchat", label: "Tag", icon: "fa-brands fa-snapchat", color: "#000000", bg: "#fffc00", url: "https://www.snapchat.com/add/wyjummahjtimes?src=QR_CODE" },
    { name: "Our app", label: "Our app", icon: "fa-solid fa-mobile-screen-button", color: "#7a6428", url: "https://jumma1.netlify.app" }
  ],
  whatsappChannels: [
    { name: "West Yorkshire Jummah Jammat Times", description: "Where we will post Jummah times for West Yorkshire every week.", url: "https://whatsapp.com/channel/0029VaCjolbKmCPI6qJmWh0Z" },
    { name: "West Yorkshire Events/Gatherings", description: "Where we will post Islamic gatherings from Ahlus Sunna Wal Jammah in West Yorkshire.", url: "https://whatsapp.com/channel/0029VawpJLJAZNc3eLj3gB2q" },
    { name: "West Yorkshire Salah Timetables", description: "Where we will post Monthly Salah Calendars for West Yorkshire every month.", url: "https://whatsapp.com/channel/0029VaywcUS11uHlTpTJZa2q" }
  ]
};

const AREAS = [
  {
    area: "BD1", masjids: [
      ["JTI Central Masjid Westgate", "9 Darfield St, BD1 3RU", ["1:30", "2:30", "3:30"], "LU"],
      ["Faizan e Attar", "70-72 Harris Street, BD1 5JD", ["1:30"]]
    ]
  },
  {
    area: "BD2", masjids: [
      ["Sayyidah Aminah", "117 Fagley Road, BD2 3LR", ["1:30", "2:30"]],
      ["Jamia Masjid Al Faiz Trust", "451-453 Otley Rd, BD2 4QF", ["1:30", "2:30", "3:30+"]]
    ]
  },
  {
    area: "BD3", masjids: [
      ["Noor Ul Islam (Fagley)", "24 Gain Lane, BD3 7LS", ["1:30", "2:30"]],
      ["Jamia Madni [Off Killinghall]", "101 Thornbury Rd, BD3 8SA", ["1:30", "3:30+"], "L"],
      ["Jamia Muhammadia", "92-96 Lapage St, BD3 8EH", ["2:00"], "L"],
      ["JTI Barkerend Road", "85 Barkerend Road, BD3 9AP", ["1:30", "2:00"]],
      ["JTI Browning Street", "2 Browning Street, BD3 9DX", ["1:30"]],
      ["Jamia Ghausia Mehria", "389 Leeds Road, BD3 9LY", ["2:00"]],
      ["Faizan e Madina", "Maudsley Street, BD3 9LE", ["2:00"]],
      ["J.Muhammadiyah Qadriyah", "179 Otley Road, BD3 0HX", ["1:30", "2:30", "3:30+"]],
      ["Ghosia Chistia", "39 Undercliffe Ln, BD3 0DW", ["2:00"]]
    ]
  },
  {
    area: "BD4", masjids: [
      ["JTI Coventry Street", "43 Coventry Street, BD4 7HX", ["2:00", "3:00+"]]
    ]
  },
  {
    area: "BD5", masjids: [
      ["Al Jamia Suffa Tul Islam", "Horton Park Ave, BD5 0LD", ["1:30"], "L"],
      ["JTI Ryan Street", "87-89 Ryan St, BD5 7AP", ["2:00"]],
      ["JTI Burnett Place", "1-3 Burnett Place, BD5 9LU", ["1:30", "3:30+"]],
      ["Jamiya Rehmania Rizvia", "1 Ryan Street, BD5 7DQ", ["1:30"]],
      ["Jamia Islamia Rizvia", "119 Southfield Ln, BD5 9HQ", ["1:30", "2:30"]]
    ]
  },
  {
    area: "BD6", masjids: [
      ["Faizan e Raza (Wibsey)", "71 Beacon Road, BD6 3ET", ["1:30", "2:20"]]
    ]
  },
  {
    area: "BD7", masjids: [
      ["Madinat Al-Zahra (MUQ)", "Bartle Lane, BD7 4QF", ["2:00"]],
      ["Mazhar e Islam Ghousia", "6-7 Low Green, BD7 3LU", ["1:30"]],
      ["JTI Northside Terrace", "1 Northside Terr, BD7 2PB", ["2:00"]],
      ["Sultan Bahu", "7 Cross Lane, BD7 3JT", ["2:00", "3:45"], "LU"],
      ["Al Markaz Ul Islami (SMT)", "Beckside Lane, BD7 2JX", ["1:30"], "L"],
      ["Jamia Millat-e-Islamia", "15 Ivanhoe Road, BD7 3HY", ["1:30"], "L"],
      ["JTI Shearbridge Road", "28 Shearbridge Rd, BD7 1NX", ["1:30", "2:15"], "L"],
      ["JTI Hilton Road", "38 Hilton Road, BD7 2ED", ["2:00", "3:30+"], "L"]
    ]
  },
  {
    area: "BD8", masjids: [
      ["Jamia Masjid Hanfia", "2 Ambler Street, BD8 8AW", ["1:30"], "L"],
      ["JTI Toller Lane", "133 Toller Lane, BD8 9HL", ["1:30", "2:30"], "L"],
      ["Al Mustafa Centre", "Young Street, BD8 9RE", ["1:30", "2:30"], "L"],
      ["Al Hikam Institute", "12 Bull Royd Lane, BD8 0LJ", ["2:15"]],
      ["Shahjalal Latifiah Masjid", "61/63 Lumb Lane, BD8 0BQ", ["1:30"]],
      ["Jamia Auradey Naziria", "350 Girlington Rd, BD8 9PA", ["2:00"]],
      ["JTI Southfield Square", "68-69 Southfield Sq, BD8 7SN", ["2:00"]],
      ["JTI Hoxton Street", "28 Hoxton Street, BD8 9NG", ["2:00"]],
      ["Jamia Naqshbandia Aslamia", "63 Tile Street, BD8 8NX", ["1:30"]]
    ]
  },
  {
    area: "BD9", masjids: [
      ["Faizan e Makkah", "Lilycroft Road, BD9 5AB", ["1:30", "2:30"]],
      ["JTI Jesmond Avenue", "11 Jesmond Ave, BD9 5DP", ["1:30"]],
      ["JTI Haworth Road Masjid", "134 Haworth Road, BD9 6LL", ["1:30", "2:30", "3:45+"]],
      ["Jamia Usmania", "394 Heaton Rd, BD9 4RR", ["1:30", "2:20"]],
      ["JTI Victor Street", "Victor Street, BD9 4RA", ["1:40", "2:40+"], "L"],
      ["JTI Frizinghall", "52-54 Aireville Rd, BD9 4HN", ["2:00", "3:45"], "LU"],
      ["Masjid Nur-The Lux Mosque", "Haworth Road, BD9 6LH", ["1:30"], "L"],
      ["Mustafa Mount", "Emm Lane, BD9 4JL", ["1:30"], "L"]
    ]
  },
  {
    area: "BD15", masjids: [
      ["JTI Allerton", "91 Saffron Drive, BD15 7NQ", ["1:30", "2:15"]]
    ]
  },
  {
    area: "BD18", masjids: [
      ["Jamia Shan-e-Islam", "80 Beamsley Rd, BD18 2DR", ["1:30"]],
      ["Ihya College [Shipley]", "82 Otley Road, BD18 3SA", ["1:30"], "L"]
    ]
  },
  {
    area: "Keighley", masjids: [
      ["Abu Zahra Foundation", "Devonshire Street, BD21 2BL", ["1:35"], "L"],
      ["Ghosiyah Masjid", "206 Skipton Road, BD21 2TA", ["2:00"], "L"],
      ["Markazi Jamia Masjid", "75 Emily Street, BD21 3EG", ["1:45", "3:00+"]],
      ["Shahjalal Jami Masjid", "3 Temple Row, BD21 3SL", ["1:45"]]
    ]
  },
  {
    area: "Leeds", masjids: [
      ["Jamia Masjid Bilal", "Conway Rd, Harehills, LS8 5JH", ["2:00"]],
      ["Faizan of Madina", "49 Barkly Road, LS11 7EN", ["1:45"]],
      ["Jamia Masjid Ghousia", "7 Brooklyn Ter, Armley, LS12 2BX", ["2:00"], "L"],
      ["Jamia Abu Huraira", "Catherine Gr, Beeston, LS11 6LU", ["2:00"], "L"],
      ["Makkah Mosque", "36 Thornville Road, LS6 1JY", ["2:00"], "L"]
    ]
  },
  {
    area: "Halifax", masjids: [
      ["Jamia Mosque Madni", "117-131 Gibbet St, HX1 5BP", ["2:00"], "L"],
      ["Jamia Masjid Ghousia", "49 Rhodes Street, HX1 5DE", ["2:00"], "L"],
      ["Faizan e Madina", "275 Gibbet Road, HX1 4LR", ["1:30", "2:30"]],
      ["Jami' Masjid Noorani", "98-100 Spring Hall Ln, HX1 4TW", ["1:30", "2:30"]]
    ]
  },
  {
    area: "Huddersfield", masjids: [
      ["Faizan e Madina", "75 New North Road, HD1 5ND", ["1:30"]],
      ["Anwar e Madina", "8-10 Clara Street, HD1 6EN", ["2:00"]],
      ["Jamia Masjid Abu Bakr", "64a Church Street, HD1 4UD", ["2:00"], "L"],
      ["Hanfia Masjid", "61 Bentley Street, HD1 3UL", ["2:00"], "L"],
      ["Jamia Masjid Ghausia", "73 Victoria Road, HD1 3RT", ["2:00", "3:30+"], "L"],
      ["Masjid Riza", "129 Halifax Old Rd, HD2 2RP", ["2:15"]]
    ]
  },
  {
    area: "Heckmondwike", masjids: [
      ["Jamia Kanzul Imaan", "Albion Street, WF16 9LQ", ["1:20"]],
      ["Jamia Al-Haramain", "Ings Road, WF16 9HZ", ["1:30", "3:30+"]]
    ]
  },
  {
    area: "Batley", masjids: [
      ["M. Ghausia Masjid", "1 Whitaker Street, WF17 5AQ", ["1:30", "3:30+"]],
      ["M. Ghausia Madrassa", "111 Dark Lane, WF17 7PW", ["1:20"]],
      ["Jamia Al Saeed", "160 Bromley Street, WF17 6LB", ["1:30"]]
    ]
  },
  {
    area: "Dewsbury", masjids: [
      ["Jamia Abu Bakr Saddique", "Ernest Street, WF13 1PR", ["1:30"]],
      ["Gulzar e Madina", "3 High St, Westtown, WF13 2PU", ["2:00"]],
      ["Muhaddis e Azam", "225c Ravenshouse Rd, WF13 3QU", ["1:30"]],
      ["Faizan e Madina", "11a Pilgrim Ave, WF13 3NQ", ["1:30"]]
    ]
  },
  {
    area: "Savile Town", masjids: [
      ["Masjid Raza", "399 Lees Hall Rd, WF12 9HB", ["1:30"]],
      ["Ghareeb Nawaz Mosque", "178 Savile Road, WF12 9NS", ["1:30"]],
      ["Makki Madani Masjid", "31-33 Kertland St, WF12 9PU", ["1:30"]],
      ["Ghausia Masjid", "21-27 Warren Street, WF12 9LU", ["2:00", "3:45"], "U"]
    ]
  },
  {
    area: "Ravensthorpe", masjids: [
      ["Anwar e Madina STI", "Crawshaw Street, WF13 3ER", ["2:00"]],
      ["Ghausia Masjid", "27 North Road, WF13 3AB", ["2:15"]],
      ["Naqshbandiyya Aslamiyya", "130 North Road, WF13 3AQ", ["1:30"]],
      ["Faizan e Madina", "5 John Street, WF13 3LE", ["1:30"]]
    ]
  },
  {
    area: "Wakefield", masjids: [
      ["Jamia Masjid Swafia", "Park Hill Lane, WF1 4NJ", ["1:30", "2:30"]],
      ["Ghousia Masjid Institute", "38 Duke of York St, WF1 3PD", ["1:30", "2:15"]],
      ["Madina Masjid", "82-84 St Catherine St, WF1 5BP", ["1:30"], "L"],
      ["Markazi Jamia Mosque", "12 Grange Street, WF2 8TF", ["1:30", "2:30"], "L"]
    ]
  }
];