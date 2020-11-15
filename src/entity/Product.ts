import {
  Entity,
  ObjectIdColumn,
  ObjectID,
  Column,
  PrimaryColumn,
} from "typeorm";

@Entity()
export class Product {
  @ObjectIdColumn()
  id: ObjectID;

  @Column()
  title: string;

  @PrimaryColumn()
  link: string;

  @Column()
  price: number;

  constructor(title: string, link: string, price: number) {
    this.title = title;
    this.link = link;
    this.price = price;
  }
}
