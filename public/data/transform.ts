// transform.js
const fs = require('fs')

// 1) Load your original file here:
const original = JSON.parse(fs.readFileSync('config.json', 'utf8'))

// 2) Define three default resources per category:
const DEFAULT_RESOURCES = {
  Treatments: [
    {
      DisplayOrder: 1,
      IsActive: true,
      Name: "American Academy of Medical Acupuncture",
      Link: "https://medicalacupuncture.org/",
      Summary: "Research articles and educational resources on acupuncture practice."
    },
    {
      DisplayOrder: 2,
      IsActive: true,
      Name: "NIH NCCIH – Acupuncture",
      Link: "https://www.nccih.nih.gov/health/acupuncture",
      Summary: "Evidence-based information on acupuncture from the U.S. National Institutes of Health."
    },
    {
      DisplayOrder: 3,
      IsActive: true,
      Name: "PubMed: Acupuncture Studies",
      Link: "https://pubmed.ncbi.nlm.nih.gov/?term=acupuncture",
      Summary: "Peer-reviewed research articles evaluating acupuncture effectiveness."
    }
  ],
  Skills: [
    {
      DisplayOrder: 1,
      IsActive: true,
      Name: "Berklee Online Practice Tips",
      Link: "https://online.berklee.edu/practice",
      Summary: "Guidance on effective practice routines for musicians."
    },
    {
      DisplayOrder: 2,
      IsActive: true,
      Name: "SmartPractice (Peters)",
      Link: "https://www.peters.com/smartpractice",
      Summary: "Techniques to make every practice minute count."
    },
    {
      DisplayOrder: 3,
      IsActive: true,
      Name: "MusicPractice.net",
      Link: "https://www.musicpractice.net/",
      Summary: "Community-sourced tips on overcoming common practice challenges."
    }
  ],
  Exercise: [
    {
      DisplayOrder: 1,
      IsActive: true,
      Name: "American College of Sports Medicine",
      Link: "https://www.acsm.org/",
      Summary: "Evidence-based guidelines on exercise and fitness."
    },
    {
      DisplayOrder: 2,
      IsActive: true,
      Name: "WHO Physical Activity Fact Sheet",
      Link: "https://www.who.int/news-room/fact-sheets/detail/physical-activity",
      Summary: "Global recommendations on physical activity for health."
    },
    {
      DisplayOrder: 3,
      IsActive: true,
      Name: "Strava Blog",
      Link: "https://blog.strava.com/",
      Summary: "Tips and community insights on tracking your workouts."
    }
  ],
  Behavior: [
    {
      DisplayOrder: 1,
      IsActive: true,
      Name: "James Clear – Habits Guide",
      Link: "https://jamesclear.com/habits",
      Summary: "Science-backed techniques for building good habits and breaking bad ones."
    },
    {
      DisplayOrder: 2,
      IsActive: true,
      Name: "Tiny Habits (BJ Fogg)",
      Link: "https://tinyhabits.com/",
      Summary: "A simple, step-by-step system for creating lasting behavior change."
    },
    {
      DisplayOrder: 3,
      IsActive: true,
      Name: "Habitica",
      Link: "https://habitica.com/",
      Summary: "Gamified habit tracking and productivity app."
    }
  ],
  Medical: [
    {
      DisplayOrder: 1,
      IsActive: true,
      Name: "MedlinePlus",
      Link: "https://medlineplus.gov/",
      Summary: "Trusted health information from the U.S. National Library of Medicine."
    },
    {
      DisplayOrder: 2,
      IsActive: true,
      Name: "Mayo Clinic",
      Link: "https://www.mayoclinic.org/",
      Summary: "Patient care & health information from Mayo Clinic experts."
    },
    {
      DisplayOrder: 3,
      IsActive: true,
      Name: "WebMD",
      Link: "https://www.webmd.com/",
      Summary: "Comprehensive medical reference and symptom checker."
    }
  ],
  "Self-Care": [
    {
      DisplayOrder: 1,
      IsActive: true,
      Name: "Mindful.org",
      Link: "https://www.mindful.org/",
      Summary: "Resources and exercises for mindfulness practice."
    },
    {
      DisplayOrder: 2,
      IsActive: true,
      Name: "Psychology Today – Self Care",
      Link: "https://www.psychologytoday.com/us/basics/self-care",
      Summary: "Articles and tips on developing a self-care routine."
    },
    {
      DisplayOrder: 3,
      IsActive: true,
      Name: "Verywell Mind",
      Link: "https://www.verywellmind.com/self-care-strategies-overall-4177944",
      Summary: "Science-backed strategies for mental health and self-care."
    }
  ],
  Home: [
    {
      DisplayOrder: 1,
      IsActive: true,
      Name: "The Spruce",
      Link: "https://www.thespruce.com/",
      Summary: "Practical tips for home cleaning, organization, and decor."
    },
    {
      DisplayOrder: 2,
      IsActive: true,
      Name: "Good Housekeeping",
      Link: "https://www.goodhousekeeping.com/home/",
      Summary: "Expert advice on chores, maintenance, and household supplies."
    },
    {
      DisplayOrder: 3,
      IsActive: true,
      Name: "Apartment Therapy",
      Link: "https://www.apartmenttherapy.com/",
      Summary: "Home styling and organization hacks for every space."
    }
  ],
  Learning: [
    {
      DisplayOrder: 1,
      IsActive: true,
      Name: "Coursera",
      Link: "https://www.coursera.org/",
      Summary: "Wide range of online courses from top universities."
    },
    {
      DisplayOrder: 2,
      IsActive: true,
      Name: "Khan Academy",
      Link: "https://www.khanacademy.org/",
      Summary: "Free, world-class educational resources on many subjects."
    },
    {
      DisplayOrder: 3,
      IsActive: true,
      Name: "edX",
      Link: "https://www.edx.org/",
      Summary: "High-quality courses from leading institutions worldwide."
    }
  ]
}

// 3) Build the new structure:
const output = {}
for (const category of Object.keys(original)) {
  output[category] = {
    resources: DEFAULT_RESOURCES[category] || [],
    templates: Object.entries(original[category]).map(([tmplKey, fields]) => ({
      id: tmplKey.trim(),
      label: tmplKey.trim(),
      fields: fields.map((f, i) => ({
        DisplayOrder: i + 1,
        IsActive: false,
        ...f
      }))
    }))
  }
}

// 4) Print prettified JSON to stdout:
console.log(JSON.stringify(output, null, 2))
