// #region model import
import { budgetModel } from "../models/budget.model";
import { categorieModel } from "../models/categorie.model";
import { contiModel } from "../models/conti.model";
import { entrateModel } from "../models/entrate.model";
import { obiettiviModel } from "../models/obiettivi.model";
import { usciteModel } from "../models/uscite.model";
import { utentiModel } from "../models/utenti.model";
import { entrateFisseModel } from "../models/entrateFisse.model";
// #endregion

export default defineNitroPlugin(async (nitro) => {
  try {
    await sequelize.sync();
    // #region reset/creation model
    // await sequelize.sync({force: true, alter: true});
    // await utentiModel.sync({force: true, alter: true});
    // await budgetModel.sync({force: true, alter: true});
    // await obiettiviModel.sync({force: true, alter: true});
    // await contiModel.sync({force: true, alter: true});
    // await entrateModel.sync({force: true, alter: true});
    // await usciteModel.sync({force: true, alter: true});
    // await categorieModel.sync({ force: true, alter: true });
    // await entrateFisseModel.sync({ force: true, alter: true });
    // #endregion
    console.log("connessione database riuscita");
  } catch (error) {
    console.error("connessione database fallita:\n" + error);
  }
});
