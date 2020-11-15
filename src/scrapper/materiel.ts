import axios from "axios";
import { JSDOM } from "jsdom";
import { Product } from "../entity/Product";

export default function scrap_materiel() {
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
