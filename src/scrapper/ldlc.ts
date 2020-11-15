import axios from "axios";
import { JSDOM } from "jsdom";
import { Product } from "../entity/Product";

export default function scrap_ldlc() {
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
