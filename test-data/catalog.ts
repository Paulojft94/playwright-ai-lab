import { backpack, bikeLight } from "./products";

export const catalog = [
  backpack,
  bikeLight,
  { name: "Sauce Labs Bolt T-Shirt", price: "$15.99" },
  { name: "Sauce Labs Fleece Jacket", price: "$49.99" },
  { name: "Sauce Labs Onesie", price: "$7.99" },
  { name: "Test.allTheThings() T-Shirt (Red)", price: "$15.99" },
] as const;
