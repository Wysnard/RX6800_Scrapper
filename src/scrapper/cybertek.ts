import axios from "axios";
import { JSDOM } from "jsdom";
import { Product } from "../entity/Product";

export default function scrap_cybertek() {
  return axios
    .get("https://www.cybertek.fr/boutique/produit.aspx?q=rx%2b6800")
    .then((response) => {
      //   console.log(response.data);
      const dom = new JSDOM(response.data);
      const products = dom.window.document
        .querySelector("div#cbk_page_container")
        .querySelector("div#cbk_content_container")
        .querySelector("div#content_product")
        .querySelector("div.warp")
        .querySelector("div.categorie-r.categorie-block-r")
        .querySelector("div.categorie-filtre.lst_grid")
        .querySelectorAll("div");

      //   console.log(products.textContent);

      const product_list: Product[] = [];
      products.forEach((item) => {
        const info = item.querySelector("div.nom-produit");
        if (!info) return;
        // console.log(info.textContent);
        const description = info.querySelector(".product_constructeur3");
        const title = description
          .querySelector("div.height-txt-cat")
          .querySelector("h2");
        // console.log(title.textContent);
        const link = description.querySelector("a");
        // console.log(link.href);
        const price = item
          .querySelector("div.prix-produit")
          .querySelector("div.price_prod_resp")
          .querySelector("span");
        // console.log(price.textContent);
        const product = new Product(
          title.textContent,
          link.href,
          Number(price.textContent.replace(/\s/g, "").replace("€", "."))
        );
        product_list.push(product);
      });
      return product_list.filter((item) => !!item);
    })
    .catch((error) => {
      console.log(error);
      return [] as Product[];
    });
}
