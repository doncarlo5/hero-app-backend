const ProgramConstants = {
    "Upper A": [
      {
        name: "Développé incliné - Barre",
        alternatives: ["Développé incliné - Haltères"],
      },
      { name: "Tractions lestées", alternatives: ["Rowing Bucheron - Haltères"] },
      { name: "Élévation frontale - Haltères", alternatives: [] },
      {
        name: "Curl Incliné - Haltères",
        alternatives: ["Curl Incliné - Barre EZ", "Curl Incliné - Poulie"],
      },
      { name: "Élévation latérales - Haltères", alternatives: [] },
    ],
    Lower: [
      { name: "Squat - Barre", alternatives: [] },
      {
        name: "Press",
        alternatives: [
          "Dead Lift - Trap Bar",
          "Fentes - Haltères",
          "Fentes - Barre",
          "Romanian Deadlift - Haltères",
        ],
      },
      { name: "Leg Curl", alternatives: [] },
      { name: "Leg Extension", alternatives: [] },
      {
        name: "Mollets - Barre Guidée",
        alternatives: ["Mollets - Barre", "Mollets - Leg Press"],
      },
      { name: "Upright Row Penché", alternatives: [] },
    ],
    "Upper B": [
      {
        name: "Overhead Press - Barre",
        alternatives: ["Développé assis - Haltères"],
      },
      {
        name: "Développé couché - Barre",
        alternatives: ["Développé couché - Haltères"],
      },
      { name: "Tractions Neutres", alternatives: ["Curl Marteau - Haltères"] },
      {
        name: "Oiseau assis - Haltères",
        alternatives: ["Face Pull - Poulie Haute", "Face Pull - Rotation"],
      },
      { name: "Upright Row - Haltères", alternatives: [] },
    ],
    "Séance A": [
      {
        name: "Développé incliné - Barre",
        alternatives: ["Développé incliné - Haltères"],
      },
      {
        name: "Tractions lestées",
        alternatives: ["Tractions lestées prise neutre"],
      },
      { name: "ATG Split Squat - Haltères", alternatives: [] },
      { name: "Upright Row - Haltères", alternatives: [] },
      {
        name: "Curl Incliné - Haltères",
        alternatives: ["Curl Incliné - Barre EZ", "Curl Incliné - Poulie"],
      },
    ],
    "Séance B": [
      { name: "Dips lestés", alternatives: [] },
      { name: "Rowing Bucheron - Haltères", alternatives: [] },
      { name: "Romanian Deadlift - Barre", alternatives: [] },
      { name: "Upright Row - Haltères", alternatives: [] },
      { name: "Extension Triceps Nuque - Haltères", alternatives: [] },
    ],
  };

module.exports = ProgramConstants;