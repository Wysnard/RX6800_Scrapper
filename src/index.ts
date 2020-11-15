import "reflect-metadata";
import _ from "lodash";
import nodemailer from "nodemailer";
import { createConnection, getMongoRepository } from "typeorm";
import { Product } from "./entity/Product";
import scrap_ldlc from "./scrapper/ldlc";
import scrap_materiel from "./scrapper/materiel";
import scrap_cybertek from "./scrapper/cybertek";

require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

createConnection()
  .then(async (connection) => {
    console.log("Enjoy the scraping HEYO!.");
    setInterval(async () => {
      const date_ob = new Date();
      const date_str = `[${date_ob.getFullYear()}-${date_ob.getMonth()}-${date_ob.getDate()} ${date_ob.getHours()}:${date_ob.getMinutes()}:${date_ob.getSeconds()}]`;
      // console.log(date_str);
      const scrapping_result = await Promise.all([
        scrap_ldlc(),
        scrap_materiel(),
        scrap_cybertek(),
      ]);
      // console.log(scrapping_result);
      const product_list = scrapping_result
        .reduce((acc, val) => acc.concat(val))
        .filter((item) => {
          return (
            item.price > 450 &&
            item.price < 1100 &&
            item.title.includes("RX 5700")
          );
        });

      // console.log("Loading rxs from the database...");
      const products = await connection.manager.find(Product);
      const product_diff = _.differenceBy(product_list, products, "link");
      // console.log("Product scrapped: ", product_list[0]);
      // console.log("=== ===");
      // console.log("Product DB: ", products_cleared[0]);
      // console.log("((( )))");
      console.log(`${date_str} Product diff: `, product_diff);

      if (product_diff.length > 0) {
        console.log(`${date_str} Inserting new products into the database...`);
        // const product = new Product("AMD Radeon Rx 6800", "www.example.fr", 500);
        await getMongoRepository(Product).insertMany(product_diff);
        // console.log("Saved a new rx with id: " + product.id);

        const current_products = await connection.manager.find(Product);

        const content = current_products
          .map((item) => {
            return `
            <div>
              <a href="${item.link}">${item.title}</a>
              <b>${item.price}€</b>
            </div>
          `;
          })
          .join("");

        const mailOptions = {
          from: "RX6800scrapper@gmail.com",
          to: process.env.TO.split(" "),
          subject: "RX 6800 Scrapping Update!",
          html: content,
        };
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) console.log(error);
          else if (info) console.log("Email sent: " + info.response);
        });
      }
    }, 5000);
  })
  .catch((error) => console.log(error));
