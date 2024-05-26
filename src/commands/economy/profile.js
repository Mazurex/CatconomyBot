const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const moneys = require("../../models/moneys");
const bankTier = require("../../handlers/bankTier");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("profile")
    .setDescription("Display your profile")
    .addStringOption((option) =>
      option
        .setName("category")
        .setDescription("What category should be opened")
        .addChoices(
          { name: "Main", value: "main" },
          { name: "Skills", value: "skills" },
          { name: "Inventory", value: "inventory" }
        )
    ),
  async execute(interaction) {
    const category = interaction.options.getString("category") ?? "main";

    try {
      const profile = await moneys.findOne({ userId: interaction.user.id });

      const cat = profile.cat[0];

      if (category === "main") {
        const embed = new EmbedBuilder()
          .setColor("Green")
          .setTitle(`${interaction.user.username}'s profile`)
          .addFields(
            {
              name: "Balance",
              value: `<:coin:1243888785025138749> ${profile.economy.coins}`,
              inline: true,
            },
            {
              name: "Bank Balance",
              value: `<:bank:1244368716066455712> [ ${
                profile.economy.bank
              } / ${bankTier(profile.economy.bankTier)} ]`,
              inline: true,
            },
            {
              name: "Bank Tier",
              value: `<:tiers:1244368717941571705> Tier ${profile.economy.bankTier}`,
              inline: true,
            },
            {
              name: "Level",
              value: `[ ${cat.level} / 100 ]`,
              inline: false,
            },
            {
              name: "XP",
              value: `[ ${cat.xp} / ${Math.floor(
                (cat.level * 2 + 5) / 0.15
              )} ]`,
              inline: false,
            }
          );
        interaction.reply({ embeds: [embed] });
      } else if (category === "skills") {
        const embed = new EmbedBuilder()
          .setColor("Blue")
          .setTitle(`${interaction.user.username}'s skills`)
          .setDescription(`View the skills of ${cat.name}`);

        Object.keys(cat.skills).forEach((skill) => {
          embed.addFields({
            name: skill.charAt(0).toUpperCase() + skill.slice(1),
            value: cat.skills[skill].toString(),
            inline: true,
          });
        });

        interaction.reply({ embeds: [embed] });
      } else if (category === "inventory") {
        // ...
      }
    } catch (err) {
      console.log(err);
      interaction.reply({
        content: "There was a problem with fetching user data",
        ephemeral: true,
      });
    }
  },
};
