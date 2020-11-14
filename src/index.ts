import "reflect-metadata";
import axios from "axios";
import { JSDOM } from "jsdom";
import nodemailer from "nodemailer";
import { createConnection } from "typeorm";
import { Product } from "./entity/Product";

require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

function scrap_ldlc() {
  return axios
    .get("https://www.ldlc.com/recherche/amd%20rx%206800/")
    .then((response) => {
      const dom = new JSDOM(response.data);
      const products = dom.window.document
        .querySelector("div.listing-product")
        .querySelector("ul")
        .querySelectorAll("li");

      const product_list: Product[] = [];
      products.forEach((item) => {
        const info = item.querySelector(".pdt-info");
        const description = info.querySelector(".pdt-desc");
        const title = description.querySelector(".title-3");
        const price = item.querySelector(".price.price");
        const link = title.querySelector("a");
        const product = new Product(
          title.textContent,
          "https://www.ldlc.com" + link.href,
          Number(price.textContent.replace(/\s/g, "").replace("€", "."))
        );
        product_list.push(product);
      });
      return product_list;
    })
    .catch((error) => {
      console.log(error);
      return [] as Product[];
    });
}

function scrap_materiel() {
  return axios
    .get("https://www.materiel.net/recherche/amd%20rx%206800/?department=424")
    .then((response) => {
      const dom = new JSDOM(response.data);
      const products = dom.window.document
        .querySelector("ul.c-products-list")
        .querySelectorAll("li");

      const product_list: Product[] = [];
      products.forEach((item) => {
        const info = item.querySelector(".c-product__meta");
        const link = info.querySelector("a");
        const title = link.querySelector(".c-product__title");
        const price = item.querySelector(".c-product__prices");
        const product = new Product(
          title.textContent,
          "https://www.materiel.net" + link.href,
          Number(price.textContent.replace(/\s/g, "").replace("€", "."))
        );
        product_list.push(product);
      });
      return product_list;
    })
    .catch((error) => {
      console.log(error);
      return [] as Product[];
    });
}

createConnection()
  .then(async (connection) => {
    console.log("Processing the scrapping...");
    const scrapping_result = await Promise.all([
      scrap_ldlc(),
      scrap_materiel(),
    ]);
    const product_list = scrapping_result.reduce((acc, val) => acc.concat(val));

    const content = product_list
      .map((product) => {
        return `
      <div>
        <a href="${product.link}">${product.title}</a>
        <b>${product.price}€</b>
      </div>
    `;
      })
      .join("");

    console.log("Inserting new products into the database...");
    // const product = new Product("AMD Radeon Rx 6800", "www.example.fr", 500);
    await connection.manager.save(product_list);
    // console.log("Saved a new rx with id: " + product.id);

    console.log("Loading rxs from the database...");
    const products = await connection.manager.find(Product);
    console.log("Loaded rxs: ", products);

    const mailOptions = {
      from: "RX6800scrapper@gmail.com",
      to: "vincent.lay77@gmail.com",
      subject: "RX 6800 Scrapping Update!",
      html: content,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) console.log(error);
      else if (info) console.log("Email sent: " + info.response);
    });

    console.log("Here you can setup and run express/koa/any other framework.");
    setInterval(() => console.log("hello"), 1000);
    return null;
  })
  .catch((error) => console.log(error));
