import { scheduleJob } from "node-schedule";
import { budgetModel } from "../models/budget.model";
import { fn, literal, Op } from "sequelize";
import { contiModel } from "../models/conti.model";
import { utentiModel } from "../models/utenti.model";
import { entrateFisseModel } from "../models/entrateFisse.model";

export default defineNitroPlugin((nitroApp) => {
  const controllaScadenze = async () => {
    const utenti = await utentiModel.findAll({
      attributes: ["email"],
    });

    for (const ut of utenti) {
      const utente = ut.dataValues.email;
      const conti = await contiModel.findAll({
        attributes: ["id", "nome", "soldi"],
        where: {
          utente: utente,
        },
      });

      const uscite = await prendiUscite(
        await prendiCategorie("budget", utente),
        utente,
        "budget"
      );

      const budgets = await budgetModel.findAll({
        attributes: [
          "id",
          "nome",
          "soldiUsati",
          "contoCollegato",
          "durataRipetizione",
        ],
        where: {
          prossimaRipetizione: { [Op.lte]: fn("NOW") },
          utente: utente,
        },
      });

      const entrateFisse = await entrateFisseModel.findAll({
        attributes: [
          "id",
          "nome",
          "soldi",
          "contoCollegato",
          "durataRipetizione",
        ],
        where: {
          prossimaRipetizione: { [Op.lte]: fn("NOW") },
          utente: utente,
        },
      });

      for (const budget of budgets) {
        uscite
          .filter(
            (x) =>
              x.budget === budget.dataValues.nome &&
              moment(x.updatedAt).isSameOrAfter(
                calcolaPeriodoIniziale(
                  budget.dataValues.prossimaRipetizione,
                  budget.dataValues.durataRipetizione
                )
              )
          )
          .forEach((x) => {
            budget.dataValues.soldiUsati += x.soldi;
          });

        if (exist(budget.dataValues.contoCollegato)) {
          const idConto = conti.find(
            (c) => c.dataValues.nome === budget.dataValues.contoCollegato
          ).dataValues.id;

          await contiModel.update(
            {
              soldi: literal("soldi - " + budget.dataValues.soldiUsati),
            },
            {
              where: {
                id: idConto,
              },
            }
          );
        }

        const durataRipetizione = budget.dataValues.durataRipetizione;

        await budgetModel.update(
          {
            soldiUsati: 0,
            prossimaRipetizione: calcolaPeriodo(
              durataRipetizione.slice(0, durataRipetizione.indexOf(";")),
              durataRipetizione.slice(
                durataRipetizione.indexOf(";") + 1,
                durataRipetizione.length
              )
            ),
          },
          {
            where: {
              id: budget.dataValues.id,
            },
          }
        );
      }

      for (const entrataFissa of entrateFisse) {
        if (exist(entrataFissa.dataValues.contoCollegato)) {
          const idConto = conti.find(
            (x) => x.dataValues.nome === entrataFissa.dataValues.contoCollegato
          ).dataValues.id;

          await contiModel.update(
            {
              soldi: literal("soldi + " + entrataFissa.dataValues.soldi),
            },
            {
              where: {
                id: idConto,
              },
            }
          );
        }

        const durataRipetizione = entrataFissa.dataValues.durataRipetizione;

        await entrateFisseModel.update(
          {
            prossimaRipetizione: calcolaPeriodo(
              durataRipetizione.slice(0, durataRipetizione.indexOf(";")),
              durataRipetizione.slice(
                durataRipetizione.indexOf(";") + 1,
                durataRipetizione.length
              )
            ),
          },
          {
            where: {
              id: entrataFissa.dataValues.id,
            },
          }
        );
      }
    }
  };

  scheduleJob("1 0 * * *", controllaScadenze);
  // controllaScadenze();
});
