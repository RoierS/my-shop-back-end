import { IProduct } from "../interfaces/Product";
import { v4 as uuidv4 } from 'uuid';

export const products: IProduct[] = [
  {
    id: uuidv4(),
    title: "T-Shirt",
    description: "Comfortable cotton t-shirt for everyday wear",
    price: 19.99,
  },
  {
    id: uuidv4(),
    title: "Jeans",
    description: "Classic denim jeans with a modern fit",
    price: 39.99,
  },
  {
    id: uuidv4(),
    title: "Dress",
    description: "Elegant evening dress for special occasions",
    price: 79.99,
  },
  {
    id: uuidv4(),
    title: "Sweater",
    description: "Cozy knit sweater for chilly days",
    price: 29.99,
  },
  {
    id: uuidv4(),
    title: "Jacket",
    description: "Stylish leather jacket for a rugged look",
    price: 129.99,
  },
  {
    id: uuidv4(),
    title: "Skirt",
    description: "Floral print skirt perfect for springtime",
    price: 24.99,
  },
  {
    id: uuidv4(),
    title: "Shorts",
    description: "Casual shorts ideal for summer adventures",
    price: 15.99,
  },
  {
    id: uuidv4(),
    title: "Blouse",
    description: "Chic blouse with intricate lace detailing",
    price: 34.99,
  },
  {
    id: uuidv4(),
    title: "Suit",
    description: "Tailored suit for a polished and professional look",
    price: 199.99,
  },
  {
    id: uuidv4(),
    title: "Sneakers",
    description: "Sporty sneakers for active lifestyles",
    price: 59.99,
  },
];