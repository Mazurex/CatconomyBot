const moneys = require("../models/moneys");
const bankTier = require("../handlers/bankTier");

const applyInterest = async (userId) => {
  const interestRate = 0.02;

  try {
    const profile = await moneys.findOne({ userId });

    if (!profile) return;

    const cat = profile.cat[0];
    const intelligenceMultiplier = cat.skills.intelligence / 10;
    let realInterestRate = interestRate * intelligenceMultiplier;
    if (realInterestRate <= 0) realInterestRate = 1;

    const now = new Date();
    const lastInterest = profile.economy.lastInterest ?? new Date(0);
    const diffTime = Math.abs(now - lastInterest);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays >= 1 && profile.economy.bank > 0) {
      const interest = Math.floor(profile.economy.bank * realInterestRate);

      if (
        profile.economy.bank + interest >
        bankTier(profile.economy.bankTier)
      ) {
        profile.economy.coins += interest;
      } else {
        profile.economy.bank += interest;
      }
      profile.economy.lastInterest = now;
      await profile.save();

      return interest;
    }
  } catch (err) {
    console.error("Error applying interest: ", err);
  }
  return 0;
};

module.exports = applyInterest;
